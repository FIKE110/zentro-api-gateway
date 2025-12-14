package management

import (
	"net/http"
	"zentro/internal/management/handlers"

	"github.com/go-chi/chi/v5"
)

func CORSMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Allow all origins (for development)
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS,PATCH,PUT,DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		// Handle preflight requests
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func SetupRouter() *chi.Mux {
	r := chi.NewRouter()

	r.Use(CORSMiddleware)

	fs := http.FileServer(http.Dir("./dist"))

	r.HandleFunc("/web/*", func(w http.ResponseWriter, r *http.Request) {
		if _, err := http.Dir("./dist").Open(r.URL.Path[5:]); err != nil {
			http.ServeFile(w, r, "./dist/index.html")
			return
		}
		http.StripPrefix("/web/", fs).ServeHTTP(w, r)

	})

	r.Get("/web", func(w http.ResponseWriter, r *http.Request) {
	http.Redirect(w, r, "/web/", http.StatusMovedPermanently)
})
	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
	http.Redirect(w, r, "/web/", http.StatusMovedPermanently)
})

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("OK"))
	})


	r.Post("/auth/login", handlers.LoginHandler)
	r.Post("/auth/signup", handlers.SignupHandler)

	r.Route("/api", func(r chi.Router) {
		r.Use(JwtMiddleware)

		r.Get("/dashboard", handlers.DashboardHandler)
		r.Get("/playground/routes", handlers.PlaygroundRoutesHandler)
		r.HandleFunc("/playground/test", handlers.PlaygroundTestHandler)

		r.Route("/routes", func(r chi.Router) {
			r.Get("/", handlers.GetRoutesHandler)
			r.Post("/", handlers.CreateRouteHandler)
			r.Get("/{id}", handlers.GetRouteHandler)
			r.Put("/{id}", handlers.UpdateRouteHandler)
			r.Delete("/{id}", handlers.DeleteRouteHandler)
		})

	
		r.Route("/consumers", func(r chi.Router) {
			r.Get("/", handlers.GetConsumersHandler)
			r.Post("/", handlers.CreateConsumerHandler)
			r.Get("/{id}", handlers.GetConsumerHandler)
			r.Delete("/{id}", handlers.DeleteConsumerHandler)
		})


		r.Get("/traffic-logs", handlers.GetTrafficLogsHandler)



		r.Route("/config", func(r chi.Router) {
			r.Get("/", handlers.GetConfigHandler)
			r.Post("/", handlers.UpdateConfigHandler)
		})

		r.Route("/settings", func(r chi.Router) {
			r.Get("/", handlers.GetGlobalSettingsHandler)
			r.Post("/", handlers.UpdateGlobalSettingsHandler)
		})
	})

	return r
}
