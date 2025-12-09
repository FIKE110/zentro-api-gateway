package proxy

import (
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"zentro/internal/lb"
)

func NewReverseProxy(target string,lb *lb.LoadBalancer) (*httputil.ReverseProxy, error) {
    upstreamURL, err := url.Parse(target)
    if err != nil {
        return nil, err
    }

    proxy := httputil.NewSingleHostReverseProxy(upstreamURL)

   
    originalDirector := proxy.Director
    proxy.Director = func(req *http.Request) {
        originalDirector(req)

        req.Header.Set("X-Zentro-Proxy", "true")
        log.Printf("Proxying %s %s -> %s", req.Method, req.URL.Path, upstreamURL)
    }

    proxy.ModifyResponse = func(resp *http.Response) error {
        resp.Header.Set("X-Zentro-Upstream", upstreamURL.Host)
        lb.Recovered(target)
        return nil
    }

    proxy.ErrorHandler = func(w http.ResponseWriter, r *http.Request, err error) {
        lb.Failure(target)
        log.Printf("Proxy error: %v", err)
        http.Error(w, "Bad gateway", http.StatusBadGateway)
    }

    return proxy, nil
}
