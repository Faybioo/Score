package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/Faybioo/Score/models"
	"github.com/go-chi/chi/v5"
)

func UpdateMatch(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		matchIDStr := chi.URLParam(r, "id")
		matchID, err := strconv.Atoi(matchIDStr)
		if err != nil {
			http.Error(w, "Invalid match ID", http.StatusBadRequest)
			return
		}

		var match models.Match
		if err := json.NewDecoder(r.Body).Decode(&match); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		query := `
			UPDATE matches 
			SET kickoff = $1, host_city = $2, stadium = $3, home_team = $4, away_team = $5, status = $6, last_updated = $7
			WHERE id = $8
			RETURNING id, api_id, kickoff, host_city, stadium, home_team, away_team, status, last_updated
		`

		var updatedMatch models.Match
		err = db.QueryRow(
			query,
			match.Kickoff,
			match.HostCity,
			match.Stadium,
			match.HomeTeam,
			match.AwayTeam,
			match.Status,
			time.Now(),
			matchID,
		).Scan(
			&updatedMatch.ID,
			&updatedMatch.ApiID,
			&updatedMatch.Kickoff,
			&updatedMatch.HostCity,
			&updatedMatch.Stadium,
			&updatedMatch.HomeTeam,
			&updatedMatch.AwayTeam,
			&updatedMatch.Status,
			&updatedMatch.LastUpdated,
		)

		if err == sql.ErrNoRows {
			http.Error(w, "Match not found", http.StatusNotFound)
			return
		}
		if err != nil {
			http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(updatedMatch)
	}
}

func DeleteMatch(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		matchIDStr := chi.URLParam(r, "id")
		matchID, err := strconv.Atoi(matchIDStr)
		if err != nil {
			http.Error(w, "Invalid match ID", http.StatusBadRequest)
			return
		}

		query := `DELETE FROM matches WHERE id = $1`
		result, err := db.Exec(query, matchID)
		if err != nil {
			http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
			return
		}

		rowsAffected, err := result.RowsAffected()
		if err != nil {
			http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
			return
		}

		if rowsAffected == 0 {
			http.Error(w, "Match not found", http.StatusNotFound)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{
			"message": "Match deleted successfully",
		})
	}
}
