package handler

import (
	"encoding/json"
	"net/http"

	"lms-gateway/internal/grpcclient"

	"google.golang.org/grpc"
	"google.golang.org/protobuf/encoding/protowire"
)

func ListConferences(w http.ResponseWriter, r *http.Request) {
	addr := grpcclient.GetAddresses().ConferenceService
	conn, err := grpcclient.Dial(addr)
	if err != nil {
		writeError(w, http.StatusServiceUnavailable, "conference service unavailable")
		return
	}
	defer conn.Close()

	ctx := grpcclient.ContextWithMetadata(r)

	var buf []byte
	limit := r.URL.Query().Get("limit")
	offset := r.URL.Query().Get("offset")
	keyword := r.URL.Query().Get("keyword")
	classID := r.URL.Query().Get("class_id")

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
	if classID != "" {
		buf = protowire.AppendTag(buf, 2, protowire.BytesType)
		buf = protowire.AppendString(buf, classID)
	}

	var resp rawMessage
	err = conn.Invoke(ctx, "/conferences.ConferenceService/List", &rawMessage{data: buf}, &resp, grpc.ForceCodec(rawCodec{}))
	if err != nil {
		handleGRPCError(w, err)
		return
	}

	writeProtoJSON(w, resp.data)
}

func GetConference(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	addr := grpcclient.GetAddresses().ConferenceService
	conn, err := grpcclient.Dial(addr)
	if err != nil {
		writeError(w, http.StatusServiceUnavailable, "conference service unavailable")
		return
	}
	defer conn.Close()

	ctx := grpcclient.ContextWithMetadata(r)

	var buf []byte
	buf = protowire.AppendTag(buf, 1, protowire.BytesType)
	buf = protowire.AppendString(buf, id)

	var resp rawMessage
	err = conn.Invoke(ctx, "/conferences.ConferenceService/Get", &rawMessage{data: buf}, &resp, grpc.ForceCodec(rawCodec{}))
	if err != nil {
		handleGRPCError(w, err)
		return
	}

	writeProtoJSON(w, resp.data)
}

func CreateConference(w http.ResponseWriter, r *http.Request) {
	addr := grpcclient.GetAddresses().ConferenceService
	conn, err := grpcclient.Dial(addr)
	if err != nil {
		writeError(w, http.StatusServiceUnavailable, "conference service unavailable")
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
	buf = appendStringField(buf, 1, input, "class_id")
	buf = appendStringField(buf, 2, input, "title")
	buf = appendStringField(buf, 3, input, "description")
	buf = appendStringField(buf, 4, input, "start_time")
	buf = appendStringField(buf, 5, input, "end_time")
	buf = appendStringField(buf, 6, input, "meeting_url")
	buf = appendStringField(buf, 7, input, "type")

	var resp rawMessage
	err = conn.Invoke(ctx, "/conferences.ConferenceService/Create", &rawMessage{data: buf}, &resp, grpc.ForceCodec(rawCodec{}))
	if err != nil {
		handleGRPCError(w, err)
		return
	}

	writeProtoJSON(w, resp.data)
}

func UpdateConference(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	addr := grpcclient.GetAddresses().ConferenceService
	conn, err := grpcclient.Dial(addr)
	if err != nil {
		writeError(w, http.StatusServiceUnavailable, "conference service unavailable")
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
	buf = appendStringField(buf, 2, input, "class_id")
	buf = appendStringField(buf, 3, input, "title")
	buf = appendStringField(buf, 4, input, "description")
	buf = appendStringField(buf, 5, input, "start_time")
	buf = appendStringField(buf, 6, input, "end_time")
	buf = appendStringField(buf, 7, input, "meeting_url")
	buf = appendStringField(buf, 8, input, "type")

	var resp rawMessage
	err = conn.Invoke(ctx, "/conferences.ConferenceService/Update", &rawMessage{data: buf}, &resp, grpc.ForceCodec(rawCodec{}))
	if err != nil {
		handleGRPCError(w, err)
		return
	}

	writeProtoJSON(w, resp.data)
}

func DeleteConference(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	addr := grpcclient.GetAddresses().ConferenceService
	invokeDelete(w, r, addr, "/conferences.ConferenceService/Delete", id)
}

func JoinConference(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	addr := grpcclient.GetAddresses().ConferenceService
	conn, err := grpcclient.Dial(addr)
	if err != nil {
		writeError(w, http.StatusServiceUnavailable, "conference service unavailable")
		return
	}
	defer conn.Close()

	ctx := grpcclient.ContextWithMetadata(r)

	var buf []byte
	buf = protowire.AppendTag(buf, 1, protowire.BytesType)
	buf = protowire.AppendString(buf, id)

	var resp rawMessage
	err = conn.Invoke(ctx, "/conferences.ConferenceParticipantService/Create", &rawMessage{data: buf}, &resp, grpc.ForceCodec(rawCodec{}))
	if err != nil {
		handleGRPCError(w, err)
		return
	}

	writeProtoJSON(w, resp.data)
}
