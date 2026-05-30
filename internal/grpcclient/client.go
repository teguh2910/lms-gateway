package grpcclient

import (
	"context"
	"net/http"
	"os"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/grpc/metadata"
)

// ServiceAddresses holds all gRPC service addresses
type ServiceAddresses struct {
	ClassService      string
	ConferenceService string
	MaterialService   string
	QuizService       string
	TaskService       string
	PostService       string
	StorageService    string
	UserService       string
}

// GetAddresses returns service addresses from environment
func GetAddresses() ServiceAddresses {
	return ServiceAddresses{
		ClassService:      getEnv("CLASS_SERVICE_ADDRESS", "localhost:8001"),
		ConferenceService: getEnv("CONFERENCE_SERVICE_ADDRESS", "localhost:8002"),
		MaterialService:   getEnv("MATERIAL_SERVICE_ADDRESS", "localhost:8003"),
		QuizService:       getEnv("QUIZ_SERVICE_ADDRESS", "localhost:8004"),
		TaskService:       getEnv("TASK_SERVICE_ADDRESS", "localhost:8005"),
		PostService:       getEnv("POST_SERVICE_ADDRESS", "localhost:8006"),
		StorageService:    getEnv("STORAGE_SERVICE_ADDRESS", "localhost:8007"),
		UserService:       getEnv("USER_SERVICE_ADDRESS", "localhost:8008"),
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

// Dial creates a gRPC connection to the given address
func Dial(address string) (*grpc.ClientConn, error) {
	return grpc.NewClient(address, grpc.WithTransportCredentials(insecure.NewCredentials()))
}

// ContextWithMetadata creates a context with user metadata from HTTP request headers
func ContextWithMetadata(r *http.Request) context.Context {
	userID := r.Header.Get("X-User-Id")
	universityID := r.Header.Get("X-University-Id")
	programStudiID := r.Header.Get("X-Program-Studi-Id")

	if userID == "" {
		userID = "anonymous"
	}
	if universityID == "" {
		universityID = "default"
	}
	if programStudiID == "" {
		programStudiID = "default"
	}

	md := metadata.New(map[string]string{
		"user_id":          userID,
		"university_id":    universityID,
		"program_studi_id": programStudiID,
	})

	return metadata.NewOutgoingContext(r.Context(), md)
}
