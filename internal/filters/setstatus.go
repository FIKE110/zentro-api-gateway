package filters

import (
	"log"
	"net/http"
)

type SetStatusFilter struct {
	Name     string
	Settings SetStatusSettings
}

type SetStatusSettings struct {
	StatusCode int
}

func (f SetStatusFilter) Apply(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Printf("Setting status code to %d and terminating request.", f.Settings.StatusCode)
		w.WriteHeader(f.Settings.StatusCode)
	})
}

func (f *SetStatusFilter) Convert(filter GenericFilter) {
	f.Name = filter.Name
	settings := SetStatusSettings{}
	if statusCode, ok := filter.Settings["status_code"].(float64); ok {
		settings.StatusCode = int(statusCode)
	} else {
		settings.StatusCode = http.StatusOK
	}
	f.Settings = settings
}