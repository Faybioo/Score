package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
)

func GetUserCount(db *sql.DB) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        var count int
        // Simple SQL count on your local users table
        err := db.QueryRow("SELECT COUNT(*) FROM users").Scan(&count)
        if err != nil {
            http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
            return
        }

        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(map[string]int{"count": count})
    }
}