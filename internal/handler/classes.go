package handler

import (
	"encoding/json"
	"net/http"

	"lms-gateway/internal/grpcclient"

	"google.golang.org/grpc"
	"google.golang.org/protobuf/encoding/protowire"
)

func ListClasses(w http.ResponseWriter, r *http.Request) {
	addr := grpcclient.GetAddresses().ClassService
	conn, err := grpcclient.Dial(addr)
	if err != nil {
		writeError(w, http.StatusServiceUnavailable, "class service unavailable")
		return
	}
	defer conn.Close()

	ctx := grpcclient.ContextWithMetadata(r)

	var buf []byte
	limit := r.URL.Query().Get("limit")
	offset := r.URL.Query().Get("offset")
	keyword := r.URL.Query().Get("keyword")

	var paginationBuf []byte
	if limit != "" {
		l := parseUint(limit)
		paginationBuf = protowire.AppendTag(paginationBuf, 1, protowire.VarintType)
		paginationBuf = protowire.AppendVarint(paginationBuf, uint64(l))
	}
	if offset != "" {
		o := parseUint(offset)
		paginationBuf = protowire.AppendTag(paginationBuf, 2, protowire.VarintType)
		paginationBuf = protowire.AppendVarint(paginationBuf, uint64(o))
	}
	if keyword != "" {
		paginationBuf = protowire.AppendTag(paginationBuf, 3, protowire.BytesType)
		paginationBuf = protowire.AppendString(paginationBuf, keyword)
	}

	if len(paginationBuf) > 0 {
		buf = protowire.AppendTag(buf, 1, protowire.BytesType)
		buf = protowire.AppendBytes(buf, paginationBuf)
	}

	var resp rawMessage
	err = conn.Invoke(ctx, "/classes.ClassService/List", &rawMessage{data: buf}, &resp, grpc.ForceCodec(rawCodec{}))
	if err != nil {
		handleGRPCError(w, err)
		return
	}

	writeProtoJSON(w, resp.data)
}

func GetClass(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	addr := grpcclient.GetAddresses().ClassService
	conn, err := grpcclient.Dial(addr)
	if err != nil {
		writeError(w, http.StatusServiceUnavailable, "class service unavailable")
		return
	}
	defer conn.Close()

	ctx := grpcclient.ContextWithMetadata(r)

	var buf []byte
	buf = protowire.AppendTag(buf, 1, protowire.BytesType)
	buf = protowire.AppendString(buf, id)

	var resp rawMessage
	err = conn.Invoke(ctx, "/classes.ClassService/Get", &rawMessage{data: buf}, &resp, grpc.ForceCodec(rawCodec{}))
	if err != nil {
		handleGRPCError(w, err)
		return
	}

	writeProtoJSON(w, resp.data)
}

func CreateClass(w http.ResponseWriter, r *http.Request) {
	addr := grpcclient.GetAddresses().ClassService
	conn, err := grpcclient.Dial(addr)
	if err != nil {
		writeError(w, http.StatusServiceUnavailable, "class service unavailable")
		return
	}
	defer conn.Close()

	ctx := grpcclient.ContextWithMetadata(r)

	var input map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	var buf []byte
	buf = appendStringField(buf, 1, input, "subject_id")
	buf = appendStringField(buf, 2, input, "name")
	buf = appendStringField(buf, 3, input, "description")
	buf = appendIntField(buf, 4, input, "semester")
	buf = appendStringField(buf, 5, input, "academic_year")
	buf = appendStringField(buf, 6, input, "teacher_id")

	var resp rawMessage
	err = conn.Invoke(ctx, "/classes.ClassService/Create", &rawMessage{data: buf}, &resp, grpc.ForceCodec(rawCodec{}))
	if err != nil {
		handleGRPCError(w, err)
		return
	}

	writeProtoJSON(w, resp.data)
}

func UpdateClass(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	addr := grpcclient.GetAddresses().ClassService
	conn, err := grpcclient.Dial(addr)
	if err != nil {
		writeError(w, http.StatusServiceUnavailable, "class service unavailable")
		return
	}
	defer conn.Close()

	ctx := grpcclient.ContextWithMetadata(r)

	var input map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	var buf []byte
	buf = protowire.AppendTag(buf, 1, protowire.BytesType)
	buf = protowire.AppendString(buf, id)
	buf = appendStringField(buf, 2, input, "subject_id")
	buf = appendStringField(buf, 3, input, "name")
	buf = appendStringField(buf, 4, input, "description")
	buf = appendIntField(buf, 5, input, "semester")
	buf = appendStringField(buf, 6, input, "academic_year")
	buf = appendStringField(buf, 7, input, "teacher_id")

	var resp rawMessage
	err = conn.Invoke(ctx, "/classes.ClassService/Update", &rawMessage{data: buf}, &resp, grpc.ForceCodec(rawCodec{}))
	if err != nil {
		handleGRPCError(w, err)
		return
	}

	writeProtoJSON(w, resp.data)
}

func DeleteClass(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	addr := grpcclient.GetAddresses().ClassService
	invokeDelete(w, r, addr, "/classes.ClassService/Delete", id)
}

func ListSubjectClasses(w http.ResponseWriter, r *http.Request) {
	addr := grpcclient.GetAddresses().ClassService
	conn, err := grpcclient.Dial(addr)
	if err != nil {
		writeError(w, http.StatusServiceUnavailable, "class service unavailable")
		return
	}
	defer conn.Close()

	ctx := grpcclient.ContextWithMetadata(r)

	var buf []byte
	subjectID := r.URL.Query().Get("subject_id")
	classID := r.URL.Query().Get("class_id")
	limit := r.URL.Query().Get("limit")
	offset := r.URL.Query().Get("offset")

	if subjectID != "" {
		buf = protowire.AppendTag(buf, 1, protowire.BytesType)
		buf = protowire.AppendString(buf, subjectID)
	}
	if classID != "" {
		buf = protowire.AppendTag(buf, 2, protowire.BytesType)
		buf = protowire.AppendString(buf, classID)
	}

	var paginationBuf []byte
	if limit != "" {
		l := parseUint(limit)
		paginationBuf = protowire.AppendTag(paginationBuf, 1, protowire.VarintType)
		paginationBuf = protowire.AppendVarint(paginationBuf, uint64(l))
	}
	if offset != "" {
		o := parseUint(offset)
		paginationBuf = protowire.AppendTag(paginationBuf, 2, protowire.VarintType)
		paginationBuf = protowire.AppendVarint(paginationBuf, uint64(o))
	}
	if len(paginationBuf) > 0 {
		buf = protowire.AppendTag(buf, 3, protowire.BytesType)
		buf = protowire.AppendBytes(buf, paginationBuf)
	}

	var resp rawMessage
	err = conn.Invoke(ctx, "/classes.SubjectClassService/List", &rawMessage{data: buf}, &resp, grpc.ForceCodec(rawCodec{}))
	if err != nil {
		handleGRPCError(w, err)
		return
	}

	writeProtoJSON(w, resp.data)
}

func CreateSubjectClass(w http.ResponseWriter, r *http.Request) {
	addr := grpcclient.GetAddresses().ClassService
	conn, err := grpcclient.Dial(addr)
	if err != nil {
		writeError(w, http.StatusServiceUnavailable, "class service unavailable")
		return
	}
	defer conn.Close()

	ctx := grpcclient.ContextWithMetadata(r)

	var input map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	var buf []byte
	buf = appendStringField(buf, 1, input, "subject_id")
	buf = appendStringField(buf, 2, input, "class_id")

	var resp rawMessage
	err = conn.Invoke(ctx, "/classes.SubjectClassService/Create", &rawMessage{data: buf}, &resp, grpc.ForceCodec(rawCodec{}))
	if err != nil {
		handleGRPCError(w, err)
		return
	}

	writeProtoJSON(w, resp.data)
}

func DeleteSubjectClass(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	addr := grpcclient.GetAddresses().ClassService
	invokeDelete(w, r, addr, "/classes.SubjectClassService/Delete", id)
}
