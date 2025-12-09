package filters

import (
	"log"
	"net/http"
	"strconv"
	"strings"
)

type CorsWebFilter struct {
	Name     string
	Settings CorsWebSettings
}

type CorsWebSettings struct {
	AllowOrigins     []string
	AllowMethods     []string
	AllowHeaders     []string
	AllowCredentials bool
	MaxAge           int
}

func (f CorsWebFilter) Apply(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Set Vary header regardless
		w.Header().Add("Vary", "Origin")
		w.Header().Add("Vary", "Access-Control-Request-Method")
		w.Header().Add("Vary", "Access-Control-Request-Headers")

		// Handle pre-flight requests
		if r.Method == http.MethodOptions {
			log.Println("Handling pre-flight request")
			origin := r.Header.Get("Origin")
			if f.isOriginAllowed(origin) {
				w.Header().Set("Access-Control-Allow-Origin", origin)
			}

			if len(f.Settings.AllowMethods) > 0 {
				w.Header().Set("Access-Control-Allow-Methods", strings.Join(f.Settings.AllowMethods, ","))
			} else {
				w.Header().Set("Access-Control-Allow-Methods", r.Header.Get("Access-Control-Request-Method"))
			}

			if len(f.Settings.AllowHeaders) > 0 {
				w.Header().Set("Access-Control-Allow-Headers", strings.Join(f.Settings.AllowHeaders, ","))
			} else {
				w.Header().Set("Access-Control-Allow-Headers", r.Header.Get("Access-Control-Request-Headers"))
			}

			if f.Settings.AllowCredentials {
				w.Header().Set("Access-Control-Allow-Credentials", "true")
			}

			if f.Settings.MaxAge > 0 {
				w.Header().Set("Access-Control-Max-Age", strconv.Itoa(f.Settings.MaxAge))
			}

			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func (f *CorsWebFilter) Convert(filter GenericFilter) {
	f.Name = filter.Name
	settings := CorsWebSettings{}
	if allowOrigins, ok := filter.Settings["allow_origins"].([]interface{}); ok {
		for _, origin := range allowOrigins {
			if s, ok := origin.(string); ok {
				settings.AllowOrigins = append(settings.AllowOrigins, s)
			}
		}
	}
	if allowMethods, ok := filter.Settings["allow_methods"].([]interface{}); ok {
		for _, method := range allowMethods {
			if s, ok := method.(string); ok {
				settings.AllowMethods = append(settings.AllowMethods, s)
			}
		}
	}
	if allowHeaders, ok := filter.Settings["allow_headers"].([]interface{}); ok {
		for _, header := range allowHeaders {
			if s, ok := header.(string); ok {
				settings.AllowHeaders = append(settings.AllowHeaders, s)
			}
		}
	}
	if allowCredentials, ok := filter.Settings["allow_credentials"].(bool); ok {
		settings.AllowCredentials = allowCredentials
	}
	if maxAge, ok := filter.Settings["max_age"].(float64); ok {
		settings.MaxAge = int(maxAge)
	}
	f.Settings = settings
}

func (f CorsWebFilter) isOriginAllowed(origin string) bool {
	if len(f.Settings.AllowOrigins) == 0 {
		return false
	}
	if len(f.Settings.AllowOrigins) == 1 && f.Settings.AllowOrigins[0] == "*" {
		return true
	}
	for _, allowedOrigin := range f.Settings.AllowOrigins {
		if allowedOrigin == origin {
			return true
		}
	}
	return false
}

func (f CorsWebFilter) IsResponseFilter() bool {
    return true
}

func (f CorsWebFilter) ApplyResponse(resp *http.Response) error {
    log.Printf("Applying CorsWebFilter: %s", f.Name)

    // Set Access-Control-Allow-Origin
    origin := resp.Request.Header.Get("Origin")
    if f.isOriginAllowed(origin) {
        resp.Header.Set("Access-Control-Allow-Origin", origin)
    }

    // Set Access-Control-Allow-Credentials
    if f.Settings.AllowCredentials {
        resp.Header.Set("Access-Control-Allow-Credentials", "true")
    }

    return nil
}