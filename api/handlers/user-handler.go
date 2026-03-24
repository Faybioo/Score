package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"

	"github.com/Faybioo/Score/models"
	"github.com/auth0/go-jwt-middleware/v2/validator"
)

func SyncUser(db *sql.DB) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        var user models.User
        if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
            http.Error(w, "Invalid request", http.StatusBadRequest)
            return
        }

        if tokenClaims, ok := r.Context().Value("user").(*validator.ValidatedClaims); ok {
			user.Auth0ID = tokenClaims.RegisteredClaims.Subject
		}

        query := `
            INSERT INTO users (auth0_id, email)
            VALUES ($1, $2)
            ON CONFLICT (auth0_id) DO UPDATE SET email = EXCLUDED.email
            RETURNING id;
        `
        var internalID int
        err := db.QueryRow(query, user.Auth0ID, user.Email).Scan(&internalID)
        if err != nil {
            http.Error(w, "DB Error", http.StatusInternalServerError)
            return
        }

        w.WriteHeader(http.StatusOK)
        json.NewEncoder(w).Encode(map[string]int{"internal_id": internalID})
    }
}

func GetProfile(db *sql.DB) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(map[string]string{
            "status": "Authenticated",
            "message": "successful user authentication",
        })
    }
}
