package filters

import (
	"log"
	"net/http"
)

type SetPathFilter struct {
	Name     string
	Settings SetPathSettings
}

type SetPathSettings struct {
	Path string
}

func (f SetPathFilter) Apply(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		r.URL.Path = f.Settings.Path
		log.Printf("Setting path to %s", f.Settings.Path)
		next.ServeHTTP(w, r)
	})
}

func (f *SetPathFilter) Convert(filter GenericFilter) {
	f.Name = filter.Name
	settings := SetPathSettings{}
	if path, ok := filter.Settings["path"].(string); ok {
		settings.Path = path
	} else {
		log.Println("path must be a string for SetPathFilter")
	}
	f.Settings = settings
}