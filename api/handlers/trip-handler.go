package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"

	"github.com/Faybioo/Score/models"
	"github.com/auth0/go-jwt-middleware/v2/validator"
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

		query := `
			INSERT INTO trips (auth0_id, match_id, flight_offer_id, origin, destination, departure_date, return_date, cabin_class, total_amount)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
			RETURNING id, created_at
		`
		err := db.QueryRow(query, trip.Auth0ID, trip.MatchID, trip.FlightOfferID, trip.Origin, trip.Destination, trip.DepartureDate, trip.ReturnDate, trip.CabinClass, trip.TotalAmount).Scan(&trip.ID, &trip.CreatedAt)
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
			SELECT id, auth0_id, match_id, flight_offer_id, origin, destination, departure_date, return_date, cabin_class, total_amount, created_at
			FROM trips WHERE auth0_id = $1 ORDER BY created_at DESC
		`, auth0ID)
		if err != nil {
			http.Error(w, "DB Error: "+err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var trips []models.Trip
		for rows.Next() {
			var t models.Trip
			err := rows.Scan(&t.ID, &t.Auth0ID, &t.MatchID, &t.FlightOfferID, &t.Origin, &t.Destination, &t.DepartureDate, &t.ReturnDate, &t.CabinClass, &t.TotalAmount, &t.CreatedAt)
			if err != nil {
				http.Error(w, "Scan Error: "+err.Error(), http.StatusInternalServerError)
				return
			}
			trips = append(trips, t)
		}

		if trips == nil {
			trips = []models.Trip{}
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(trips)
	}
}
