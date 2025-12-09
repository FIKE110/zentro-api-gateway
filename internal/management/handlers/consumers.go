package handlers

import (
	"encoding/json"
	"net/http"
	"os"
	"zentro/internal/config"
	"zentro/utils"
	"github.com/go-chi/chi/v5"
)

func GetConsumersHandler(w http.ResponseWriter, r *http.Request) {
	data, err := os.ReadFile("config/consumers.json")
	if err != nil {
		http.Error(w, "Could not read consumers file", http.StatusInternalServerError)
		return
	}

	var consumerConfig config.ConsumerConfig
	if err := json.Unmarshal(data, &consumerConfig); err != nil {
		http.Error(w, "Could not parse consumers file", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(consumerConfig.Consumers)
}

func CreateConsumerHandler(w http.ResponseWriter, r *http.Request) {
	var newConsumerReq struct {
		Username string `json:"username"`
	}
	if err := json.NewDecoder(r.Body).Decode(&newConsumerReq); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	data, err := os.ReadFile("config/consumers.json")
	if err != nil {
		http.Error(w, "Could not read consumers file", http.StatusInternalServerError)
		return
	}

	var consumerConfig config.ConsumerConfig
	if err := json.Unmarshal(data, &consumerConfig); err != nil {
		http.Error(w, "Could not parse consumers file", http.StatusInternalServerError)
		return
	}

	newConsumer := config.Consumer{
		Id:       utils.GenerateRandomID(16),
		Username: newConsumerReq.Username,
		ApiKey:   "zen_" + utils.GenerateRandomID(32),
	}

	consumerConfig.Consumers = append(consumerConfig.Consumers, newConsumer)

	updatedData, err := json.MarshalIndent(consumerConfig, "", "  ")
	if err != nil {
		http.Error(w, "Could not marshal consumers", http.StatusInternalServerError)
		return
	}

	if err := os.WriteFile("config/consumers.json", updatedData, 0644); err != nil {
		http.Error(w, "Could not write consumers file", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(newConsumer)
}

func GetConsumerHandler(w http.ResponseWriter, r *http.Request) {
	consumerID := chi.URLParam(r, "id")

	data, err := os.ReadFile("config/consumers.json")
	if err != nil {
		http.Error(w, "Could not read consumers file", http.StatusInternalServerError)
		return
	}

	var consumerConfig config.ConsumerConfig
	if err := json.Unmarshal(data, &consumerConfig); err != nil {
		http.Error(w, "Could not parse consumers file", http.StatusInternalServerError)
		return
	}

	for _, consumer := range consumerConfig.Consumers {
		if consumer.Id == consumerID {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(consumer)
			return
		}
	}

	http.NotFound(w, r)
}

func DeleteConsumerHandler(w http.ResponseWriter, r *http.Request) {
	consumerID := chi.URLParam(r, "id")

	data, err := os.ReadFile("config/consumers.json")
	if err != nil {
		http.Error(w, "Could not read consumers file", http.StatusInternalServerError)
		return
	}

	var consumerConfig config.ConsumerConfig
	if err := json.Unmarshal(data, &consumerConfig); err != nil {
		http.Error(w, "Could not parse consumers file", http.StatusInternalServerError)
		return
	}

	var found bool
	var consumerIndex int
	for i, consumer := range consumerConfig.Consumers {
		if consumer.Id == consumerID {
			found = true
			consumerIndex = i
			break
		}
	}

	if !found {
		http.NotFound(w, r)
		return
	}

	consumerConfig.Consumers = append(consumerConfig.Consumers[:consumerIndex], consumerConfig.Consumers[consumerIndex+1:]...)

	updatedData, err := json.MarshalIndent(consumerConfig, "", "  ")
	if err != nil {
		http.Error(w, "Could not marshal consumers", http.StatusInternalServerError)
		return
	}

	if err := os.WriteFile("config/consumers.json", updatedData, 0644); err != nil {
		http.Error(w, "Could not write consumers file", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
