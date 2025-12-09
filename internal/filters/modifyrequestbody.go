package filters

import (
	"bytes"
	"io"
	"log"
	"net/http"
	"strconv"
	"strings"
)

type ModifyRequestBodyFilter struct {
	Name     string
	Settings ModifyRequestBodySettings
}

type ModifyRequestBodySettings struct {
	From string
	To   string
}

func (f ModifyRequestBodyFilter) Apply(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		bodyBytes, err := io.ReadAll(r.Body)
		if err != nil {
			log.Printf("Error reading request body: %v", err)
			http.Error(w, "Error reading request body", http.StatusInternalServerError)
			return
		}
		defer r.Body.Close()

		modifiedBody := strings.Replace(string(bodyBytes), f.Settings.From, f.Settings.To, -1)

		newBody := []byte(modifiedBody)
		r.Body = io.NopCloser(bytes.NewBuffer(newBody))
		r.ContentLength = int64(len(newBody))
		r.Header.Set("Content-Length", strconv.Itoa(len(newBody)))

		next.ServeHTTP(w, r)
	})
}

func (f *ModifyRequestBodyFilter) Convert(filter GenericFilter) {
	f.Name = filter.Name
	settings := ModifyRequestBodySettings{}
	if from, ok := filter.Settings["from"].(string); ok {
		settings.From = from
	} else {
		log.Println("from must be a string for ModifyRequestBodyFilter")
	}
	if to, ok := filter.Settings["to"].(string); ok {
		settings.To = to
	} else {
		log.Println("to must be a string for ModifyRequestBodyFilter")
	}
	f.Settings = settings
}

func (f ModifyRequestBodyFilter) IsResponseFilter() bool {
    return false
}

func (f ModifyRequestBodyFilter) ApplyResponse(resp *http.Response) error {
    return nil
}
