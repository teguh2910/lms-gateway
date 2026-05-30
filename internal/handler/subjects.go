package handler

import (
	"encoding/json"
	"net/http"

	"lms-gateway/internal/grpcclient"

	"google.golang.org/grpc"
	"google.golang.org/protobuf/encoding/protowire"
)

func ListSubjects(w http.ResponseWriter, r *http.Request) {
	addr := grpcclient.GetAddresses().ClassService
	conn, err := grpcclient.Dial(addr)
	if err != nil {
		writeError(w, http.StatusServiceUnavailable, "class service unavailable")
		return
	}
	defer conn.Close()

	ctx := grpcclient.ContextWithMetadata(r)

	// Build pagination request
	var buf []byte
	// SubjectListInput has pagination at field 1
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
	err = conn.Invoke(ctx, "/subjects.SubjectService/List", &rawMessage{data: buf}, &resp, grpc.ForceCodec(rawCodec{}))
	if err != nil {
		handleGRPCError(w, err)
		return
	}

	writeProtoJSON(w, resp.data)
}

func GetSubject(w http.ResponseWriter, r *http.Request) {
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
	err = conn.Invoke(ctx, "/subjects.SubjectService/Get", &rawMessage{data: buf}, &resp, grpc.ForceCodec(rawCodec{}))
	if err != nil {
		handleGRPCError(w, err)
		return
	}

	writeProtoJSON(w, resp.data)
}

func CreateSubject(w http.ResponseWriter, r *http.Request) {
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

	// Encode SubjectInput
	var buf []byte
	buf = appendStringField(buf, 1, input, "university_id")
	buf = appendStringField(buf, 2, input, "university_name")
	buf = appendStringField(buf, 3, input, "faculty_id")
	buf = appendStringField(buf, 4, input, "faculty_name")
	buf = appendStringField(buf, 5, input, "programme_id")
	buf = appendStringField(buf, 6, input, "programme_name")
	buf = appendStringField(buf, 7, input, "code")
	buf = appendStringField(buf, 8, input, "name")
	buf = appendIntField(buf, 9, input, "sks")
	buf = appendIntField(buf, 10, input, "default_semester")

	var resp rawMessage
	err = conn.Invoke(ctx, "/subjects.SubjectService/Create", &rawMessage{data: buf}, &resp, grpc.ForceCodec(rawCodec{}))
	if err != nil {
		handleGRPCError(w, err)
		return
	}

	writeProtoJSON(w, resp.data)
}

func UpdateSubject(w http.ResponseWriter, r *http.Request) {
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

	// Encode Subject (for update)
	var buf []byte
	buf = protowire.AppendTag(buf, 1, protowire.BytesType)
	buf = protowire.AppendString(buf, id)
	buf = appendStringField(buf, 2, input, "university_id")
	buf = appendStringField(buf, 3, input, "university_name")
	buf = appendStringField(buf, 4, input, "faculty_id")
	buf = appendStringField(buf, 5, input, "faculty_name")
	buf = appendStringField(buf, 6, input, "programme_id")
	buf = appendStringField(buf, 7, input, "programme_name")
	buf = appendStringField(buf, 8, input, "code")
	buf = appendStringField(buf, 9, input, "name")
	buf = appendIntField(buf, 10, input, "sks")
	buf = appendIntField(buf, 11, input, "default_semester")

	var resp rawMessage
	err = conn.Invoke(ctx, "/subjects.SubjectService/Update", &rawMessage{data: buf}, &resp, grpc.ForceCodec(rawCodec{}))
	if err != nil {
		handleGRPCError(w, err)
		return
	}

	writeProtoJSON(w, resp.data)
}

func DeleteSubject(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	addr := grpcclient.GetAddresses().ClassService
	invokeDelete(w, r, addr, "/subjects.SubjectService/Delete", id)
}
