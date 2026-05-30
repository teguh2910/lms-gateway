package handler

import (
	"encoding/json"
	"net/http"

	"lms-gateway/internal/grpcclient"

	"google.golang.org/grpc"
	"google.golang.org/protobuf/encoding/protowire"
)

func UploadFile(w http.ResponseWriter, r *http.Request) {
	// For streaming upload, we accept multipart form data
	// and return a mock response since streaming gRPC requires
	// a different approach
	err := r.ParseMultipartForm(32 << 20) // 32MB max
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid multipart form")
		return
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		writeError(w, http.StatusBadRequest, "file field required")
		return
	}
	defer file.Close()

	// Return a mock response with file metadata
	// In production, this would stream to the storage service
	resp := map[string]interface{}{
		"id":        "generated-file-id",
		"filename":  header.Filename,
		"size":      header.Size,
		"mime_type": header.Header.Get("Content-Type"),
		"url":       "/api/storage/generated-file-id",
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(resp)
}

func GetFile(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	addr := grpcclient.GetAddresses().StorageService
	conn, err := grpcclient.Dial(addr)
	if err != nil {
		writeError(w, http.StatusServiceUnavailable, "storage service unavailable")
		return
	}
	defer conn.Close()

	ctx := grpcclient.ContextWithMetadata(r)

	var buf []byte
	buf = protowire.AppendTag(buf, 1, protowire.BytesType)
	buf = protowire.AppendString(buf, id)

	var resp rawMessage
	err = conn.Invoke(ctx, "/storages.StorageService/GetFile", &rawMessage{data: buf}, &resp, grpc.ForceCodec(rawCodec{}))
	if err != nil {
		handleGRPCError(w, err)
		return
	}

	writeProtoJSON(w, resp.data)
}

func DeleteFile(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	addr := grpcclient.GetAddresses().StorageService
	invokeDelete(w, r, addr, "/storages.StorageService/Delete", id)
}
