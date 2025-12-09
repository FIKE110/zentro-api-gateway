package filters

import (
	"bytes"
	"io"
	"log"
	"net/http"
	"strings"
)

type ModifyResponseBodyFilter struct {
	Name     string
	Settings ModifyResponseBodySettings
}

type ModifyResponseBodySettings struct {
	From string
	To   string
}

type modifyResponseBodyWriter struct {
	http.ResponseWriter
	body       *bytes.Buffer
	statusCode int
	header     http.Header
}

func (w *modifyResponseBodyWriter) Header() http.Header {
	return w.header
}

func (w *modifyResponseBodyWriter) WriteHeader(statusCode int) {
	w.statusCode = statusCode
}

func (w *modifyResponseBodyWriter) Write(b []byte) (int, error) {
	return w.body.Write(b)
}

func (f ModifyResponseBodyFilter) Apply(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// This filter acts as a response filter, so it should not modify the request side.
		// It will be applied through the ReverseProxy's ModifyResponse function.
		// For now, it passes through. The actual modification happens in ApplyResponse.
		next.ServeHTTP(w, r)
	})
}

func (f *ModifyResponseBodyFilter) Convert(filter GenericFilter) {
	f.Name = filter.Name
	settings := ModifyResponseBodySettings{}
	if from, ok := filter.Settings["from"].(string); ok {
		settings.From = from
	} else {
		log.Println("from must be a string for ModifyResponseBodyFilter")
	}
	if to, ok := filter.Settings["to"].(string); ok {
		settings.To = to
	} else {
		log.Println("to must be a string for ModifyResponseBodyFilter")
	}
	f.Settings = settings
}

func (f ModifyResponseBodyFilter) IsResponseFilter() bool {
    return true
}

func (f ModifyResponseBodyFilter) ApplyResponse(resp *http.Response) error {
    log.Printf("Applying ModifyResponseBodyFilter: %s", f.Name)
    bodyBytes, err := io.ReadAll(resp.Body)
    if err != nil {
        return err
    }
    defer resp.Body.Close()

    modifiedBody := strings.Replace(string(bodyBytes), f.Settings.From, f.Settings.To, -1)
    resp.Body = io.NopCloser(bytes.NewBufferString(modifiedBody))
    resp.ContentLength = int64(len(modifiedBody))
    return nil
}