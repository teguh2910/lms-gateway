package handler

import (
	"net/http"

	"lms-gateway/internal/grpcclient"
	conferencespb "lms-gateway/pb/conference/conferences"
	genericpb "lms-gateway/pb/conference/generic"
)

func conferenceConn(w http.ResponseWriter) (*grpcConn, bool) {
	addr := grpcclient.GetAddresses().ConferenceService
	conn, err := grpcclient.Dial(addr)
	if err != nil {
		writeError(w, http.StatusServiceUnavailable, "conference service unavailable")
		return nil, false
	}
	return &grpcConn{conn: conn}, true
}

func ListConferences(w http.ResponseWriter, r *http.Request) {
	c, ok := conferenceConn(w)
	if !ok {
		return
	}
	defer c.Close()

	client := conferencespb.NewConferenceServiceClient(c.conn)
	ctx := grpcclient.ContextWithMetadata(r)
	resp, err := client.List(ctx, &conferencespb.ConferenceListInput{
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

func GetConference(w http.ResponseWriter, r *http.Request) {
	c, ok := conferenceConn(w)
	if !ok {
		return
	}
	defer c.Close()

	client := conferencespb.NewConferenceServiceClient(c.conn)
	ctx := grpcclient.ContextWithMetadata(r)
	resp, err := client.Get(ctx, &genericpb.Id{Id: r.PathValue("id")})
	if err != nil {
		handleGRPCError(w, err)
		return
	}
	writeProto(w, resp)
}

func CreateConference(w http.ResponseWriter, r *http.Request) {
	c, ok := conferenceConn(w)
	if !ok {
		return
	}
	defer c.Close()

	in := &conferencespb.ConferenceInput{}
	if err := readProto(r, in); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	client := conferencespb.NewConferenceServiceClient(c.conn)
	ctx := grpcclient.ContextWithMetadata(r)
	resp, err := client.Create(ctx, in)
	if err != nil {
		handleGRPCError(w, err)
		return
	}
	writeProto(w, resp)
}

func UpdateConference(w http.ResponseWriter, r *http.Request) {
	c, ok := conferenceConn(w)
	if !ok {
		return
	}
	defer c.Close()

	in := &conferencespb.Conference{}
	if err := readProto(r, in); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	in.Id = r.PathValue("id")
	client := conferencespb.NewConferenceServiceClient(c.conn)
	ctx := grpcclient.ContextWithMetadata(r)
	resp, err := client.Update(ctx, in)
	if err != nil {
		handleGRPCError(w, err)
		return
	}
	writeProto(w, resp)
}

func DeleteConference(w http.ResponseWriter, r *http.Request) {
	c, ok := conferenceConn(w)
	if !ok {
		return
	}
	defer c.Close()

	client := conferencespb.NewConferenceServiceClient(c.conn)
	ctx := grpcclient.ContextWithMetadata(r)
	resp, err := client.Delete(ctx, &genericpb.Id{Id: r.PathValue("id")})
	if err != nil {
		handleGRPCError(w, err)
		return
	}
	writeProto(w, resp)
}

func JoinConference(w http.ResponseWriter, r *http.Request) {
	c, ok := conferenceConn(w)
	if !ok {
		return
	}
	defer c.Close()

	in := &conferencespb.ConferenceParticipantInput{}
	if err := readProto(r, in); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	in.ConferenceId = r.PathValue("id")
	client := conferencespb.NewConferenceParticipantServiceClient(c.conn)
	ctx := grpcclient.ContextWithMetadata(r)
	resp, err := client.Create(ctx, in)
	if err != nil {
		handleGRPCError(w, err)
		return
	}
	writeProto(w, resp)
}
