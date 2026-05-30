package handler

import (
	"encoding/json"
	"net/http"
)

// Login is a simple mock login that returns user metadata
// In production, this would validate credentials against a user service
func Login(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request body"}`, http.StatusBadRequest)
		return
	}

	// Mock response - in production this would validate against user-services
	resp := map[string]interface{}{
		"token":            "mock-jwt-token",
		"user_id":          "550e8400-e29b-41d4-a716-446655440000",
		"university_id":    "660e8400-e29b-41d4-a716-446655440000",
		"program_studi_id": "770e8400-e29b-41d4-a716-446655440000",
		"name":             "Test User",
		"email":            req.Email,
		"role":             "teacher",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
