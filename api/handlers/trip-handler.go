package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/Faybioo/Score/models"
	"github.com/auth0/go-jwt-middleware/v2/validator"
	"github.com/go-chi/chi/v5"
)

func SaveTrip(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var trip models.Trip
		if err := json.NewDecoder(r.Body).Decode(&trip); err != nil {
			http.Error(w, "Invalid request", http.StatusBadRequest)
			return
		}

		tokenClaims, ok := r.Context().Value("user").(*validator.ValidatedClaims)
		if !ok {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}
		trip.Auth0ID = tokenClaims.RegisteredClaims.Subject

		var exists bool
    checkQuery := `SELECT EXISTS(SELECT 1 FROM trips WHERE auth0_id = $1 AND flight_offer_id = $2)`
    err := db.QueryRow(checkQuery, trip.Auth0ID, trip.FlightOfferID).Scan(&exists)
    
    if exists {
      w.Header().Set("Content-Type", "application/json")
      w.WriteHeader(http.StatusConflict)
      json.NewEncoder(w).Encode(map[string]string{"message": "This itinerary is already in your dashboard!"})
      return
    }

		query := `
			INSERT INTO trips (auth0_id, match_id, flight_offer_id, origin, destination, departure_date, return_date, cabin_class, total_amount)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
			RETURNING id, created_at
		`
		err = db.QueryRow(query,
			trip.Auth0ID, trip.MatchID, trip.FlightOfferID,
			trip.Origin, trip.Destination, trip.DepartureDate,
			trip.ReturnDate, trip.CabinClass, trip.TotalAmount,
		).Scan(&trip.ID, &trip.CreatedAt)
		if err != nil {
			http.Error(w, "DB Error: "+err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(trip)
	}
}

func GetTrips(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		tokenClaims, ok := r.Context().Value("user").(*validator.ValidatedClaims)
		if !ok {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}
		auth0ID := tokenClaims.RegisteredClaims.Subject

		rows, err := db.Query(`
			SELECT
				t.id, t.auth0_id, t.match_id, t.flight_offer_id,
				t.origin, t.destination, t.departure_date,
				t.return_date, t.cabin_class, t.total_amount, t.created_at,
				m.home_team, m.away_team, m.host_city, m.stadium, m.kickoff, m.status
			FROM trips t
			JOIN matches m ON m.id = t.match_id
			WHERE t.auth0_id = $1
			ORDER BY t.created_at DESC
		`, auth0ID)
		if err != nil {
			http.Error(w, "DB Error: "+err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var trips []models.TripWithMatch
		for rows.Next() {
			var t models.TripWithMatch
			err := rows.Scan(
				&t.ID, &t.Auth0ID, &t.MatchID, &t.FlightOfferID,
				&t.Origin, &t.Destination, &t.DepartureDate,
				&t.ReturnDate, &t.CabinClass, &t.TotalAmount, &t.CreatedAt,
				&t.HomeTeam, &t.AwayTeam, &t.HostCity, &t.Stadium, &t.Kickoff, &t.Status,
			)
			if err != nil {
				http.Error(w, "Scan Error: "+err.Error(), http.StatusInternalServerError)
				return
			}
			trips = append(trips, t)
		}

		if trips == nil {
			trips = []models.TripWithMatch{}
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(trips)
	}
}

func DeleteTrip(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		tokenClaims, ok := r.Context().Value("user").(*validator.ValidatedClaims)
		if !ok {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}
		auth0ID := tokenClaims.RegisteredClaims.Subject

		tripIDStr := chi.URLParam(r, "id")
		tripID, err := strconv.Atoi(tripIDStr)
		if err != nil {
			http.Error(w, "Invalid trip ID", http.StatusBadRequest)
			return
		}

		result, err := db.Exec(`DELETE FROM trips WHERE id = $1 AND auth0_id = $2`, tripID, auth0ID)
		if err != nil {
			http.Error(w, "DB Error: "+err.Error(), http.StatusInternalServerError)
			return
		}

		rowsAffected, _ := result.RowsAffected()
		if rowsAffected == 0 {
			http.Error(w, "Trip not found", http.StatusNotFound)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"message": "Trip deleted"})
	}
}