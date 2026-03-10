package models

import "time"

type Match struct {
	ID           int       `json:"id"`
	ApiID        *int      `json:"api_id"` 
	Kickoff      time.Time `json:"kickoff"`
	HostCity     string    `json:"host_city"`
	Stadium      string    `json:"stadium"`
	HomeTeam     string    `json:"home_team"`
	AwayTeam     string    `json:"away_team"`
	Status       string    `json:"status"`
	LastUpdated  time.Time `json:"last_updated"`
}
