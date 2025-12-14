package config

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"zentro/internal/filters"
	"zentro/internal/lb"
	"zentro/utils"
)

type Auth struct {
	Enabled bool   `json:"enabled,omitempty"`
	Type    string `json:"type,omitempty"`
	Header  string `json:"header,omitempty"`
}

type Route struct {
	ID          string                  `json:"id,omitempty"`
	Name        string                  `json:"name,omitempty"`
	PathPrefix  string                  `json:"path_prefix,omitempty"`
	Methods     []string                `json:"methods,omitempty"`
	Headers     map[string]string       `json:"headers,omitempty"`
	QueryParams map[string]string       `json:"query_params,omitempty"`
	Host        string                  `json:"host,omitempty"`
	Upstreams   []string                `json:"upstreams"`
	Enabled     *bool                   `json:"enabled,omitempty"`
	Auth        Auth                    `json:"auth,omitempty"`
	Filters     []filters.GenericFilter `json:"filters,omitempty"`
	Lb          *lb.LoadBalancer        `json:"lb,omitempty"`
}

type Health struct {
	Cooldown uint `json:"cooldown,omitempty"`
	Failures uint `json:"failures,omitempty"`
}

type Config struct {
	Health Health `json:"health,omitempty"`
}

type ConfigUser struct {
	Username string `json:"username,omitempty"`
	Password string `json:"password,omitempty"`
}

type GatewayConfig struct {
	Routes      []Route    `json:"routes"`
	Config      Config     `json:"config"`
	User        ConfigUser `json:"user"`
	Environment string     `json:"environment"`
}

func (r Route) IsEnabled() bool {
	if r.Enabled == nil {
		return true
	}
	return *r.Enabled
}

func LoadRoutes(path string) (*GatewayConfig, error) {
	file, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}

	var cfg GatewayConfig
	if err := json.Unmarshal(file, &cfg); err != nil {
		return nil, err
	}

	for i := range cfg.Routes {
		if cfg.Routes[i].ID == "" {
			cfg.Routes[i].ID = fmt.Sprint(cfg.Routes[i].Name, "@", utils.GenerateRouteID())
		}

		if cfg.Routes[i].Enabled == nil {
			enable := true
			cfg.Routes[i].Enabled = &enable
		}

		if cfg.Routes[i].Name == "" {
			cfg.Routes[i].ID = utils.GenerateRouteID()
		}

		if cfg.Config.Health.Cooldown == 0 {
			cfg.Config.Health.Cooldown = 5
		}

		if cfg.Config.Health.Failures == 0 {
			cfg.Config.Health.Failures = 3
		}

		cfg.Routes[i].Lb = lb.New(cfg.Routes[i].Upstreams, cfg.Config.Health.Cooldown, cfg.Config.Health.Failures)

	}

	return &cfg, nil
}

func MustLoadRoutes(path string) (*GatewayConfig, error) {
	cfg, err := LoadRoutes(path)
	if err != nil {
		log.Fatalf("Failed to load routes: %v", err)
		return nil, err
	}
	return cfg, nil
}
