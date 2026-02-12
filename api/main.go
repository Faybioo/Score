package main

import (
	"net/http"
	"fmt"
	"os"
	"log"
	"database/sql"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/rs/cors"
	_ "github.com/jackc/pgx/v5/stdlib"

)

func main() {
	// open connection to database, ping to ensure reachable
	db_url := os.Getenv("DB_URL")
	if db_url == "" {
		log.Fatal("DB_URL environment variable not set.")
	}

	db, err := sql.Open("pgx", db_url)
	if err != nil {
		log.Fatalf("Unable to connect to database: %v", err)
	}
	defer db.Close()

	err = db.Ping();
	if err != nil {
		log.Fatalf("Database is unreachable: %v", err)
	}
	fmt.Println("Successfully established connection to database.")

	//establish router/cors so react can communicate with the API
	r := chi.NewRouter()

	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

  c := cors.New(cors.Options{
		AllowedOrigins: []string{"http://localhost:5173"},
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

	fmt.Printf("API listening on :8080...")
	http.ListenAndServe(":8080", r)
}


