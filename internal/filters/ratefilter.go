package filters

import (
	"net/http"
	"sync"
	"time"
)

type ClientLimiter struct {
	Requests  int
	LastReset time.Time
	Window    time.Duration
}

var limiters = make(map[string]*ClientLimiter)
var mu sync.Mutex

type RateLimitFilter struct {
	Name     string
	Settings RateLimitFilterSettings
}

type RateLimitFilterSettings struct {
	MaxRequests int
	PerSeconds  int
}

func (r *RateLimitFilter) Apply(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
		ip := req.RemoteAddr

		mu.Lock()
		limiter, exists := limiters[ip]

		window := time.Duration(r.Settings.PerSeconds) * time.Second
		maxRequests := r.Settings.MaxRequests

		if !exists || time.Since(limiter.LastReset) > window {
			limiter = &ClientLimiter{
				Requests:  0,
				LastReset: time.Now(),
				Window:    window,
			}
			limiters[ip] = limiter
		}

		if limiter.Requests >= maxRequests {
			mu.Unlock()
			http.Error(w, "Rate limit exceeded", http.StatusTooManyRequests)
			return
		}

		limiter.Requests++
		mu.Unlock()

		next.ServeHTTP(w, req)
	})
}

func (r *RateLimitFilter) Convert(filter GenericFilter) {
	settings := RateLimitFilterSettings{}

	if max, ok := filter.Settings["max_requests"].(int); ok {
		settings.MaxRequests = max
	} else {
		settings.MaxRequests = 100
	}

	if seconds, ok := filter.Settings["per_second"].(int); ok {
		settings.PerSeconds = seconds
	} else {
		settings.PerSeconds = 10
	}

	r.Settings = settings
}
