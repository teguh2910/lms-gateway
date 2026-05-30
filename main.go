package main

import (
	"log"
	"net/http"
	"os"

	"lms-gateway/internal/config"
	"lms-gateway/internal/handler"
	"lms-gateway/internal/middleware"
)

func main() {
	if _, ok := os.LookupEnv("PORT"); !ok {
		config.Setup(".env")
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	logger := log.New(os.Stdout, "GATEWAY : ", log.LstdFlags|log.Lmicroseconds|log.Lshortfile)

	mux := http.NewServeMux()

	// Health check
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"ok"}`))
	})

	// API index
	mux.HandleFunc("GET /api/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{
			"service": "LMS Gateway",
			"version": "1.0.0",
			"endpoints": {
				"auth": "/api/auth/login",
				"register": "/api/auth/register",
				"users": "/api/users",
				"subjects": "/api/subjects",
				"classes": "/api/classes",
				"subject_classes": "/api/subject-classes",
				"conferences": "/api/conferences",
				"materials": "/api/materials",
				"quizzes": "/api/quizzes/{id}",
				"tasks": "/api/tasks/{id}",
				"posts": "/api/posts/{id}",
				"storage": "/api/storage/{id}"
			}
		}`))
	})

	// Auth routes
	mux.HandleFunc("POST /api/auth/login", handler.Login)
	mux.HandleFunc("POST /api/auth/register", handler.Register)

	// User routes
	mux.HandleFunc("GET /api/users", handler.ListUsers)
	mux.HandleFunc("GET /api/users/{id}", handler.GetUser)
	mux.HandleFunc("PUT /api/users/{id}", handler.UpdateUser)
	mux.HandleFunc("POST /api/users/{id}/change-password", handler.ChangePassword)
	mux.HandleFunc("DELETE /api/users/{id}", handler.DeleteUser)

	// Subject routes
	mux.HandleFunc("GET /api/subjects", handler.ListSubjects)
	mux.HandleFunc("GET /api/subjects/{id}", handler.GetSubject)
	mux.HandleFunc("POST /api/subjects", handler.CreateSubject)
	mux.HandleFunc("PUT /api/subjects/{id}", handler.UpdateSubject)
	mux.HandleFunc("DELETE /api/subjects/{id}", handler.DeleteSubject)

	// Class routes
	mux.HandleFunc("GET /api/classes", handler.ListClasses)
	mux.HandleFunc("GET /api/classes/{id}", handler.GetClass)
	mux.HandleFunc("POST /api/classes", handler.CreateClass)
	mux.HandleFunc("PUT /api/classes/{id}", handler.UpdateClass)
	mux.HandleFunc("DELETE /api/classes/{id}", handler.DeleteClass)

	// Subject Class routes
	mux.HandleFunc("GET /api/subject-classes", handler.ListSubjectClasses)
	mux.HandleFunc("POST /api/subject-classes", handler.CreateSubjectClass)
	mux.HandleFunc("DELETE /api/subject-classes/{id}", handler.DeleteSubjectClass)

	// Conference routes
	mux.HandleFunc("GET /api/conferences", handler.ListConferences)
	mux.HandleFunc("GET /api/conferences/{id}", handler.GetConference)
	mux.HandleFunc("POST /api/conferences", handler.CreateConference)
	mux.HandleFunc("PUT /api/conferences/{id}", handler.UpdateConference)
	mux.HandleFunc("DELETE /api/conferences/{id}", handler.DeleteConference)
	mux.HandleFunc("POST /api/conferences/{id}/join", handler.JoinConference)

	// Material routes
	mux.HandleFunc("GET /api/materials", handler.ListMaterials)
	mux.HandleFunc("GET /api/materials/{id}", handler.GetMaterial)
	mux.HandleFunc("POST /api/materials", handler.CreateMaterial)
	mux.HandleFunc("PUT /api/materials/{id}", handler.UpdateMaterial)
	mux.HandleFunc("DELETE /api/materials/{id}", handler.DeleteMaterial)
	mux.HandleFunc("POST /api/materials/{id}/download", handler.DownloadMaterial)

	// Quiz routes
	mux.HandleFunc("GET /api/quizzes/{id}", handler.GetQuiz)
	mux.HandleFunc("POST /api/quizzes", handler.CreateQuiz)
	mux.HandleFunc("PUT /api/quizzes/{id}", handler.UpdateQuiz)
	mux.HandleFunc("DELETE /api/quizzes/{id}", handler.DeleteQuiz)
	mux.HandleFunc("POST /api/quizzes/{id}/answer", handler.AnswerQuiz)
	mux.HandleFunc("GET /api/quizzes/{id}/scores", handler.ListQuizScores)

	// Task routes
	mux.HandleFunc("GET /api/tasks/{id}", handler.GetTask)
	mux.HandleFunc("POST /api/tasks", handler.CreateTask)
	mux.HandleFunc("PUT /api/tasks/{id}", handler.UpdateTask)
	mux.HandleFunc("DELETE /api/tasks/{id}", handler.DeleteTask)
	mux.HandleFunc("POST /api/tasks/{id}/submit", handler.SubmitTask)
	mux.HandleFunc("POST /api/tasks/grade", handler.GradeTask)
	mux.HandleFunc("GET /api/tasks/{id}/students", handler.ListStudentTasks)

	// Post routes
	mux.HandleFunc("GET /api/posts/{id}", handler.GetPost)
	mux.HandleFunc("POST /api/posts", handler.CreatePost)
	mux.HandleFunc("PUT /api/posts/{id}", handler.UpdatePost)
	mux.HandleFunc("POST /api/posts/{id}/unpublish", handler.UnpublishPost)
	mux.HandleFunc("POST /api/posts/{id}/comment", handler.CreateComment)

	// Storage routes
	mux.HandleFunc("POST /api/storage/upload", handler.UploadFile)
	mux.HandleFunc("GET /api/storage/{id}", handler.GetFile)
	mux.HandleFunc("DELETE /api/storage/{id}", handler.DeleteFile)

	// Serve frontend - SPA fallback (serve index.html for client-side routes)
	frontendDir := "./frontend/dist"
	mux.HandleFunc("GET /", func(w http.ResponseWriter, r *http.Request) {
		// Try to serve static file first
		path := frontendDir + r.URL.Path
		if r.URL.Path != "/" {
			if _, err := os.Stat(path); err == nil {
				http.ServeFile(w, r, path)
				return
			}
		}
		// Fallback to index.html for SPA routing
		http.ServeFile(w, r, frontendDir+"/index.html")
	})

	// Apply middleware
	wrapped := middleware.CORS(middleware.Logger(logger, mux))

	logger.Printf("Gateway server starting on port %s", port)
	if err := http.ListenAndServe(":"+port, wrapped); err != nil {
		logger.Fatalf("Server failed: %v", err)
	}
}
