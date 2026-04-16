package models

import "time"

type Trip struct {
	ID            int        `json:"id"`
	Auth0ID       string     `json:"auth0_id"`
	MatchID       int        `json:"match_id"`
	FlightOfferID string     `json:"flight_offer_id"`
	Origin        string     `json:"origin"`
	Destination   string     `json:"destination"`
	DepartureDate time.Time  `json:"departure_date"`
	ReturnDate    *time.Time `json:"return_date"`
	CabinClass    string     `json:"cabin_class"`
	TotalAmount   float64    `json:"total_amount"`
	CreatedAt     time.Time  `json:"created_at"`
}


type TripWithMatch struct {
	Trip

	HomeTeam string `json:"home_team"`
	AwayTeam string `json:"away_team"`
	HostCity string `json:"host_city"`
	Stadium  string `json:"stadium"`
	Kickoff  string `json:"kickoff"`
	Status   string `json:"status"`
}