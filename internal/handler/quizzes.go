package handler

import (
	"net/http"

	"lms-gateway/internal/grpcclient"
	quizzespb "lms-gateway/pb/quiz/quizzes"
)

func quizConn(w http.ResponseWriter) (*grpcConn, bool) {
	addr := grpcclient.GetAddresses().QuizService
	conn, err := grpcclient.Dial(addr)
	if err != nil {
		writeError(w, http.StatusServiceUnavailable, "quiz service unavailable")
		return nil, false
	}
	return &grpcConn{conn: conn}, true
}

func GetQuiz(w http.ResponseWriter, r *http.Request) {
	c, ok := quizConn(w)
	if !ok {
		return
	}
	defer c.Close()

	client := quizzespb.NewQuizzesClient(c.conn)
	ctx := grpcclient.ContextWithMetadata(r)
	resp, err := client.Get(ctx, &quizzespb.Id{Id: r.PathValue("id")})
	if err != nil {
		handleGRPCError(w, err)
		return
	}
	writeProto(w, resp)
}

func CreateQuiz(w http.ResponseWriter, r *http.Request) {
	c, ok := quizConn(w)
	if !ok {
		return
	}
	defer c.Close()

	in := &quizzespb.QuizCreateInput{}
	if err := readProto(r, in); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	client := quizzespb.NewQuizzesClient(c.conn)
	ctx := grpcclient.ContextWithMetadata(r)
	resp, err := client.Create(ctx, in)
	if err != nil {
		handleGRPCError(w, err)
		return
	}
	writeProto(w, resp)
}

func UpdateQuiz(w http.ResponseWriter, r *http.Request) {
	c, ok := quizConn(w)
	if !ok {
		return
	}
	defer c.Close()

	in := &quizzespb.QuizUpdateInput{}
	if err := readProto(r, in); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	in.Id = r.PathValue("id")
	client := quizzespb.NewQuizzesClient(c.conn)
	ctx := grpcclient.ContextWithMetadata(r)
	resp, err := client.Update(ctx, in)
	if err != nil {
		handleGRPCError(w, err)
		return
	}
	writeProto(w, resp)
}

func DeleteQuiz(w http.ResponseWriter, r *http.Request) {
	c, ok := quizConn(w)
	if !ok {
		return
	}
	defer c.Close()

	client := quizzespb.NewQuizzesClient(c.conn)
	ctx := grpcclient.ContextWithMetadata(r)
	resp, err := client.Delete(ctx, &quizzespb.Id{Id: r.PathValue("id")})
	if err != nil {
		handleGRPCError(w, err)
		return
	}
	writeProto(w, resp)
}

func AnswerQuiz(w http.ResponseWriter, r *http.Request) {
	c, ok := quizConn(w)
	if !ok {
		return
	}
	defer c.Close()

	in := &quizzespb.QuizAnswerInput{}
	if err := readProto(r, in); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	in.QuizId = r.PathValue("id")
	client := quizzespb.NewQuizzesClient(c.conn)
	ctx := grpcclient.ContextWithMetadata(r)
	resp, err := client.Answer(ctx, in)
	if err != nil {
		handleGRPCError(w, err)
		return
	}
	writeProto(w, resp)
}

func ListQuizScores(w http.ResponseWriter, r *http.Request) {
	c, ok := quizConn(w)
	if !ok {
		return
	}
	defer c.Close()

	client := quizzespb.NewQuizzesClient(c.conn)
	ctx := grpcclient.ContextWithMetadata(r)
	resp, err := client.ListScoresByQuizId(ctx, &quizzespb.Id{Id: r.PathValue("id")})
	if err != nil {
		handleGRPCError(w, err)
		return
	}
	writeProto(w, resp)
}
