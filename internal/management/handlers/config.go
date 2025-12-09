package handlers

import (
	"io"
	"net/http"
	"os"
)

func GetConfigHandler(w http.ResponseWriter, r *http.Request) {
	data, err := os.ReadFile("config/routes.json")
	if err != nil {
		http.Error(w, "Could not read config file", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(data)
}

func UpdateConfigHandler(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Could not read request body", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	// It's a good practice to validate the JSON before writing,
	// but for now, we'll just write it as requested.
	// A production system should unmarshal to a struct to validate.

	if err := os.WriteFile("config/routes.json", body, 0644); err != nil {
		http.Error(w, "Could not write config file", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Configuration updated successfully. Hot-reload will be triggered."))
}
