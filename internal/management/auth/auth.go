package auth

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

var jwtSecret = []byte("super-secret-key")

// Claims represents the JWT claims.
type Claims struct {
	Username string `json:"username"`
	jwt.RegisteredClaims
}

// SignupUser creates a new user and adds them to the store.
func SignupUser(username string, password string) error {
	if _, exists := GetUser(username); exists {
		return errors.New("user already exists")
	}

	hash, err := HashPassword(password)
	if err != nil {
		return err
	}

	AddUser(&User{
		Username:     username,
		PasswordHash: hash,
	})

	return nil
}

// LoginUser authenticates a user and returns a JWT token if successful.
func LoginUser(username string, password string) (string, error) {
	user, exists := GetUser(username)
	if !exists {
		return "", errors.New("invalid credentials")
	}

	if !CheckPassword(password, user.PasswordHash) {
		return "", errors.New("invalid credentials")
	}

	return GenerateTokenForUser(username)
}

// GenerateTokenForUser creates a new JWT for a given username without password validation.
func GenerateTokenForUser(username string) (string, error) {
	expirationTime := time.Now().Add(24 * time.Hour)
	claims := &Claims{
		Username: username,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(jwtSecret)
	if err != nil {
		return "", err
	}

	return tokenString, nil
}


// ValidateToken validates a JWT token string.
func ValidateToken(tokenString string) (*Claims, error) {
	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return jwtSecret, nil
	})

	if err != nil {
		return nil, err
	}

	if !token.Valid {
		return nil, errors.New("invalid token")
	}

	return claims, nil
}
