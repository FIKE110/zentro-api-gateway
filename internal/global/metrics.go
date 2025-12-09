package global

import (
	"sync"
	"time"
)

const (
	MaxLogEntries         = 100
	MaxTimeSeriesPoints   = 60
	MaxTimeSeries24Points = 24
)

// LogEntry represents a single traffic log record.
type LogEntry struct {
	Time       time.Time     `json:"time"`
	Method     string        `json:"method"`
	Path       string        `json:"path"`
	StatusCode int           `json:"statusCode"`
	Latency    time.Duration `json:"latency"`
	ClientIP    string `json:"clientIp"`
}

// DataPoint represents a single point in a time series.
type DataPoint struct {
	Time         time.Time `json:"time"`
	RequestCount uint64    `json:"requestCount"`
}

// MetricsCollector holds all the metrics for the gateway.
type MetricsCollector struct {
	mu                  sync.RWMutex
	startTime           time.Time
	totalRequests       uint64
	totalErrors         uint64
	requestLog          []LogEntry
	latencies           []time.Duration
	timeSeries          []DataPoint
	lastTimeSeries      time.Time
	lastTotalRequests   uint64
	timeSeries24        []DataPoint
	lastTimeSeries24    time.Time
	lastTotalRequests24 uint64
}

// GlobalMetrics is the single instance of the metrics collector.
var GlobalMetrics = &MetricsCollector{
	startTime:        time.Now(),
	requestLog:       make([]LogEntry, 0, MaxLogEntries),
	latencies:        make([]time.Duration, 0, 1000), // Store last 1000 latencies for avg
	timeSeries:       make([]DataPoint, 0, MaxTimeSeriesPoints),
	lastTimeSeries:   time.Now(),
	lastTotalRequests: 0,
	timeSeries24:     make([]DataPoint, 0, MaxTimeSeries24Points),
	lastTimeSeries24: time.Now(),
	lastTotalRequests24: 0,
}

// RecordRequest adds a new request to the metrics collector.
func (mc *MetricsCollector) RecordRequest(method, path string, statusCode int, latency time.Duration, client string) {
	mc.mu.Lock()
	defer mc.mu.Unlock()

	// Increment total requests
	mc.totalRequests++

	// Increment total errors if status code is 4xx or 5xx
	if statusCode >= 400 {
		mc.totalErrors++
	}

	// Add to request log (capped)
	logEntry := LogEntry{
		Time:       time.Now(),
		Method:     method,
		Path:       path,
		StatusCode: statusCode,
		Latency:    latency,
		ClientIP:   client,
	}
	if len(mc.requestLog) >= MaxLogEntries {
		mc.requestLog = mc.requestLog[1:]
	}
	mc.requestLog = append(mc.requestLog, logEntry)

	// Add to latencies (capped)
	if len(mc.latencies) >= 1000 {
		mc.latencies = mc.latencies[1:]
	}
	mc.latencies = append(mc.latencies, latency)

	// Update time series data (per interval, not cumulative)
	if time.Since(mc.lastTimeSeries) >= time.Minute {
		point := DataPoint{
			Time:         time.Now(),
			RequestCount: mc.totalRequests - mc.lastTotalRequests, // requests in this interval
		}
		if len(mc.timeSeries) >= MaxTimeSeriesPoints {
			mc.timeSeries = mc.timeSeries[1:]
		}
		mc.timeSeries = append(mc.timeSeries, point)

		// Update trackers
		mc.lastTimeSeries = time.Now()
		mc.lastTotalRequests = mc.totalRequests
	}

	if time.Since(mc.lastTimeSeries24) >= time.Hour {
		point := DataPoint{
			Time:         time.Now(),
			RequestCount: mc.totalRequests - mc.lastTotalRequests24,
		}
		if len(mc.timeSeries24) >= MaxTimeSeries24Points {
			mc.timeSeries24 = mc.timeSeries24[1:]
		}
		mc.timeSeries24 = append(mc.timeSeries24, point)

		mc.lastTimeSeries24 = time.Now()
		mc.lastTotalRequests24 = mc.totalRequests
	}
}

// GetMetrics returns a snapshot of the current metrics.
type MetricsSnapshot struct {
	Uptime         time.Duration
	TotalRequests  uint64
	TotalErrors    uint64
	RequestLog     []LogEntry
	AverageLatency time.Duration
	ErrorRate      float64
	TimeSeries     []DataPoint
	TimeSeries24   []DataPoint
}

func (mc *MetricsCollector) GetMetrics() MetricsSnapshot {
	mc.mu.RLock()
	defer mc.mu.RUnlock()

	var totalLatency time.Duration
	for _, l := range mc.latencies {
		totalLatency += l
	}

	var avgLatency time.Duration
	if len(mc.latencies) > 0 {
		avgLatency = totalLatency / time.Duration(len(mc.latencies))
	}

	var errorRate float64
	if mc.totalRequests > 0 {
		errorRate = (float64(mc.totalErrors) / float64(mc.totalRequests)) * 100
	}

	// Make copies of slices to avoid race conditions after unlocking
	logCopy := make([]LogEntry, len(mc.requestLog))
	copy(logCopy, mc.requestLog)
	tsCopy := make([]DataPoint, len(mc.timeSeries))
	copy(tsCopy, mc.timeSeries)
	ts24Copy := make([]DataPoint, len(mc.timeSeries24))
	copy(ts24Copy, mc.timeSeries24)

	return MetricsSnapshot{
		Uptime:         time.Since(mc.startTime),
		TotalRequests:  mc.totalRequests,
		TotalErrors:    mc.totalErrors,
		RequestLog:     logCopy,
		AverageLatency: avgLatency,
		ErrorRate:      errorRate,
		TimeSeries:     tsCopy,
		TimeSeries24:   ts24Copy,
	}
}