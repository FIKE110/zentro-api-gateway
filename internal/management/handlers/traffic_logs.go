package handlers

import (
	"encoding/json"
	"net/http"
	"time"
	"zentro/internal/global"
)

func GetTrafficLogsHandler(w http.ResponseWriter, r *http.Request) {
	metrics := global.GlobalMetrics.GetMetrics()
	w.Header().Set("Content-Type", "application/json")
	m:=metrics.RequestLog
	for i:=range m{
		m[i].Latency=m[i].Latency/time.Millisecond
	}
	json.NewEncoder(w).Encode(m)
}
