package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/Faybioo/Score/services"
)

var duffel = services.NewDuffelClient()

func SearchFlights(w http.ResponseWriter, r *http.Request) {
	var req services.FlightSearchRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.Origin == "" || req.Destination == "" || req.DepartureDate == "" {
		http.Error(w, "origin, destination, and departure_date are required", http.StatusBadRequest)
		return
	}

	result, err := duffel.SearchFlights(req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadGateway)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(result)
}
