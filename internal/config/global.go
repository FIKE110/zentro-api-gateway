package config

import "sync"

type GlobalConfig struct {
	Name                string `json:"name"`
	Environment         string `json:"environment"`
	Port                int    `json:"port"`
	AdminEmail          string `json:"admin_email"`
	GlobalRateLimiting int    `json:"global_rate_limiting"`
	Cors                bool   `json:"cors"`
}

var (
	globalConfig *GlobalConfig
	configLock   = &sync.RWMutex{}
	GatewayName  = ` ███████████                      █████
░█░░░░░░███                      ░░███
░     ███░    ██████  ████████   ███████    ██████  ████████
     ███     ███░░███░░███░░███ ░░░███░    ███░░███░░███░░███
    ███     ░███████  ░███ ░███   ░███    ░███ ░███ ░███ ░░░
  ████     █░███░░░   ░███ ░███   ░███ ███░███ ░███ ░███
 ███████████░░██████  ████ █████  ░░█████ ░░██████  █████
░░░░░░░░░░░  ░░░░░░  ░░░░ ░░░░░    ░░░░░   ░░░░░░  ░░░░░ `
)

func init() {
	globalConfig = &GlobalConfig{
		Name:                "Zentor gateway",
		Environment:         "Development",
		Port:                8000,
		AdminEmail:          "dev@localhost",
		GlobalRateLimiting: 10000,
		Cors:                true,
	}
}

func GetGlobalConfig() *GlobalConfig {
	configLock.RLock()
	defer configLock.RUnlock()
	return globalConfig
}

func UpdateGlobalConfig(newConfig *GlobalConfig) {
	configLock.Lock()
	defer configLock.Unlock()
	globalConfig = newConfig
};