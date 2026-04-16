package middleware

import (
	"context"
	"log"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"

	"github.com/auth0/go-jwt-middleware/v2/jwks"
	"github.com/auth0/go-jwt-middleware/v2/validator"
)

func EnsureValidToken(next http.Handler) http.Handler {
	issuerURL, _ := url.Parse("https://" + os.Getenv("AUTH0_DOMAIN") + "/")
	audience := os.Getenv("AUTH0_AUDIENCE")
	provider := jwks.NewCachingProvider(issuerURL, 5*time.Minute)

	jwtValidator, _ := validator.New(provider.KeyFunc, validator.RS256, issuerURL.String(), []string{audience})
	
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
		
		// rsa verif
		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		claims, err := jwtValidator.ValidateToken(r.Context(), tokenString)
		if err != nil {
			log.Printf("Encountered error while validating JWT: %v", err)
			http.Error(w, "Invalid token", http.StatusUnauthorized)
    return
}

		ctx := context.WithValue(r.Context(), "user", claims.(*validator.ValidatedClaims))
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
