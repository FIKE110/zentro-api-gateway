package filters

import (
	"log"
	"net/http"
)


type LoggingFilter struct{
	Name string
	Settings LoggingFilterSetting
}

type LoggingFilterSetting struct {
    Level  string
    Format string
    Output string
}


func (l LoggingFilter) Apply(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        if l.Settings.Format == "json" {
            log.Printf(`{"level":"%s","method":"%s","path":"%s"}`, l.Settings.Level, r.Method, r.URL.Path)
        } else {
            log.Printf("[%s] %s %s", l.Settings.Level, r.Method, r.URL.Path)
        }
        next.ServeHTTP(w, r)
    })
}


func (l *LoggingFilter) Convert(filter GenericFilter) {
    settings := LoggingFilterSetting{}

    if lvl, ok := filter.Settings["level"].(string); ok {
        settings.Level = lvl
    } else {
        settings.Level = "INFO" 
    }

    if fmtVal, ok := filter.Settings["format"].(string); ok {
        settings.Format = fmtVal
    } else {
        settings.Format = "text"
    }

    if out, ok := filter.Settings["output"].(string); ok {
        settings.Output = out
    } else {
        settings.Output = "stdout"
    }

	l.Settings=settings

}