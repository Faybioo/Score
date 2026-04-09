package main

import (
	"net/http"
	"fmt"
	"log"
	"encoding/json"

	"github.com/Faybioo/Score/models"
	"github.com/Faybioo/Score/services"
	"github.com/Faybioo/Score/database"
	authMiddleware "github.com/Faybioo/Score/middleware"
	"github.com/Faybioo/Score/handlers"

	"github.com/go-chi/chi/v5"
	chiMiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/rs/cors"
	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/joho/godotenv"

)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Println(".env file not found, using system environment variables.")
	}

	db := database.ConnectDB()
	defer db.Close()

  //migration / table creation
	if err := database.Migrate(db); err != nil {
        log.Fatalf("Migration failed: %v", err)
    }

	//sync json match data
	const gistURL = "https://gist.githubusercontent.com/ferns5/1b90d98ce188fbc68cebc3e731be7d9c/raw/b6550ea5a71c3b027e9f41c3e365f7c818efffb0/matches.json"
	go func() {
		fmt.Println("Synchronizing match data...")
		if err := services.SyncMatchesFromGist(db, gistURL); err != nil {
			fmt.Printf("Sync warning: %v\n", err)
		}
	}()

	//establish router/cors so react can communicate with the API
	r := chi.NewRouter()

	r.Use(chiMiddleware.Logger)
	r.Use(chiMiddleware.Recoverer)

  c := cors.New(cors.Options{
		AllowedOrigins: []string{"http://localhost:5173", "http://localhost:5174"},
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders: []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders: []string{"Link"},
		AllowCredentials: true,
		MaxAge: 300,
	})

	r.Use(c.Handler)

	r.Get("/api/health", func(w http.ResponseWriter, r *http.Request) {
		var db_time string
		err := db.QueryRow("SELECT NOW()").Scan(&db_time)
		if err != nil {
			http.Error(w, "Database Error", http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		fmt.Fprintf(w, `{"status": "ok", "db_time": "%s"}`, db_time)
	})


	r.Get("/api/matches", func(w http.ResponseWriter, r *http.Request) {
		rows, err := db.Query("SELECT id, kickoff, host_city, stadium, home_team, away_team, status FROM public.matches")
		if err != nil {
			http.Error(w, "Query Error: "+err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var matches []models.Match
		for rows.Next() {
			var m models.Match
			err := rows.Scan(&m.ID, &m.Kickoff, &m.HostCity, &m.Stadium, &m.HomeTeam, &m.AwayTeam, &m.Status)
			if err != nil {
				log.Println("Scan error:", err)
				continue
			}
			matches = append(matches, m)
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(matches)
	})

	r.Post("/api/flights/search", handlers.SearchFlights)

	//must be logged in as USER
	r.Group(func(r chi.Router) {
    r.Use(authMiddleware.EnsureValidToken)
		r.Post("/api/user/sync", handlers.SyncUser(db))
		r.Get("/api/user/profile", handlers.GetProfile(db))
    //r.Post("/api/user/saved-matches", handlers.SaveMatch)

		r.Post("/api/trips/save", handlers.SaveTrip(db))
		r.Get("/api/trips", handlers.GetTrips(db))

		// admin endpoints for matches table
		r.Put("/api/matches/{id}", handlers.UpdateMatch(db))
		r.Delete("/api/matches/{id}", handlers.DeleteMatch(db))
	})

	fmt.Printf("API listening on :8080...")
	http.ListenAndServe(":8080", r)
}


