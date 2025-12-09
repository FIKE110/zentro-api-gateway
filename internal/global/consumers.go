package global

import (
	"log"
	"sync/atomic"
	"time"
	"zentro/internal/config"

	"github.com/fsnotify/fsnotify"
)

var currentConsumers atomic.Value

// InitConsumers initializes the global consumer configuration.
func InitConsumers(cfg *config.ConsumerConfig) {
	currentConsumers.Store(cfg)
}

// GetConsumers returns the current consumer configuration.
func GetConsumers() *config.ConsumerConfig {
	val := currentConsumers.Load()
	if val == nil {
		// Return an empty config if it hasn't been loaded yet
		return &config.ConsumerConfig{Consumers: []config.Consumer{}}
	}
	return val.(*config.ConsumerConfig)
}

// WatchConsumersFile watches for changes and hot-reloads the consumer config.
func WatchConsumersFile(path string) {
	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		log.Fatal("consumer watcher error:", err)
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
				newCfg, err := config.LoadConsumers(path)
				if err == nil {
					InitConsumers(newCfg)
					log.Println("🔥 Consumers hot-reloaded successfully")
				} else {
					log.Println("❌ Consumer reload failed:", err)
				}

			case err := <-watcher.Errors:
				log.Println("consumer watch error:", err)
			}
		}
	}()

	if err := watcher.Add(path); err != nil {
		log.Println("❌ Cannot watch consumers file:", err)
	}
}
