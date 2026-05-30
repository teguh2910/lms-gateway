package handler

import (
	"net/http"
	"strconv"

	"lms-gateway/internal/grpcclient"

	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/encoding/protowire"
)

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
		default:
			writeError(w, http.StatusInternalServerError, st.Message())
		}
	} else {
		writeError(w, http.StatusInternalServerError, err.Error())
	}
}

func writeProtoJSON(w http.ResponseWriter, data []byte) {
	jsonBytes, err := protoToJSON(data)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"raw":true}`))
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(jsonBytes)
}

func invokeDelete(w http.ResponseWriter, r *http.Request, addr, method, id string) {
	conn, err := grpcclient.Dial(addr)
	if err != nil {
		writeError(w, http.StatusServiceUnavailable, "service unavailable")
		return
	}
	defer conn.Close()

	ctx := grpcclient.ContextWithMetadata(r)

	var buf []byte
	buf = protowire.AppendTag(buf, 1, protowire.BytesType)
	buf = protowire.AppendString(buf, id)

	var resp rawMessage
	err = conn.Invoke(ctx, method, &rawMessage{data: buf}, &resp, grpc.ForceCodec(rawCodec{}))
	if err != nil {
		handleGRPCError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, map[string]bool{"success": true})
}

func appendStringField(buf []byte, fieldNum uint64, input map[string]interface{}, key string) []byte {
	if val, ok := input[key]; ok {
		if s, ok := val.(string); ok && s != "" {
			buf = protowire.AppendTag(buf, protowire.Number(fieldNum), protowire.BytesType)
			buf = protowire.AppendString(buf, s)
		}
	}
	return buf
}

func appendIntField(buf []byte, fieldNum uint64, input map[string]interface{}, key string) []byte {
	if val, ok := input[key]; ok {
		switch v := val.(type) {
		case float64:
			buf = protowire.AppendTag(buf, protowire.Number(fieldNum), protowire.VarintType)
			buf = protowire.AppendVarint(buf, uint64(int32(v)))
		case int:
			buf = protowire.AppendTag(buf, protowire.Number(fieldNum), protowire.VarintType)
			buf = protowire.AppendVarint(buf, uint64(v))
		}
	}
	return buf
}

func appendBoolField(buf []byte, fieldNum uint64, input map[string]interface{}, key string) []byte {
	if val, ok := input[key]; ok {
		if b, ok := val.(bool); ok && b {
			buf = protowire.AppendTag(buf, protowire.Number(fieldNum), protowire.VarintType)
			buf = protowire.AppendVarint(buf, 1)
		}
	}
	return buf
}

func parseUint(s string) uint32 {
	v, _ := strconv.ParseUint(s, 10, 32)
	return uint32(v)
}
