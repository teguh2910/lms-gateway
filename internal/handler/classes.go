package handler

import (
	"net/http"

	"lms-gateway/internal/grpcclient"
	classespb "lms-gateway/pb/class/classes"
	genericpb "lms-gateway/pb/class/generic"
)

func classConn(w http.ResponseWriter) (*grpcConn, bool) {
	addr := grpcclient.GetAddresses().ClassService
	conn, err := grpcclient.Dial(addr)
	if err != nil {
		writeError(w, http.StatusServiceUnavailable, "class service unavailable")
		return nil, false
	}
	return &grpcConn{conn: conn}, true
}

// --- Classes ---

func ListClasses(w http.ResponseWriter, r *http.Request) {
	c, ok := classConn(w)
	if !ok {
		return
	}
	defer c.Close()

	client := classespb.NewClassServiceClient(c.conn)
	ctx := grpcclient.ContextWithMetadata(r)
	resp, err := client.List(ctx, &classespb.ClassListInput{
		Pagination: &genericpb.Pagination{
			Limit:   parseUint(r.URL.Query().Get("limit")),
			Offset:  parseUint(r.URL.Query().Get("offset")),
			Keyword: r.URL.Query().Get("keyword"),
		},
	})
	if err != nil {
		handleGRPCError(w, err)
		return
	}
	writeProto(w, resp)
}

func GetClass(w http.ResponseWriter, r *http.Request) {
	c, ok := classConn(w)
	if !ok {
		return
	}
	defer c.Close()

	client := classespb.NewClassServiceClient(c.conn)
	ctx := grpcclient.ContextWithMetadata(r)
	resp, err := client.Get(ctx, &genericpb.Id{Id: r.PathValue("id")})
	if err != nil {
		handleGRPCError(w, err)
		return
	}
	writeProto(w, resp)
}

func CreateClass(w http.ResponseWriter, r *http.Request) {
	c, ok := classConn(w)
	if !ok {
		return
	}
	defer c.Close()

	in := &classespb.ClassInput{}
	if err := readProto(r, in); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	client := classespb.NewClassServiceClient(c.conn)
	ctx := grpcclient.ContextWithMetadata(r)
	resp, err := client.Create(ctx, in)
	if err != nil {
		handleGRPCError(w, err)
		return
	}
	writeProto(w, resp)
}

func UpdateClass(w http.ResponseWriter, r *http.Request) {
	c, ok := classConn(w)
	if !ok {
		return
	}
	defer c.Close()

	in := &classespb.Class{}
	if err := readProto(r, in); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	in.Id = r.PathValue("id")
	client := classespb.NewClassServiceClient(c.conn)
	ctx := grpcclient.ContextWithMetadata(r)
	resp, err := client.Update(ctx, in)
	if err != nil {
		handleGRPCError(w, err)
		return
	}
	writeProto(w, resp)
}

func DeleteClass(w http.ResponseWriter, r *http.Request) {
	c, ok := classConn(w)
	if !ok {
		return
	}
	defer c.Close()

	client := classespb.NewClassServiceClient(c.conn)
	ctx := grpcclient.ContextWithMetadata(r)
	resp, err := client.Delete(ctx, &genericpb.Id{Id: r.PathValue("id")})
	if err != nil {
		handleGRPCError(w, err)
		return
	}
	writeProto(w, resp)
}

// --- Subject Classes ---

func ListSubjectClasses(w http.ResponseWriter, r *http.Request) {
	c, ok := classConn(w)
	if !ok {
		return
	}
	defer c.Close()

	client := classespb.NewSubjectClassServiceClient(c.conn)
	ctx := grpcclient.ContextWithMetadata(r)
	resp, err := client.List(ctx, &classespb.SubjectClassListInput{
		Pagination: &genericpb.Pagination{
			Limit:   parseUint(r.URL.Query().Get("limit")),
			Offset:  parseUint(r.URL.Query().Get("offset")),
			Keyword: r.URL.Query().Get("keyword"),
		},
		ClassId: r.URL.Query().Get("class_id"),
	})
	if err != nil {
		handleGRPCError(w, err)
		return
	}
	writeProto(w, resp)
}

func CreateSubjectClass(w http.ResponseWriter, r *http.Request) {
	c, ok := classConn(w)
	if !ok {
		return
	}
	defer c.Close()

	in := &classespb.SubjectClassInput{}
	if err := readProto(r, in); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	client := classespb.NewSubjectClassServiceClient(c.conn)
	ctx := grpcclient.ContextWithMetadata(r)
	resp, err := client.Create(ctx, in)
	if err != nil {
		handleGRPCError(w, err)
		return
	}
	writeProto(w, resp)
}

func DeleteSubjectClass(w http.ResponseWriter, r *http.Request) {
	c, ok := classConn(w)
	if !ok {
		return
	}
	defer c.Close()

	client := classespb.NewSubjectClassServiceClient(c.conn)
	ctx := grpcclient.ContextWithMetadata(r)
	resp, err := client.Delete(ctx, &genericpb.Id{Id: r.PathValue("id")})
	if err != nil {
		handleGRPCError(w, err)
		return
	}
	writeProto(w, resp)
}
