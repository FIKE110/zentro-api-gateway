package handlers

import (
	"encoding/json"
	"io"
	"net/http"

	"zentro/internal/config"
)

func GetGlobalSettingsHandler(w http.ResponseWriter, r *http.Request) {
	
	settings := &config.GlobalConfig{
		Name: config.GetGlobalConfig().Name,
		Environment: config.GetGlobalConfig().Environment,
		Port: config.GetGlobalConfig().Port,
		AdminEmail: "admin",
		GlobalRateLimiting: config.GetGlobalConfig().GlobalRateLimiting,
		Cors: config.GetGlobalConfig().Cors,
	}
	jsonResponse, err := json.Marshal(settings)
	if err != nil {
		http.Error(w, "Error marshalling global settings", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(jsonResponse)
}

func UpdateGlobalSettingsHandler(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Could not read request body", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	var updatedSettings config.GlobalConfig
	err = json.Unmarshal(body, &updatedSettings)
	if err != nil {
		http.Error(w, "Could not unmarshal request body", http.StatusBadRequest)
		return
	}

	config.UpdateGlobalConfig(&updatedSettings)

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Global settings updated successfully."))
}
