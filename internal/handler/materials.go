package handler

import (
	"net/http"

	"lms-gateway/internal/grpcclient"
	genericpb "lms-gateway/pb/material/generic"
	materialspb "lms-gateway/pb/material/materials"
)

func materialConn(w http.ResponseWriter) (*grpcConn, bool) {
	addr := grpcclient.GetAddresses().MaterialService
	conn, err := grpcclient.Dial(addr)
	if err != nil {
		writeError(w, http.StatusServiceUnavailable, "material service unavailable")
		return nil, false
	}
	return &grpcConn{conn: conn}, true
}

func ListMaterials(w http.ResponseWriter, r *http.Request) {
	c, ok := materialConn(w)
	if !ok {
		return
	}
	defer c.Close()

	client := materialspb.NewMaterialServiceClient(c.conn)
	ctx := grpcclient.ContextWithMetadata(r)
	resp, err := client.List(ctx, &materialspb.MaterialListInput{
		Pagination: &genericpb.Pagination{
			Limit:   parseUint(r.URL.Query().Get("limit")),
			Offset:  parseUint(r.URL.Query().Get("offset")),
			Keyword: r.URL.Query().Get("keyword"),
		},
		SubjectClassId: r.URL.Query().Get("subject_class_id"),
	})
	if err != nil {
		handleGRPCError(w, err)
		return
	}
	writeProto(w, resp)
}

func GetMaterial(w http.ResponseWriter, r *http.Request) {
	c, ok := materialConn(w)
	if !ok {
		return
	}
	defer c.Close()

	client := materialspb.NewMaterialServiceClient(c.conn)
	ctx := grpcclient.ContextWithMetadata(r)
	resp, err := client.Get(ctx, &genericpb.Id{Id: r.PathValue("id")})
	if err != nil {
		handleGRPCError(w, err)
		return
	}
	writeProto(w, resp)
}

func CreateMaterial(w http.ResponseWriter, r *http.Request) {
	c, ok := materialConn(w)
	if !ok {
		return
	}
	defer c.Close()

	in := &materialspb.MaterialInput{}
	if err := readProto(r, in); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	client := materialspb.NewMaterialServiceClient(c.conn)
	ctx := grpcclient.ContextWithMetadata(r)
	resp, err := client.Create(ctx, in)
	if err != nil {
		handleGRPCError(w, err)
		return
	}
	writeProto(w, resp)
}

func UpdateMaterial(w http.ResponseWriter, r *http.Request) {
	c, ok := materialConn(w)
	if !ok {
		return
	}
	defer c.Close()

	in := &materialspb.Material{}
	if err := readProto(r, in); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	in.Id = r.PathValue("id")
	client := materialspb.NewMaterialServiceClient(c.conn)
	ctx := grpcclient.ContextWithMetadata(r)
	resp, err := client.Update(ctx, in)
	if err != nil {
		handleGRPCError(w, err)
		return
	}
	writeProto(w, resp)
}

func DeleteMaterial(w http.ResponseWriter, r *http.Request) {
	c, ok := materialConn(w)
	if !ok {
		return
	}
	defer c.Close()

	client := materialspb.NewMaterialServiceClient(c.conn)
	ctx := grpcclient.ContextWithMetadata(r)
	resp, err := client.Delete(ctx, &genericpb.Id{Id: r.PathValue("id")})
	if err != nil {
		handleGRPCError(w, err)
		return
	}
	writeProto(w, resp)
}

func DownloadMaterial(w http.ResponseWriter, r *http.Request) {
	c, ok := materialConn(w)
	if !ok {
		return
	}
	defer c.Close()

	in := &materialspb.UpdateProgressInput{}
	_ = readProto(r, in)
	in.Id = r.PathValue("id")
	in.IsDownloaded = true
	if in.ProgressDownloaded == 0 {
		in.ProgressDownloaded = 100
	}
	client := materialspb.NewStudentMaterialServiceClient(c.conn)
	ctx := grpcclient.ContextWithMetadata(r)
	resp, err := client.UpdateProgress(ctx, in)
	if err != nil {
		handleGRPCError(w, err)
		return
	}
	writeProto(w, resp)
}
