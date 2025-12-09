package auth

import "sync"

// User defines the structure for a user in the management API.
type User struct {
	Username     string `json:"username"`
	PasswordHash string `json:"-"` // Don't expose hash in JSON responses
}

// userStore is a thread-safe in-memory store for users.
type userStore struct {
	mu    sync.RWMutex
	users map[string]*User
}

// globalUserStore is the single instance of the user store.
var globalUserStore = &userStore{
	users: make(map[string]*User),
}

// AddUser adds a new user to the store. It overwrites an existing user
// with the same username.
func AddUser(u *User) {
	globalUserStore.mu.Lock()
	defer globalUserStore.mu.Unlock()
	globalUserStore.users[u.Username] = u
}

// GetUser retrieves a user by their username.

// It returns the user and true if found, otherwise nil and false.

func GetUser(username string) (*User, bool) {

	globalUserStore.mu.RLock()

	defer globalUserStore.mu.RUnlock()

	user, exists := globalUserStore.users[username]

	return user, exists

}



// DeleteUser removes a user from the store by their username.

func DeleteUser(username string) {

	globalUserStore.mu.Lock()

	defer globalUserStore.mu.Unlock()

	delete(globalUserStore.users, username)

}
