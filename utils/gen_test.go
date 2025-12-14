package utils

import (
	"testing"
)

func TestGenerateRouteID(t *testing.T) {
	id := GenerateRouteID()
	if id == "" {
		t.Error("GenerateRouteID returned empty string")
	}
}

func TestGenerateRandomID_Length(t *testing.T) {
	length := 10
	id := GenerateRandomID(length)
	if len(id) != length {
		t.Errorf("Expected length %d, got %d", length, len(id))
	}
}

func TestGenerateRandomID_Unique(t *testing.T) {
	id1 := GenerateRandomID(10)
	id2 := GenerateRandomID(10)
	if id1 == id2 {
		t.Error("GenerateRandomID returned duplicate values")
	}
}
