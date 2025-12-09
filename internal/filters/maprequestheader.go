package filters

import (
	"log"
	"net/http"
)

type MapRequestHeaderFilter struct {
	Name     string
	Settings MapRequestHeaderSettings
}

type MapRequestHeaderSettings struct {
	From string
	To   string
}

func (f MapRequestHeaderFilter) Apply(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		value := r.Header.Get(f.Settings.From)
		if value != "" {
			r.Header.Set(f.Settings.To, value)
			r.Header.Del(f.Settings.From)
			log.Printf("Mapped request header '%s' to '%s'", f.Settings.From, f.Settings.To)
		} else {
			log.Printf("Request header '%s' not found to map.", f.Settings.From)
		}
		next.ServeHTTP(w, r)
	})
}

func (f *MapRequestHeaderFilter) Convert(filter GenericFilter) {
	f.Name = filter.Name
	settings := MapRequestHeaderSettings{}
	if from, ok := filter.Settings["from"].(string); ok {
		settings.From = from
	} else {
		log.Println("from must be a string for MapRequestHeaderFilter")
	}
	if to, ok := filter.Settings["to"].(string); ok {
		settings.To = to
	} else {
		log.Println("to must be a string for MapRequestHeaderFilter")
	}
	f.Settings = settings
}

func (f MapRequestHeaderFilter) IsResponseFilter() bool {
    return false
}

func (f MapRequestHeaderFilter) ApplyResponse(resp *http.Response) error {
    return nil
}