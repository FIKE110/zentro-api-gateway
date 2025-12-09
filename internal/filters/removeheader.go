package filters

import (
	"fmt"
	"log"
	"net/http"
)


type RemoveHeaderFilter struct{
	Name string
	Settings RemoveHeaderFilterSetting
}

type RemoveHeaderFilterSetting struct {
    Type string
    Headers []string
}


func (l RemoveHeaderFilter) Apply(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		fmt.Println(l.Settings.Headers)
		for _,key:=range l.Settings.Headers{
			if l.Settings.Type=="response"{
				w.Header().Del(key)
				continue
			}else{
				r.Header.Del(key)
			}
		}
		
        next.ServeHTTP(w, r)
    })
}


func (l *RemoveHeaderFilter) Convert(filter GenericFilter) {
    settings := RemoveHeaderFilterSetting{}
	
    if Type, ok := filter.Settings["type"].(string); ok {
        settings.Type = Type
    } else {
        settings.Type = "response"
    }

    raw, ok := filter.Settings["headers"].([]interface{})
    if !ok {
        log.Println("headers must be []string (provided as []interface{})")
        settings.Headers = []string{}
    } else {
        headers := make([]string, 0, len(raw))
        for _, v := range raw {
            if str, ok := v.(string); ok {
                headers = append(headers, str)
            } else {
                log.Println("header value is not a string")
            }
        }
        settings.Headers = headers
    }

    l.Settings = settings
}