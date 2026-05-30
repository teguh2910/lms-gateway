package handler

import (
	"encoding/json"
	"net/http"

	"lms-gateway/internal/grpcclient"

	"google.golang.org/grpc"
	"google.golang.org/protobuf/encoding/protowire"
)

func GetQuiz(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	addr := grpcclient.GetAddresses().QuizService
	conn, err := grpcclient.Dial(addr)
	if err != nil {
		writeError(w, http.StatusServiceUnavailable, "quiz service unavailable")
		return
	}
	defer conn.Close()

	ctx := grpcclient.ContextWithMetadata(r)

	var buf []byte
	buf = protowire.AppendTag(buf, 1, protowire.BytesType)
	buf = protowire.AppendString(buf, id)

	var resp rawMessage
	err = conn.Invoke(ctx, "/quizzes.Quizzes/Get", &rawMessage{data: buf}, &resp, grpc.ForceCodec(rawCodec{}))
	if err != nil {
		handleGRPCError(w, err)
		return
	}

	writeProtoJSON(w, resp.data)
}

func CreateQuiz(w http.ResponseWriter, r *http.Request) {
	addr := grpcclient.GetAddresses().QuizService
	conn, err := grpcclient.Dial(addr)
	if err != nil {
		writeError(w, http.StatusServiceUnavailable, "quiz service unavailable")
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
	buf = appendIntField(buf, 4, input, "duration_minutes")
	buf = appendStringField(buf, 5, input, "start_time")
	buf = appendStringField(buf, 6, input, "end_time")

	var resp rawMessage
	err = conn.Invoke(ctx, "/quizzes.Quizzes/Create", &rawMessage{data: buf}, &resp, grpc.ForceCodec(rawCodec{}))
	if err != nil {
		handleGRPCError(w, err)
		return
	}

	writeProtoJSON(w, resp.data)
}

func UpdateQuiz(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	addr := grpcclient.GetAddresses().QuizService
	conn, err := grpcclient.Dial(addr)
	if err != nil {
		writeError(w, http.StatusServiceUnavailable, "quiz service unavailable")
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
	buf = appendIntField(buf, 5, input, "duration_minutes")
	buf = appendStringField(buf, 6, input, "start_time")
	buf = appendStringField(buf, 7, input, "end_time")

	var resp rawMessage
	err = conn.Invoke(ctx, "/quizzes.Quizzes/Update", &rawMessage{data: buf}, &resp, grpc.ForceCodec(rawCodec{}))
	if err != nil {
		handleGRPCError(w, err)
		return
	}

	writeProtoJSON(w, resp.data)
}

func DeleteQuiz(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	addr := grpcclient.GetAddresses().QuizService
	invokeDelete(w, r, addr, "/quizzes.Quizzes/Delete", id)
}

func AnswerQuiz(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	addr := grpcclient.GetAddresses().QuizService
	conn, err := grpcclient.Dial(addr)
	if err != nil {
		writeError(w, http.StatusServiceUnavailable, "quiz service unavailable")
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
	buf = appendStringField(buf, 2, input, "answer")
	buf = appendIntField(buf, 3, input, "question_index")

	var resp rawMessage
	err = conn.Invoke(ctx, "/quizzes.Quizzes/Answer", &rawMessage{data: buf}, &resp, grpc.ForceCodec(rawCodec{}))
	if err != nil {
		handleGRPCError(w, err)
		return
	}

	writeProtoJSON(w, resp.data)
}

func ListQuizScores(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	addr := grpcclient.GetAddresses().QuizService
	conn, err := grpcclient.Dial(addr)
	if err != nil {
		writeError(w, http.StatusServiceUnavailable, "quiz service unavailable")
		return
	}
	defer conn.Close()

	ctx := grpcclient.ContextWithMetadata(r)

	var buf []byte
	buf = protowire.AppendTag(buf, 1, protowire.BytesType)
	buf = protowire.AppendString(buf, id)

	var resp rawMessage
	err = conn.Invoke(ctx, "/quizzes.Quizzes/ListScoresByQuizId", &rawMessage{data: buf}, &resp, grpc.ForceCodec(rawCodec{}))
	if err != nil {
		handleGRPCError(w, err)
		return
	}

	writeProtoJSON(w, resp.data)
}
