package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"
	"zentro/internal/config"
	"zentro/internal/global"

	"github.com/shirou/gopsutil/v3/cpu"
	"github.com/shirou/gopsutil/v3/mem"
)

type FrontendMetrics struct {
    TotalRequests  uint64        `json:"totalRequests"`
    AverageLatency time.Duration `json:"averageLatency"`
    ErrorRate      float64       `json:"errorRate"`
    TimeSeries []global.DataPoint `json:"timeSeries"`
	TimeSeries24 []global.DataPoint `json:"timeSeries24"`
	Uptime time.Duration `json:"uptime"`
}


// SystemStatus represents the current CPU and Memory usage.
type SystemStatus struct {
	CPUUsagePercent float64 `json:"cpuUsagePercent"`
	MemUsagePercent float64 `json:"memUsagePercent"`
	SystemOnline bool `json:"systemOnline"`
}


type DashboardData struct {
	GatewayMetrics FrontendMetrics `json:"gatewayMetrics"`
	ActiveRoutes   int         `json:"activeRoutes"`
	SystemStatus   SystemStatus           `json:"systemStatus"`
}

func DashboardHandler(w http.ResponseWriter, r *http.Request) {

	metrics := global.GlobalMetrics.GetMetrics()
	routes:=global.GetConfig().Routes
	var activeRoutes []config.Route
	for i := range routes{
		if routes[i].Enabled==nil{
			continue
		}

		if !*routes[i].Enabled{
			continue
		}
		activeRoutes=append(activeRoutes,routes[i])
	}

	cpuPercent, err := cpu.Percent(0, false)
	if err != nil {
		fmt.Println("Could not get CPU usage:", err)
	}

	memInfo, err := mem.VirtualMemory()
	if err != nil {
		fmt.Println("Could not get memory usage:", err)
	}

	systemStatus := SystemStatus{}
	if len(cpuPercent) > 0 {
		systemStatus.CPUUsagePercent = cpuPercent[0]
	}
	if memInfo != nil {
		systemStatus.MemUsagePercent = memInfo.UsedPercent
	}

	systemStatus.SystemOnline=true

	response := DashboardData{
		GatewayMetrics: FrontendMetrics{
			TotalRequests: metrics.TotalRequests,
			AverageLatency: metrics.AverageLatency/time.Millisecond,
			ErrorRate: metrics.ErrorRate,
			TimeSeries: metrics.TimeSeries,
			TimeSeries24:metrics.TimeSeries24,
			Uptime: metrics.Uptime,
		},
		ActiveRoutes:   len(activeRoutes),
		SystemStatus:   systemStatus,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
