package filters

import "net/http"

type GenericFilter struct {
    Name     string `json:"name,omitempty"`
    Settings map[string]interface{} `json:"settings,omitempty"`
}

func (f GenericFilter) Apply(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
        next.ServeHTTP(w, req)
    })
}


func (f *GenericFilter) Convert(filter GenericFilter){

}
