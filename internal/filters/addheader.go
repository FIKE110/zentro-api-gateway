package filters

import (
	"log"
	"net/http"
	"zentro/utils"
)


type AddHeaderFilter struct{
	Name string
	Settings AddHeaderFilterSetting
}

type AddHeaderFilterSetting struct {
    Type string
    Headers map[string]string
}


func (l AddHeaderFilter) Apply(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		for key,val:=range l.Settings.Headers{
			if l.Settings.Type=="response"{
				w.Header().Set(key,val)
				continue
			}else{
				r.Header.Set(key,val)
			}
		}
        next.ServeHTTP(w, r)
    })
}


func (l *AddHeaderFilter) Convert(filter GenericFilter) {
    l.Name = filter.Name
    settings := AddHeaderFilterSetting{}

    if Type, ok := filter.Settings["type"].(string); ok {
        settings.Type = Type
    } else {
        settings.Type = "response" 
    }
	headers, ok := filter.Settings["headers"].(map[string]interface{})
	if !ok {
		log.Println("headers must be a map[string]interface{}")
		settings.Headers=map[string]string{}
	} else {
		settings.Headers=utils.ConvertToStringMap(headers)
	}
	l.Settings=settings

}


