package router

import (
	"log"
	"net/http"
	"time"
	"zentro/internal/config"
	"zentro/internal/filters"
	"zentro/internal/global"
	"zentro/internal/proxy"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

type Engine struct {
	Routes []config.Route
}

func NewRouter(routes []config.Route) http.Handler {
	e := &Engine{Routes: global.GetConfig().Routes}
	r := chi.NewRouter()

	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	r.Use(func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
			log.Printf("Incoming: %s %s", req.Method, req.URL.Path)
			next.ServeHTTP(w, req)
		})
	})

	r.Handle("/*", http.HandlerFunc(e.handle))

	return r
}

func (e *Engine) handle(w http.ResponseWriter, r *http.Request) {
	route := MatchRoute(r, global.GetConfig().Routes)
	w.Header().Set("X-Zentro-Proxy", "true")
	if route == nil {
		http.Error(w, "no route matched", http.StatusNotFound)
		return
	}

	upstream := route.Lb.Next()

	rp, err := proxy.NewReverseProxy(upstream, route.Lb)
	if err != nil {
		http.Error(w, "bad upstream", http.StatusBadGateway)
		return
	}

	var handler http.Handler = rp

	for i := len(route.Filters) - 1; i >= 0; i-- {
		var genericFilter = route.Filters[i]
		var filter filters.Filter = MatchFilter(genericFilter.Name)
		filter.Convert(genericFilter)
		handler = filter.Apply(handler)
	}

	if route.Auth.Enabled {
		var authFilter = filters.AuthFilter{}
		authFilter.Convert(filters.GenericFilter{
			Name: "auth",
			Settings: map[string]interface{}{
				"type":   route.Auth.Type,
				"header": route.Auth.Header,
			},
		})
		handler = authFilter.Apply(handler)
	}

	log.Printf("Proxying to %s (%s)", upstream, route.Name)


	wrappedWriter := middleware.NewWrapResponseWriter(w, r.ProtoMajor)
	startTime := time.Now()

	handler.ServeHTTP(wrappedWriter, r)

	latency := time.Since(startTime)
	statusCode := wrappedWriter.Status()

	global.GlobalMetrics.RecordRequest(r.Method, r.URL.Path, statusCode, latency,r.RemoteAddr)
}
