package lb

import (
	"fmt"
	"sync/atomic"
	"time"
)

type LoadBalancer struct {
	Strategy string `json:"strategy"`
	Targets []string `json:"targets"`
	index   uint64 
	State   map[string]*UpstreamState `json:"state"`
	Cooldown uint  `json:"cooldown"`
	FailureCount uint  `json:"failureCount"`
}

type UpstreamState struct {
	Healthy     bool `json:"healthy"`
	FailCount   uint `json:"failCount"`
	Test        bool `json:"test"`
	LastFailure *time.Time `json:"lastFalure"`
}

func New(targets []string,cooldown uint, failure uint) *LoadBalancer {
	state := make(map[string]*UpstreamState)
	for _, key := range targets {
		state[key] = &UpstreamState{Healthy: true, FailCount: 0, LastFailure: nil, Test: false}
	}
	return &LoadBalancer{
		Targets: targets,
		State:   state,
		Cooldown: cooldown,
		FailureCount: failure,
		Strategy: "round-robin",
	}
}

func (lb *LoadBalancer) Failure(url string) {
	failures := lb.FailureCount

	s, ok := lb.State[url]
	if !ok {
		return
	}

	if s.Test {
		s.Healthy = false
		t := time.Now()
		s.LastFailure = &t
		s.Test = false
		s.FailCount = 0

		return
	}

	s.FailCount++
	if s.FailCount >= failures && s.Healthy {
		s.Healthy = false
		t := time.Now()
		s.LastFailure = &t
		s.Test = false
	}
}

func (lb *LoadBalancer) Recovered(url string) {
	s, ok := lb.State[url]
	if ok && s.Test && (s.Healthy || s.LastFailure == nil) {
		s.Test = false
	}
}

func (lb *LoadBalancer) TryRecover(url string) {
	cooldown := lb.Cooldown
	s, ok := lb.State[url]
	if !ok || s.Healthy || s.LastFailure == nil {
		return
	}

	if time.Since(*s.LastFailure) >= (time.Duration(cooldown) * time.Second) {
		s.Healthy = true
		s.FailCount = 0
		s.LastFailure = nil
		s.Test = true
	}
}

func (lb *LoadBalancer) Next() string {
	fmt.Println(lb)
	n := len(lb.Targets)
	if n == 0 {
		return ""
	}

	for i := 0; i < n; i++ {
		idx := atomic.LoadUint64(&lb.index)
		atomic.AddUint64(&lb.index, 1)
		candidate := lb.Targets[int(idx)%n]
		lb.TryRecover(candidate)

		if lb.State[candidate].Healthy {
			return candidate
		}
	}

	return lb.Targets[0]
}
