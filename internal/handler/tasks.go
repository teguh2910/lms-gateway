package handler

import (
	"net/http"

	"lms-gateway/internal/grpcclient"
	genericpb "lms-gateway/pb/task/generic"
	taskspb "lms-gateway/pb/task/tasks"
)

func taskConn(w http.ResponseWriter) (*grpcConn, bool) {
	addr := grpcclient.GetAddresses().TaskService
	conn, err := grpcclient.Dial(addr)
	if err != nil {
		writeError(w, http.StatusServiceUnavailable, "task service unavailable")
		return nil, false
	}
	return &grpcConn{conn: conn}, true
}

func GetTask(w http.ResponseWriter, r *http.Request) {
	c, ok := taskConn(w)
	if !ok {
		return
	}
	defer c.Close()

	client := taskspb.NewTaskServiceClient(c.conn)
	ctx := grpcclient.ContextWithMetadata(r)
	resp, err := client.Get(ctx, &genericpb.Id{Id: r.PathValue("id")})
	if err != nil {
		handleGRPCError(w, err)
		return
	}
	writeProto(w, resp)
}

func CreateTask(w http.ResponseWriter, r *http.Request) {
	c, ok := taskConn(w)
	if !ok {
		return
	}
	defer c.Close()

	in := &taskspb.TaskInput{}
	if err := readProto(r, in); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	client := taskspb.NewTaskServiceClient(c.conn)
	ctx := grpcclient.ContextWithMetadata(r)
	resp, err := client.Create(ctx, in)
	if err != nil {
		handleGRPCError(w, err)
		return
	}
	writeProto(w, resp)
}

func UpdateTask(w http.ResponseWriter, r *http.Request) {
	c, ok := taskConn(w)
	if !ok {
		return
	}
	defer c.Close()

	in := &taskspb.TaskUpdate{}
	if err := readProto(r, in); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	in.Id = r.PathValue("id")
	client := taskspb.NewTaskServiceClient(c.conn)
	ctx := grpcclient.ContextWithMetadata(r)
	resp, err := client.Update(ctx, in)
	if err != nil {
		handleGRPCError(w, err)
		return
	}
	writeProto(w, resp)
}

func DeleteTask(w http.ResponseWriter, r *http.Request) {
	c, ok := taskConn(w)
	if !ok {
		return
	}
	defer c.Close()

	client := taskspb.NewTaskServiceClient(c.conn)
	ctx := grpcclient.ContextWithMetadata(r)
	resp, err := client.Delete(ctx, &genericpb.Id{Id: r.PathValue("id")})
	if err != nil {
		handleGRPCError(w, err)
		return
	}
	writeProto(w, resp)
}

func SubmitTask(w http.ResponseWriter, r *http.Request) {
	c, ok := taskConn(w)
	if !ok {
		return
	}
	defer c.Close()

	in := &taskspb.StudentTaskInput{}
	if err := readProto(r, in); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	in.TaskId = r.PathValue("id")
	client := taskspb.NewTaskServiceClient(c.conn)
	ctx := grpcclient.ContextWithMetadata(r)
	resp, err := client.StudentSubmit(ctx, in)
	if err != nil {
		handleGRPCError(w, err)
		return
	}
	writeProto(w, resp)
}

func GradeTask(w http.ResponseWriter, r *http.Request) {
	c, ok := taskConn(w)
	if !ok {
		return
	}
	defer c.Close()

	in := &taskspb.GradeInput{}
	if err := readProto(r, in); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	client := taskspb.NewTaskServiceClient(c.conn)
	ctx := grpcclient.ContextWithMetadata(r)
	resp, err := client.TeacherGrade(ctx, in)
	if err != nil {
		handleGRPCError(w, err)
		return
	}
	writeProto(w, resp)
}

func ListStudentTasks(w http.ResponseWriter, r *http.Request) {
	c, ok := taskConn(w)
	if !ok {
		return
	}
	defer c.Close()

	client := taskspb.NewTaskServiceClient(c.conn)
	ctx := grpcclient.ContextWithMetadata(r)
	resp, err := client.ListStudentTasks(ctx, &taskspb.StudentTaskListInput{
		Pagination: &genericpb.Pagination{
			Limit:  parseUint(r.URL.Query().Get("limit")),
			Offset: parseUint(r.URL.Query().Get("offset")),
		},
		TaskId: r.PathValue("id"),
	})
	if err != nil {
		handleGRPCError(w, err)
		return
	}
	writeProto(w, resp)
}
