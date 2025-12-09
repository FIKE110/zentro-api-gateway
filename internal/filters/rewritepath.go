package filters

import (
	"log"
	"net/http"
	"regexp"
)

type RewritePathFilter struct {
	Name     string
	Settings RewritePathSettings
}

type RewritePathSettings struct {
	From string
	To   string
}

func (f RewritePathFilter) Apply(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		re := regexp.MustCompile(f.Settings.From)
		r.URL.Path = re.ReplaceAllString(r.URL.Path, f.Settings.To)
		log.Printf("Rewriting path from %s to %s", r.URL.Path, f.Settings.To)
		next.ServeHTTP(w, r)
	})
}

func (f *RewritePathFilter) Convert(filter GenericFilter) {
	f.Name = filter.Name
	settings := RewritePathSettings{}
	if from, ok := filter.Settings["from"].(string); ok {
		settings.From = from
	} else {
		log.Println("from must be a string for RewritePathFilter")
	}
	if to, ok := filter.Settings["to"].(string); ok {
		settings.To = to
	} else {
		log.Println("to must be a string for RewritePathFilter")
	}
	f.Settings = settings
}

func (f RewritePathFilter) IsResponseFilter() bool {
    return false
}

func (f RewritePathFilter) ApplyResponse(resp *http.Response) error {
    return nil
}