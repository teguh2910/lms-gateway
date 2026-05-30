package handler

import (
	"net/http"

	"lms-gateway/internal/grpcclient"
	postspb "lms-gateway/pb/post/posts"
)

func postConn(w http.ResponseWriter) (*grpcConn, bool) {
	addr := grpcclient.GetAddresses().PostService
	conn, err := grpcclient.Dial(addr)
	if err != nil {
		writeError(w, http.StatusServiceUnavailable, "post service unavailable")
		return nil, false
	}
	return &grpcConn{conn: conn}, true
}

func GetPost(w http.ResponseWriter, r *http.Request) {
	c, ok := postConn(w)
	if !ok {
		return
	}
	defer c.Close()

	client := postspb.NewPostsClient(c.conn)
	ctx := grpcclient.ContextWithMetadata(r)
	resp, err := client.GetPost(ctx, &postspb.Id{Id: r.PathValue("id")})
	if err != nil {
		handleGRPCError(w, err)
		return
	}
	writeProto(w, resp)
}

func CreatePost(w http.ResponseWriter, r *http.Request) {
	c, ok := postConn(w)
	if !ok {
		return
	}
	defer c.Close()

	in := &postspb.CreatePostRequest{}
	if err := readProto(r, in); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	client := postspb.NewPostsClient(c.conn)
	ctx := grpcclient.ContextWithMetadata(r)
	resp, err := client.CreatePost(ctx, in)
	if err != nil {
		handleGRPCError(w, err)
		return
	}
	writeProto(w, resp)
}

func UpdatePost(w http.ResponseWriter, r *http.Request) {
	c, ok := postConn(w)
	if !ok {
		return
	}
	defer c.Close()

	in := &postspb.UpdatePostRequest{}
	if err := readProto(r, in); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	in.Id = r.PathValue("id")
	client := postspb.NewPostsClient(c.conn)
	ctx := grpcclient.ContextWithMetadata(r)
	resp, err := client.UpdatePost(ctx, in)
	if err != nil {
		handleGRPCError(w, err)
		return
	}
	writeProto(w, resp)
}

func UnpublishPost(w http.ResponseWriter, r *http.Request) {
	c, ok := postConn(w)
	if !ok {
		return
	}
	defer c.Close()

	client := postspb.NewPostsClient(c.conn)
	ctx := grpcclient.ContextWithMetadata(r)
	resp, err := client.UnpublishPost(ctx, &postspb.Id{Id: r.PathValue("id")})
	if err != nil {
		handleGRPCError(w, err)
		return
	}
	writeProto(w, resp)
}

func CreateComment(w http.ResponseWriter, r *http.Request) {
	c, ok := postConn(w)
	if !ok {
		return
	}
	defer c.Close()

	in := &postspb.CreateCommentRequest{}
	if err := readProto(r, in); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	in.PostId = r.PathValue("id")
	client := postspb.NewPostsClient(c.conn)
	ctx := grpcclient.ContextWithMetadata(r)
	resp, err := client.CreateComment(ctx, in)
	if err != nil {
		handleGRPCError(w, err)
		return
	}
	writeProto(w, resp)
}
