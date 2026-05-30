package handler

import (
	"io"
	"net/http"

	"lms-gateway/internal/grpcclient"
	storagespb "lms-gateway/pb/storage/storages"
)

func storageConn(w http.ResponseWriter) (*grpcConn, bool) {
	addr := grpcclient.GetAddresses().StorageService
	conn, err := grpcclient.Dial(addr)
	if err != nil {
		writeError(w, http.StatusServiceUnavailable, "storage service unavailable")
		return nil, false
	}
	return &grpcConn{conn: conn}, true
}

func UploadFile(w http.ResponseWriter, r *http.Request) {
	// Parse multipart form (max 32MB in memory)
	if err := r.ParseMultipartForm(32 << 20); err != nil {
		writeError(w, http.StatusBadRequest, "invalid multipart form")
		return
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		writeError(w, http.StatusBadRequest, "file is required")
		return
	}
	defer file.Close()

	c, ok := storageConn(w)
	if !ok {
		return
	}
	defer c.Close()

	client := storagespb.NewStorageServiceClient(c.conn)
	ctx := grpcclient.ContextWithMetadata(r)

	stream, err := client.Upload(ctx)
	if err != nil {
		handleGRPCError(w, err)
		return
	}

	fileName := header.Filename
	fileType := r.FormValue("file_type")
	if fileType == "" {
		fileType = "bin"
	}

	// Stream file in chunks
	buf := make([]byte, 64*1024)
	first := true
	for {
		n, readErr := file.Read(buf)
		if n > 0 {
			req := &storagespb.UploadRequest{ChunkData: buf[:n]}
			if first {
				req.FileName = fileName
				req.FileType = fileType
				first = false
			}
			if err := stream.Send(req); err != nil {
				handleGRPCError(w, err)
				return
			}
		}
		if readErr == io.EOF {
			break
		}
		if readErr != nil {
			writeError(w, http.StatusInternalServerError, "failed to read file")
			return
		}
	}

	resp, err := stream.CloseAndRecv()
	if err != nil {
		handleGRPCError(w, err)
		return
	}
	writeProto(w, resp)
}

func GetFile(w http.ResponseWriter, r *http.Request) {
	c, ok := storageConn(w)
	if !ok {
		return
	}
	defer c.Close()

	client := storagespb.NewStorageServiceClient(c.conn)
	ctx := grpcclient.ContextWithMetadata(r)
	resp, err := client.GetFile(ctx, &storagespb.GetFileRequest{Id: r.PathValue("id")})
	if err != nil {
		handleGRPCError(w, err)
		return
	}
	writeProto(w, resp)
}

func DeleteFile(w http.ResponseWriter, r *http.Request) {
	c, ok := storageConn(w)
	if !ok {
		return
	}
	defer c.Close()

	client := storagespb.NewStorageServiceClient(c.conn)
	ctx := grpcclient.ContextWithMetadata(r)
	resp, err := client.Delete(ctx, &storagespb.DeleteRequest{Id: r.PathValue("id")})
	if err != nil {
		handleGRPCError(w, err)
		return
	}
	writeProto(w, resp)
}
