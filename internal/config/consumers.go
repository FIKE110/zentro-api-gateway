package config

import (
	"encoding/json"
	"log"
	"os"
	"zentro/utils"
)

// Consumer represents a client that is authorized to access the gateway.
type Consumer struct {
	Id       string `json:"id"`
	Username string `json:"username"`
	ApiKey   string `json:"apiKey"`
}

// ConsumerConfig holds the list of all consumers.
type ConsumerConfig struct {
	Consumers []Consumer `json:"consumers"`
}

// LoadConsumers reads and parses the consumers.json file.
func LoadConsumers(path string) (*ConsumerConfig, error) {
	file, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}

	var cfg ConsumerConfig
	if err := json.Unmarshal(file, &cfg); err != nil {
		return nil, err
	}

	// Auto-generate IDs and API keys if they are missing
	for i := range cfg.Consumers {
		if cfg.Consumers[i].Id == "" {
			cfg.Consumers[i].Id = utils.GenerateRandomID(16)
		}
		if cfg.Consumers[i].ApiKey == "" {
			cfg.Consumers[i].ApiKey = "zen_" + utils.GenerateRandomID(32)
		}
	}

	return &cfg, nil
}

// MustLoadConsumers loads consumers and panics on error.
func MustLoadConsumers(path string) *ConsumerConfig {
	cfg, err := LoadConsumers(path)
	if err != nil {
		log.Fatalf("Failed to load consumers: %v", err)
	}
	return cfg
}