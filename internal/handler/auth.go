package handler

import (
	"net/http"

	"lms-gateway/internal/grpcclient"
	userspb "lms-gateway/pb/user/users"
)

func userConn(w http.ResponseWriter) (*grpcConn, bool) {
	addr := grpcclient.GetAddresses().UserService
	conn, err := grpcclient.Dial(addr)
	if err != nil {
		writeError(w, http.StatusServiceUnavailable, "user service unavailable")
		return nil, false
	}
	return &grpcConn{conn: conn}, true
}

// Login authenticates against the user service and returns a JWT + user
func Login(w http.ResponseWriter, r *http.Request) {
	c, ok := userConn(w)
	if !ok {
		return
	}
	defer c.Close()

	in := &userspb.LoginInput{}
	if err := readProto(r, in); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	client := userspb.NewUserServiceClient(c.conn)
	ctx := grpcclient.ContextWithMetadata(r)
	resp, err := client.Login(ctx, in)
	if err != nil {
		handleGRPCError(w, err)
		return
	}
	writeProto(w, resp)
}

// Register creates a new user account
func Register(w http.ResponseWriter, r *http.Request) {
	c, ok := userConn(w)
	if !ok {
		return
	}
	defer c.Close()

	in := &userspb.RegisterInput{}
	if err := readProto(r, in); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	client := userspb.NewUserServiceClient(c.conn)
	ctx := grpcclient.ContextWithMetadata(r)
	resp, err := client.Register(ctx, in)
	if err != nil {
		handleGRPCError(w, err)
		return
	}
	writeProto(w, resp)
}
