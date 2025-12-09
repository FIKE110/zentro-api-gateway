package utils

import (
	"crypto/rand"
	"math/big"

	"github.com/lithammer/shortuuid/v4"
)

func GenerateRouteID() string {
	return shortuuid.New()
}

// GenerateRandomID creates a random alphanumeric string of a given length.
func GenerateRandomID(length int) string {
	const letters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
	ret := make([]byte, length)
	for i := 0; i < length; i++ {
		num, err := rand.Int(rand.Reader, big.NewInt(int64(len(letters))))
		if err != nil {
			// Fallback to a simpler generation on error
			return shortuuid.New()
		}
		ret[i] = letters[num.Int64()]
	}
	return string(ret)
}
