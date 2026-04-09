package database

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/lib/pq"
)

func ConnectDB() *sql.DB {
	user := os.Getenv("DB_USER")
	pass := os.Getenv("DB_PASSWORD")
	name := os.Getenv("DB_NAME") 
	host := "db"                 
	port := "5432"

	// postgres://user:password@host:port/dbname?sslmode=disable
	connStr := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable", user, pass, host, port, name)

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal("Could not connect to the database:", err)
	}

	err = db.Ping()
	if err != nil {
		log.Fatal("Database is unreachable:", err)
	}

	fmt.Println("Successfully connected to the 'score' database!")
	return db
}

func Migrate(db *sql.DB) error {
    query := `
    CREATE TABLE IF NOT EXISTS matches (
        id SERIAL PRIMARY KEY,
        api_id INTEGER UNIQUE NOT NULL,
        kickoff TIMESTAMP WITH TIME ZONE NOT NULL,
        host_city VARCHAR(100) NOT NULL,
        stadium VARCHAR(100) NOT NULL,
        home_team VARCHAR(100) NOT NULL,
        away_team VARCHAR(100) NOT NULL,
        status VARCHAR(50) NOT NULL,
        last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );`

    _, err := db.Exec(query)
    if err != nil {
        return fmt.Errorf("could not create matches table: %w", err)
    }

	query = `
	CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    auth0_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
	);`
	_, err = db.Exec(query)
	if err != nil {
		return fmt.Errorf("could not create user table: %w", err)
	}

	query = `
	CREATE TABLE IF NOT EXISTS trips (
		id SERIAL PRIMARY KEY,
		auth0_id VARCHAR(255) NOT NULL REFERENCES users(auth0_id),
		match_id INTEGER NOT NULL REFERENCES matches(id),
		flight_offer_id VARCHAR(255) NOT NULL,
		origin VARCHAR(100) NOT NULL,
		destination VARCHAR(100) NOT NULL,
		departure_date TIMESTAMP WITH TIME ZONE NOT NULL,
		return_date TIMESTAMP WITH TIME ZONE,
		cabin_class VARCHAR(50),
		total_amount DECIMAL(10, 2) NOT NULL,
		created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
	);`
	_, err = db.Exec(query)
	if err != nil {
		return fmt.Errorf("could not create trips table: %w", err)
	}

    log.Println("Database migrated")
    return nil
}
