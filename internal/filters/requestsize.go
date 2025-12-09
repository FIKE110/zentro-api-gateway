package filters

import (
	"log"
	"net/http"
	"strconv"
)

type RequestSizeFilter struct {
	Name     string
	Settings RequestSizeSettings
}

type RequestSizeSettings struct {
	MaxSize int // Maximum allowed request body size in bytes
}

func (f RequestSizeFilter) Apply(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if f.Settings.MaxSize > 0 {
			contentLengthStr := r.Header.Get("Content-Length")
			if contentLengthStr != "" {
				contentLength, err := strconv.ParseInt(contentLengthStr, 10, 64)
				if err != nil {
					log.Printf("Error parsing Content-Length header: %v", err)
					http.Error(w, "Bad Request", http.StatusBadRequest)
					return
				}

				if contentLength > int64(f.Settings.MaxSize) {
					log.Printf("Request body size (%d bytes) exceeds maximum allowed size (%d bytes)", contentLength, f.Settings.MaxSize)
					http.Error(w, "Payload Too Large", http.StatusRequestEntityTooLarge)
					return
				}
			} else {
				log.Printf("Content-Length header missing, skipping request body size check for filter '%s'.", f.Name)
			}
		}
		next.ServeHTTP(w, r)
	})
}

func (f *RequestSizeFilter) Convert(filter GenericFilter) {
	f.Name = filter.Name
	settings := RequestSizeSettings{}
	if maxSize, ok := filter.Settings["max_size"].(float64); ok { // JSON numbers unmarshal to float64
		settings.MaxSize = int(maxSize)
	} else {
		log.Println("max_size must be an integer for RequestSizeFilter, defaulting to 0 (no limit).")
		settings.MaxSize = 0
	}
	f.Settings = settings
}

func (f RequestSizeFilter) IsResponseFilter() bool {
    return false
}

func (f RequestSizeFilter) ApplyResponse(resp *http.Response) error {
    return nil
}