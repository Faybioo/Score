package handlers

import (
    "encoding/json"
    "net/http"
)

func GetNearbyAirport(w http.ResponseWriter, r *http.Request) {
    lat := r.URL.Query().Get("lat")
    lng := r.URL.Query().Get("lng")

    body, err := duffel.SuggestAirports(lat, lng)
    if err != nil {
        json.NewEncoder(w).Encode(map[string]string{"iata_code": "MCO"})
        return
    }

    var result struct {
        Data []struct {
            IataCode string `json:"iata_code"`
        } `json:"data"`
    }

    json.Unmarshal(body, &result)

    bestCode := "MCO"
    if len(result.Data) > 0 && result.Data[0].IataCode != "" {
        bestCode = result.Data[0].IataCode
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(map[string]string{"iata_code": bestCode})
}