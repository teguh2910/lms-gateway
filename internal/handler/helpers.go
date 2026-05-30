package handler

import (
	"encoding/json"
	"io"
	"net/http"
	"strconv"

	"google.golang.org/protobuf/proto"
)

func writeJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, map[string]string{"error": message})
}

// readProtoStream reads the entire request body and unmarshals JSON into a proto message
func readProtoStream(r *http.Request, msg proto.Message) error {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		return err
	}
	if len(body) == 0 {
		return nil
	}
	return unmarshaler.Unmarshal(body, msg)
}

func parseUint(s string) uint32 {
	v, _ := strconv.ParseUint(s, 10, 32)
	return uint32(v)
}
