package handler

import (
	"encoding/json"
	"io"
	"net/http"

	"lms-gateway/internal/grpcclient"

	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/encoding/protojson"
	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/types/dynamicpb"
	"google.golang.org/protobuf/types/known/emptypb"
)

// grpcProxy is a generic helper that:
// 1. Connects to a gRPC service
// 2. Sends a request (raw JSON -> protobuf via protojson or raw bytes)
// 3. Returns the response as JSON
func grpcProxy(w http.ResponseWriter, r *http.Request, serviceAddr, method string, reqMsg proto.Message) {
	conn, err := grpcclient.Dial(serviceAddr)
	if err != nil {
		writeError(w, http.StatusServiceUnavailable, "service unavailable")
		return
	}
	defer conn.Close()

	ctx := grpcclient.ContextWithMetadata(r)

	respMsg := &dynamicpb.Message{}
	_ = respMsg

	// Use raw codec approach
	var reqBytes []byte
	if reqMsg != nil {
		reqBytes, err = proto.Marshal(reqMsg)
		if err != nil {
			writeError(w, http.StatusBadRequest, "failed to encode request")
			return
		}
	} else {
		reqBytes = []byte{}
	}

	var respBytes rawMessage
	err = conn.Invoke(ctx, method, &rawMessage{data: reqBytes}, &respBytes, grpc.ForceCodec(rawCodec{}))
	if err != nil {
		st, ok := status.FromError(err)
		if ok {
			switch st.Code() {
			case codes.NotFound:
				writeError(w, http.StatusNotFound, st.Message())
			case codes.InvalidArgument:
				writeError(w, http.StatusBadRequest, st.Message())
			case codes.PermissionDenied:
				writeError(w, http.StatusForbidden, st.Message())
			default:
				writeError(w, http.StatusInternalServerError, st.Message())
			}
		} else {
			writeError(w, http.StatusInternalServerError, err.Error())
		}
		return
	}

	// Convert protobuf response to JSON using protojson
	jsonBytes, err := protojsonMarshal(respBytes.data)
	if err != nil {
		// Fallback: return raw base64 if protojson fails
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write(respBytes.data)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(jsonBytes)
}

// protojsonMarshal attempts to convert raw protobuf bytes to JSON
// Since we don't have the message descriptors, we use a simple approach
func protojsonMarshal(data []byte) ([]byte, error) {
	// Try to unmarshal as an empty message first to validate
	msg := &emptypb.Empty{}
	_ = msg
	// For the gateway, we'll use a custom JSON conversion
	// that parses the protobuf wire format into JSON
	return protoToJSON(data)
}

// protoToJSON converts raw protobuf wire format to a JSON object
// This is a simplified parser for the common field types used in our services
func protoToJSON(data []byte) ([]byte, error) {
	result := parseProtoFields(data)
	return json.Marshal(result)
}

// Unused import suppression
var _ = protojson.MarshalOptions{}
var _ = io.EOF
