package handler

import (
	"net/http"

	"lms-gateway/internal/grpcclient"
	genericpb "lms-gateway/pb/user/generic"
	userspb "lms-gateway/pb/user/users"
)

func ListUsers(w http.ResponseWriter, r *http.Request) {
	c, ok := userConn(w)
	if !ok {
		return
	}
	defer c.Close()

	client := userspb.NewUserServiceClient(c.conn)
	ctx := grpcclient.ContextWithMetadata(r)
	resp, err := client.List(ctx, &userspb.UserListInput{
		Pagination: &genericpb.Pagination{
			Limit:   parseUint(r.URL.Query().Get("limit")),
			Offset:  parseUint(r.URL.Query().Get("offset")),
			Keyword: r.URL.Query().Get("keyword"),
		},
		Role:    r.URL.Query().Get("role"),
		ClassId: r.URL.Query().Get("class_id"),
	})
	if err != nil {
		handleGRPCError(w, err)
		return
	}
	writeProto(w, resp)
}

func GetUser(w http.ResponseWriter, r *http.Request) {
	c, ok := userConn(w)
	if !ok {
		return
	}
	defer c.Close()

	client := userspb.NewUserServiceClient(c.conn)
	ctx := grpcclient.ContextWithMetadata(r)
	resp, err := client.Get(ctx, &genericpb.Id{Id: r.PathValue("id")})
	if err != nil {
		handleGRPCError(w, err)
		return
	}
	writeProto(w, resp)
}

func UpdateUser(w http.ResponseWriter, r *http.Request) {
	c, ok := userConn(w)
	if !ok {
		return
	}
	defer c.Close()

	in := &userspb.UpdateUserInput{}
	if err := readProto(r, in); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	in.Id = r.PathValue("id")
	client := userspb.NewUserServiceClient(c.conn)
	ctx := grpcclient.ContextWithMetadata(r)
	resp, err := client.Update(ctx, in)
	if err != nil {
		handleGRPCError(w, err)
		return
	}
	writeProto(w, resp)
}

func ChangePassword(w http.ResponseWriter, r *http.Request) {
	c, ok := userConn(w)
	if !ok {
		return
	}
	defer c.Close()

	in := &userspb.ChangePasswordInput{}
	if err := readProto(r, in); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	in.Id = r.PathValue("id")
	client := userspb.NewUserServiceClient(c.conn)
	ctx := grpcclient.ContextWithMetadata(r)
	resp, err := client.ChangePassword(ctx, in)
	if err != nil {
		handleGRPCError(w, err)
		return
	}
	writeProto(w, resp)
}

func DeleteUser(w http.ResponseWriter, r *http.Request) {
	c, ok := userConn(w)
	if !ok {
		return
	}
	defer c.Close()

	client := userspb.NewUserServiceClient(c.conn)
	ctx := grpcclient.ContextWithMetadata(r)
	resp, err := client.Delete(ctx, &genericpb.Id{Id: r.PathValue("id")})
	if err != nil {
		handleGRPCError(w, err)
		return
	}
	writeProto(w, resp)
}
