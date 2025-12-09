package filters

import (
	"net/http"
	"strings"
)

type AuthFilter struct {
	Name string
	Settings AuthFilterSettings 
}

type AuthFilterSettings struct{
	Type string
	Header string
}


func (a AuthFilter) Apply(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var header=r.Header.Get(a.Settings.Header)
		if (a.Settings.Type != "bearer" && a.Settings.Type != "basic" && a.Settings.Type != "api-key") || header == "" {
			http.Error(w, "Unauthorized: Failed", http.StatusUnauthorized)
			return
		}

		if a.Settings.Type=="bearer" && !strings.HasPrefix(header,"Bearer"){
			http.Error(w, "Unauthorized: Failed", http.StatusUnauthorized)
			return
		}
        next.ServeHTTP(w, r)
    })
}


func (a *AuthFilter) Convert(filter GenericFilter){
    settings := AuthFilterSettings{}

    if header, ok := filter.Settings["header"].(string); ok {
		settings.Header = header
		if header=="" {
			settings.Header="Authorization"
		}
    } else {
        settings.Header = "Authorization" 
    }

    if typeVal, ok := filter.Settings["type"].(string); ok {
        settings.Type = typeVal
    } else {
        settings.Type = "Bearer"
    }

	a.Settings=settings

}
