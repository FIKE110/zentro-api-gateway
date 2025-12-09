package filters

import (
	"log"
	"net/http"
	"zentro/utils"
)


type AddRequestParamFilter struct{
	Name string
	Settings AddRequestParamFilterSetting
}

type AddRequestParamFilterSetting struct {
   Params map[string]string
}


func (l AddRequestParamFilter) Apply(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		query := r.URL.Query()
		for key, val := range l.Settings.Params {
			query.Set(key, val)
		}
		r.URL.RawQuery = query.Encode()
		next.ServeHTTP(w, r)
    })
}


func (l *AddRequestParamFilter) Convert(filter GenericFilter) {
    settings := AddRequestParamFilterSetting{}

	params, ok := filter.Settings["params"].(map[string]interface{})
	if !ok {
		log.Println("params must be a map[string]interface{}")
		settings.Params=map[string]string{}
	} else {
		settings.Params=utils.ConvertToStringMap(params)
	}
	l.Settings=settings

}
