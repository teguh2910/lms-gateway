package handler

import (
	"net/http"

	"lms-gateway/internal/grpcclient"
	genericpb "lms-gateway/pb/class/generic"
	subjectspb "lms-gateway/pb/class/subjects"
)

func subjectClient(w http.ResponseWriter) (subjectspb.SubjectServiceClient, func(), bool) {
	addr := grpcclient.GetAddresses().ClassService
	conn, err := grpcclient.Dial(addr)
	if err != nil {
		writeError(w, http.StatusServiceUnavailable, "class service unavailable")
		return nil, nil, false
	}
	return subjectspb.NewSubjectServiceClient(conn), func() { conn.Close() }, true
}

func ListSubjects(w http.ResponseWriter, r *http.Request) {
	client, closeFn, ok := subjectClient(w)
	if !ok {
		return
	}
	defer closeFn()

	ctx := grpcclient.ContextWithMetadata(r)
	in := &subjectspb.SubjectListInput{
		Pagination: &genericpb.Pagination{
			Limit:   parseUint(r.URL.Query().Get("limit")),
			Offset:  parseUint(r.URL.Query().Get("offset")),
			Keyword: r.URL.Query().Get("keyword"),
		},
	}

	resp, err := client.List(ctx, in)
	if err != nil {
		handleGRPCError(w, err)
		return
	}
	writeProto(w, resp)
}

func GetSubject(w http.ResponseWriter, r *http.Request) {
	client, closeFn, ok := subjectClient(w)
	if !ok {
		return
	}
	defer closeFn()

	ctx := grpcclient.ContextWithMetadata(r)
	resp, err := client.Get(ctx, &genericpb.Id{Id: r.PathValue("id")})
	if err != nil {
		handleGRPCError(w, err)
		return
	}
	writeProto(w, resp)
}

func CreateSubject(w http.ResponseWriter, r *http.Request) {
	client, closeFn, ok := subjectClient(w)
	if !ok {
		return
	}
	defer closeFn()

	in := &subjectspb.SubjectInput{}
	if err := readProto(r, in); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	ctx := grpcclient.ContextWithMetadata(r)
	resp, err := client.Create(ctx, in)
	if err != nil {
		handleGRPCError(w, err)
		return
	}
	writeProto(w, resp)
}

func UpdateSubject(w http.ResponseWriter, r *http.Request) {
	client, closeFn, ok := subjectClient(w)
	if !ok {
		return
	}
	defer closeFn()

	in := &subjectspb.Subject{}
	if err := readProto(r, in); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	in.Id = r.PathValue("id")

	ctx := grpcclient.ContextWithMetadata(r)
	resp, err := client.Update(ctx, in)
	if err != nil {
		handleGRPCError(w, err)
		return
	}
	writeProto(w, resp)
}

func DeleteSubject(w http.ResponseWriter, r *http.Request) {
	client, closeFn, ok := subjectClient(w)
	if !ok {
		return
	}
	defer closeFn()

	ctx := grpcclient.ContextWithMetadata(r)
	resp, err := client.Delete(ctx, &genericpb.Id{Id: r.PathValue("id")})
	if err != nil {
		handleGRPCError(w, err)
		return
	}
	writeProto(w, resp)
}
