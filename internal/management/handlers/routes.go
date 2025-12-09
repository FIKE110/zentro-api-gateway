package handlers

import (
	"encoding/json"
	"net/http"
	"os"
	"zentro/internal/config"
	"zentro/internal/global"

	"github.com/go-chi/chi/v5"
)

func GetRoutesHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(global.GetConfig().Routes)
}

func CreateRouteHandler(w http.ResponseWriter, r *http.Request) {
	var newRoute config.Route
	if err := json.NewDecoder(r.Body).Decode(&newRoute); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	data, err := os.ReadFile("config/routes.json")
	if err != nil {
		http.Error(w, "Could not read routes file", http.StatusInternalServerError)
		return
	}

	var gatewayConfig config.GatewayConfig
	if err := json.Unmarshal(data, &gatewayConfig); err != nil {
		http.Error(w, "Could not parse routes file", http.StatusInternalServerError)
		return
	}

	gatewayConfig.Routes = append(gatewayConfig.Routes, newRoute)

	updatedData, err := json.MarshalIndent(gatewayConfig, "", "  ")
	if err != nil {
		http.Error(w, "Could not marshal routes", http.StatusInternalServerError)
		return
	}

	if err := os.WriteFile("config/routes.json", updatedData, 0644); err != nil {
		http.Error(w, "Could not write routes file", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(newRoute)
}

func GetRouteHandler(w http.ResponseWriter, r *http.Request) {
	routeID := chi.URLParam(r, "id")

	data, err := os.ReadFile("config/routes.json")
	if err != nil {
		http.Error(w, "Could not read routes file", http.StatusInternalServerError)
		return
	}

	var gatewayConfig config.GatewayConfig
	if err := json.Unmarshal(data, &gatewayConfig); err != nil {
		http.Error(w, "Could not parse routes file", http.StatusInternalServerError)
		return
	}

	for _, route := range gatewayConfig.Routes {
		if route.ID == routeID {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(route)
			return
		}
	}

	http.NotFound(w, r)
}

func UpdateRouteHandler(w http.ResponseWriter, r *http.Request) {
	routeID := chi.URLParam(r, "id")

	var updatedRoute config.Route
	if err := json.NewDecoder(r.Body).Decode(&updatedRoute); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	data, err := os.ReadFile("config/routes.json")
	if err != nil {
		http.Error(w, "Could not read routes file", http.StatusInternalServerError)
		return
	}

	var gatewayConfig config.GatewayConfig
	if err := json.Unmarshal(data, &gatewayConfig); err != nil {
		http.Error(w, "Could not parse routes file", http.StatusInternalServerError)
		return
	}

	var found bool
	for i, route := range gatewayConfig.Routes {
		if route.ID == routeID {
			gatewayConfig.Routes[i] = updatedRoute
			found = true
			break
		}
	}

	if !found {
		http.NotFound(w, r)
		return
	}

	updatedData, err := json.MarshalIndent(gatewayConfig, "", "  ")
	if err != nil {
		http.Error(w, "Could not marshal routes", http.StatusInternalServerError)
		return
	}

	if err := os.WriteFile("config/routes.json", updatedData, 0644); err != nil {
		http.Error(w, "Could not write routes file", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(updatedRoute)
}

func DeleteRouteHandler(w http.ResponseWriter, r *http.Request) {
	routeID := chi.URLParam(r, "id")

	data, err := os.ReadFile("config/routes.json")
	if err != nil {
		http.Error(w, "Could not read routes file", http.StatusInternalServerError)
		return
	}

	var gatewayConfig config.GatewayConfig
	if err := json.Unmarshal(data, &gatewayConfig); err != nil {
		http.Error(w, "Could not parse routes file", http.StatusInternalServerError)
		return
	}

	var found bool
	var routeIndex int
	for i, route := range gatewayConfig.Routes {
		if route.ID == routeID {
			found = true
			routeIndex = i
			break
		}
	}

	if !found {
		http.NotFound(w, r)
		return
	}

	gatewayConfig.Routes = append(gatewayConfig.Routes[:routeIndex], gatewayConfig.Routes[routeIndex+1:]...)

	updatedData, err := json.MarshalIndent(gatewayConfig, "", "  ")
	if err != nil {
		http.Error(w, "Could not marshal routes", http.StatusInternalServerError)
		return
	}

	if err := os.WriteFile("config/routes.json", updatedData, 0644); err != nil {
		http.Error(w, "Could not write routes file", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}


type PlaygroundRoute struct{
	Id string `json:"id"`
	Name string `json:"name"`
	PathPrefix	string `json:"path_prefix"`
}

func PlaygroundRoutesHandler(w http.ResponseWriter, r *http.Request) {
	paths:=[]PlaygroundRoute{}
	routes:=global.GetConfig().Routes
	for _,r := range routes{
		route:=PlaygroundRoute{
			Id: r.ID,
			Name: r.Name,
			PathPrefix: r.PathPrefix,
		}
		paths=append(paths,route)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(paths)
}
