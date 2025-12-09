package router

import (
    "net/http"
    "strings"
    "zentro/internal/config"
)


func MatchRoute(r *http.Request, routes []config.Route) *config.Route {
    for _, route := range routes {
        if !route.IsEnabled() {
            continue
        }

        if route.PathPrefix != "" && !strings.HasPrefix(r.URL.Path, route.PathPrefix) {
            continue
        }

        if len(route.Methods) > 0 {
            found := false
            for _, m := range route.Methods {
                if r.Method == m {
                    found = true
                    break
                }
            }
            if !found {
                continue
            }
        }

        if route.Host != "" && r.Host != route.Host {
            continue
        }

        matchHeaders := true
        for key, val := range route.Headers {
            if r.Header.Get(key) != val {
                matchHeaders = false
                break
            }
        }
        if !matchHeaders {
            continue
        }


        matchQuery := true
        q := r.URL.Query()
        for key, val := range route.QueryParams {
            if q.Get(key) != val {
                matchQuery = false
                break
            }
        }
        if !matchQuery {
            continue
        }

        return &route
    }

    return nil
}
