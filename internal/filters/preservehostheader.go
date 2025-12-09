package filters

import (
	"log"
	"net/http"
)

type PreserveHostHeaderFilter struct {
	Name string
	Settings PreserveHostHeaderSettings
}

type PreserveHostHeaderSettings struct {
	// No specific settings are needed for this filter, as it just preserves the existing Host header.
	// This struct is kept for consistency with other filters.
}

func (f PreserveHostHeaderFilter) Apply(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		originalHost := r.Host // This is the host from the incoming request
		log.Printf("Preserving Host header. Original Host: %s", originalHost)

		r.Host = originalHost
		next.ServeHTTP(w, r)
	})
}

func (f *PreserveHostHeaderFilter) Convert(filter GenericFilter) {
	f.Name = filter.Name
	f.Settings = PreserveHostHeaderSettings{} // Initialize for consistency
}

func (f PreserveHostHeaderFilter) IsResponseFilter() bool {
    return false
}

func (f PreserveHostHeaderFilter) ApplyResponse(resp *http.Response) error {
    return nil
}