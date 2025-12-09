package filters

import (
	"log"
	"net/http"
	"strings"
)

type StripPrefixFilter struct {
	Name     string
	Settings StripPrefixSettings
}

type StripPrefixSettings struct {
	Prefix string
}

func (f StripPrefixFilter) Apply(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if strings.HasPrefix(r.URL.Path, f.Settings.Prefix) {
			r.URL.Path = strings.TrimPrefix(r.URL.Path, f.Settings.Prefix)
			log.Printf("Stripping prefix %s from path. New path: %s", f.Settings.Prefix, r.URL.Path)
		}
		next.ServeHTTP(w, r)
	})
}

func (f *StripPrefixFilter) Convert(filter GenericFilter) {
	f.Name = filter.Name
	settings := StripPrefixSettings{}
	if prefix, ok := filter.Settings["prefix"].(string); ok {
		settings.Prefix = prefix
	} else {
		log.Println("prefix must be a string for StripPrefixFilter")
	}
	f.Settings = settings
}
