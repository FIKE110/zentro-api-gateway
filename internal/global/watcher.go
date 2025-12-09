package global

import (
	"log"
	"sync/atomic"
	"time"
	"zentro/internal/config"
	"github.com/fsnotify/fsnotify"
)

var CurrentConfig atomic.Value

func InitConfig(cfg *config.GatewayConfig) {
	CurrentConfig.Store(cfg)
}

func GetConfig() *config.GatewayConfig {
	return CurrentConfig.Load().(*config.GatewayConfig)
}


func WatchConfigFile(path string) {
	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		log.Fatal("watcher error:", err)
	}

	go func() {
		defer watcher.Close()

		debounce := time.NewTimer(time.Hour)
		debounce.Stop()

		for {
			select {
			case event := <-watcher.Events:
	
				if event.Op&(fsnotify.Write|fsnotify.Create) != 0 {
					debounce.Reset(200 * time.Millisecond)
				}

			case <-debounce.C:
				// Reload config after debounce
				newCfg, err := config.LoadRoutes(path)
				if err == nil {
					InitConfig(newCfg)
					log.Println("🔥 Config hot-reloaded successfully")
				} else {
					log.Println("❌ Reload failed:", err)
				}

			case err := <-watcher.Errors:
				log.Println("watch error:", err)
			}
		}
	}()

	// Start watching the file
	if err := watcher.Add(path); err != nil {
		log.Println("❌ Cannot watch file:", err)
	}
}
