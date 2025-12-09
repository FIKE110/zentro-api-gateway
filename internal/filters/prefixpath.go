package filters

import (
	"log"
	"net/http"
)

type PrefixPathFilter struct {
	Name     string
	Settings PrefixPathSettings
}

type PrefixPathSettings struct {
	Prefix string
}

func (f PrefixPathFilter) Apply(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		r.URL.Path = f.Settings.Prefix + r.URL.Path
		log.Printf("Adding prefix %s to path. New path: %s", f.Settings.Prefix, r.URL.Path)
		next.ServeHTTP(w, r)
	})
}

func (f *PrefixPathFilter) Convert(filter GenericFilter) {
	f.Name = filter.Name
	settings := PrefixPathSettings{}
	if prefix, ok := filter.Settings["prefix"].(string); ok {
		settings.Prefix = prefix
	} else {
		log.Println("prefix must be a string for PrefixPathFilter")
	}
	f.Settings = settings
}