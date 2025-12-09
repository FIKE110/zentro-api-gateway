package filters

import (
	"log"
	"net/http"
)

type ExampleFilter struct {
	Name        string
	HeaderName  string
	HeaderValue string
}

func (f *ExampleFilter) Convert(gf GenericFilter) {
	f.Name = gf.Name
	if headerName, ok := gf.Settings["headerName"].(string); ok {
		f.HeaderName = headerName
	} else {
		log.Println("headerName must be a string for ExampleFilter")
	}
	if headerValue, ok := gf.Settings["headerValue"].(string); ok {
		f.HeaderValue = headerValue
	} else {
		log.Println("headerValue must be a string for ExampleFilter")
	}
}

func (f ExampleFilter) Apply(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Printf("Applying ExampleFilter: Adding header %s: %s", f.HeaderName, f.HeaderValue)
		r.Header.Add(f.HeaderName, f.HeaderValue)
		next.ServeHTTP(w, r)
	})
}

func (f ExampleFilter) IsResponseFilter() bool {
    return false
}

func (f ExampleFilter) ApplyResponse(resp *http.Response) error {
    return nil
}
