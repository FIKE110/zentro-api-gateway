package management

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
	"zentro/internal/global"
	"zentro/internal/management/auth"

	"github.com/go-chi/chi/v5"
)

type contextKey string

const userContextKey = contextKey("user")

// JwtMiddleware is a middleware that checks for a valid JWT in the Authorization header.
func JwtMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "Authorization header required", http.StatusUnauthorized)
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenString == authHeader {
			http.Error(w, "Could not find bearer token in Authorization header", http.StatusUnauthorized)
			return
		}

		claims, err := auth.ValidateToken(tokenString)
		if err != nil {
			http.Error(w, "Invalid token", http.StatusUnauthorized)
			return
		}

		// Pass user information to the next handler
		ctx := context.WithValue(r.Context(), userContextKey, claims.Username)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// ChangePasswordHandler allows a logged-in user to change their password.
func ChangePasswordHandler(w http.ResponseWriter, r *http.Request) {
	username, ok := r.Context().Value(userContextKey).(string)
	if !ok {
		http.Error(w, "Could not identify user", http.StatusInternalServerError)
		return
	}

	type passwordChangeRequest struct {
		OldPassword string `json:"oldPassword"`
		NewPassword string `json:"newPassword"`
	}

	var req passwordChangeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Authenticate with old password
	_, err := auth.LoginUser(username, req.OldPassword)
	if err != nil {
		http.Error(w, "Invalid old password", http.StatusUnauthorized)
		return
	}

	// Hash and update to new password
	newHash, err := auth.HashPassword(req.NewPassword)
	if err != nil {
		http.Error(w, "Could not process new password", http.StatusInternalServerError)
		return
	}

	user, exists := auth.GetUser(username)
	if !exists {
		http.Error(w, "User not found", http.StatusInternalServerError)
		return
	}

	user.PasswordHash = newHash
	auth.AddUser(user) // AddUser will overwrite the existing user

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Password updated successfully"})
}

func ManagementServer(addr string) {
	user:=global.GetConfig().User 
	username:="admin"

	adminPassword, err := auth.GenerateRandomPassword(16)
	if len(user.Username)!=0{
		username=user.Username
	}


	if len(user.Password)!=0{
		adminPassword=user.Password
	}
	
	if err != nil {
		panic(fmt.Sprintf("Could not generate random password: %v", err))
	}

	if err := auth.SignupUser(username, adminPassword); err != nil {
		panic(fmt.Sprintf("Could not create admin user: %v", err))
	}

	fmt.Println("=======================================")
	fmt.Printf("Default Admin User Initialized\n")
	fmt.Printf("Username: admin\n")
	if len(user.Password)==0{
		fmt.Printf("Password: %s\n", adminPassword)
	}
	fmt.Println("=======================================")

	r := SetupRouter()
	
	// Add settings routes here as they need the middleware context
	r.Route("/api/middle/settings", func(r chi.Router) {
		r.Use(JwtMiddleware)
		r.Post("/change-password", ChangePasswordHandler)
		r.Put("/change-username", ChangeUsernameHandler)
	})


	if err=http.ListenAndServe(addr, r); err!=nil{
		log.Println(err)
	}
}

func ChangeUsernameHandler(w http.ResponseWriter, r *http.Request) {
	username, ok := r.Context().Value(userContextKey).(string)
	if !ok {
		http.Error(w, "Could not identify user", http.StatusInternalServerError)
		return
	}

	type usernameChangeRequest struct {
		NewUsername string `json:"newUsername"`
	}

	var req usernameChangeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Check if new username already exists
	if _, exists := auth.GetUser(req.NewUsername); exists {
		http.Error(w, "New username already taken", http.StatusBadRequest)
		return
	}

	user, _ := auth.GetUser(username)
	
	// Create a new user object with the new username
	newUser := &auth.User{
		Username:     req.NewUsername,
		PasswordHash: user.PasswordHash,
	}

	// Add the new user and delete the old one
	auth.AddUser(newUser)
	auth.DeleteUser(username)

	// Issue a new token with the new username
	newToken, err := auth.GenerateTokenForUser(req.NewUsername)
	if err != nil {
		http.Error(w, "Could not issue new token after username change", http.StatusInternalServerError)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Username updated successfully. Please use the new token.",
		"token":   newToken,
	})
}

