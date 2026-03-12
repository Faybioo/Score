package middleware

import (
	"net/http"
	"strings"
)

func EnsureValidToken(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")

	//this is a temp bypass for testing with, if you just send 'dev-token' it will authenticate
	if authHeader == "Bearer dev-token" {
			next.ServeHTTP(w, r)
			return
		}

		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			http.Error(w, "Missing or invalid Authorization header", http.StatusUnauthorized)
			return
		}
		//just assume its valid for testing. TODO: add RSA verification
		next.ServeHTTP(w, r)
	})
}
