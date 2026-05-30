package handler

import (
	"net/http"

	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/encoding/protojson"
	"google.golang.org/protobuf/proto"
)

// grpcConn wraps a gRPC connection for convenient closing
type grpcConn struct {
	conn *grpc.ClientConn
}

func (g *grpcConn) Close() {
	if g.conn != nil {
		g.conn.Close()
	}
}

var marshaler = protojson.MarshalOptions{
	UseProtoNames:   true,
	EmitUnpopulated: true,
}

var unmarshaler = protojson.UnmarshalOptions{
	DiscardUnknown: true,
}

// writeProto marshals a proto message to JSON with snake_case field names
func writeProto(w http.ResponseWriter, msg proto.Message) {
	data, err := marshaler.Marshal(msg)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to encode response")
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(data)
}

// readProto unmarshals a JSON request body into a proto message
func readProto(r *http.Request, msg proto.Message) error {
	return readProtoStream(r, msg)
}

func handleGRPCError(w http.ResponseWriter, err error) {
	st, ok := status.FromError(err)
	if ok {
		switch st.Code() {
		case codes.NotFound:
			writeError(w, http.StatusNotFound, st.Message())
		case codes.InvalidArgument:
			writeError(w, http.StatusBadRequest, st.Message())
		case codes.PermissionDenied:
			writeError(w, http.StatusForbidden, st.Message())
		case codes.Unauthenticated:
			writeError(w, http.StatusUnauthorized, st.Message())
		case codes.Unavailable:
			writeError(w, http.StatusServiceUnavailable, "backend service unavailable")
		default:
			writeError(w, http.StatusInternalServerError, st.Message())
		}
	} else {
		writeError(w, http.StatusInternalServerError, err.Error())
	}
}
