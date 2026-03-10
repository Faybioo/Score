package services

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
	"github.com/Faybioo/Score/models" 
)

func SyncMatchesFromGist(db *sql.DB, rawURL string) error {
	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Get(rawURL)
	if err != nil {
		return fmt.Errorf("failed to fetch gist: %w", err)
	}
	defer resp.Body.Close()

	var matches []models.Match
	if err := json.NewDecoder(resp.Body).Decode(&matches); err != nil {
		return fmt.Errorf("failed to decode matches: %w", err)
	}

	query := `
		INSERT INTO matches (api_id, kickoff, host_city, stadium, home_team, away_team, status)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		ON CONFLICT (api_id) 
		DO UPDATE SET 
			home_team = EXCLUDED.home_team,
			away_team = EXCLUDED.away_team,
			status = EXCLUDED.status,
			last_updated = CURRENT_TIMESTAMP;
	`

	for _, m := range matches {
		_, err := db.Exec(query, m.ApiID, m.Kickoff, m.HostCity, m.Stadium, m.HomeTeam, m.AwayTeam, m.Status)
		if err != nil {
			return fmt.Errorf("failed to insert match %d: %w", m.ApiID, err)
		}
	}

	fmt.Printf("Successfully synced %d matches from GitHub.\n", len(matches))
	return nil
}
