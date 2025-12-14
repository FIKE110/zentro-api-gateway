package config

import (
	"testing"
)

func TestRoute_IsEnabled_Default(t *testing.T) {
	r := Route{Enabled: nil}
	if !r.IsEnabled() {
		t.Error("Expected IsEnabled to be true when Enabled is nil")
	}
}

func TestRoute_IsEnabled_ExplicitFalse(t *testing.T) {
	enabled := false
	r := Route{Enabled: &enabled}
	if r.IsEnabled() {
		t.Error("Expected IsEnabled to be false when Enabled is explicitly false")
	}
}
