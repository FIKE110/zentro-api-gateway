package filters

import (
	"log"
	"net/http"
)

type RedirectToFilter struct {
	Name     string
	Settings RedirectToSettings
}

type RedirectToSettings struct {
	StatusCode int
	URL        string
}

func (f RedirectToFilter) Apply(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Printf("Redirecting to %s with status code %d", f.Settings.URL, f.Settings.StatusCode)
		http.Redirect(w, r, f.Settings.URL, f.Settings.StatusCode)
	})
}

func (f *RedirectToFilter) Convert(filter GenericFilter) {
	f.Name = filter.Name
	settings := RedirectToSettings{}
	if statusCode, ok := filter.Settings["status_code"].(float64); ok {
		settings.StatusCode = int(statusCode)
	} else {
		settings.StatusCode = http.StatusFound
	}
	if url, ok := filter.Settings["url"].(string); ok {
		settings.URL = url
	} else {
		log.Println("url must be a string for RedirectToFilter")
	}
	f.Settings = settings
}

func (f RedirectToFilter) IsResponseFilter() bool {
    return false
}

func (f RedirectToFilter) ApplyResponse(resp *http.Response) error {
    return nil
}
