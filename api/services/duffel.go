package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
)

const duffelBaseURL = "https://api.duffel.com"

type DuffelClient struct {
	token      string
	httpClient *http.Client
}

func NewDuffelClient() *DuffelClient {
	return &DuffelClient{
		token:      os.Getenv("DUFFEL_API_TOKEN"),
		httpClient: &http.Client{},
	}
}

type FlightSearchRequest struct {
	Origin        string `json:"origin"`
	Destination   string `json:"destination"`
	DepartureDate string `json:"departure_date"`
	Adults        int    `json:"adults"`
	CabinClass    string `json:"cabin_class,omitempty"`
}

type duffelOfferRequest struct {
	Data duffelOfferRequestData `json:"data"`
}

type duffelOfferRequestData struct {
	Slices     []duffelSlice `json:"slices"`
	Passengers []duffelPass  `json:"passengers"`
	CabinClass string        `json:"cabin_class,omitempty"`
}

type duffelSlice struct {
	Origin        string `json:"origin"`
	Destination   string `json:"destination"`
	DepartureDate string `json:"departure_date"`
}

type duffelPass struct {
	Type string `json:"type"`
}

func (c *DuffelClient) SearchFlights(req FlightSearchRequest) (json.RawMessage, error) {
	adults := req.Adults
	if adults == 0 {
		adults = 1
	}

	passengers := make([]duffelPass, adults)
	for i := range passengers {
		passengers[i] = duffelPass{Type: "adult"}
	}

	body := duffelOfferRequest{
		Data: duffelOfferRequestData{
			Slices: []duffelSlice{
				{
					Origin:        req.Origin,
					Destination:   req.Destination,
					DepartureDate: req.DepartureDate,
				},
			},
			Passengers: passengers,
			CabinClass: req.CabinClass,
		},
	}

	jsonBody, err := json.Marshal(body)
	if err != nil {
		return nil, fmt.Errorf("marshal error: %w", err)
	}

	httpReq, err := http.NewRequest("POST", duffelBaseURL+"/air/offer_requests?return_offers=true", bytes.NewReader(jsonBody))
	if err != nil {
		return nil, fmt.Errorf("request error: %w", err)
	}

	httpReq.Header.Set("Authorization", "Bearer "+c.token)
	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Duffel-Version", "v2")

	resp, err := c.httpClient.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("duffel request failed: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("read response error: %w", err)
	}

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		return nil, fmt.Errorf("duffel API error (%d): %s", resp.StatusCode, string(respBody))
	}

	return json.RawMessage(respBody), nil
}

func (c *DuffelClient) SuggestAirports(lat, lng string) ([]byte, error) {
    url := fmt.Sprintf("https://api.duffel.com/air/places/suggestions?lat=%s&lng=%s&rad=200", lat, lng)
    req, _ := http.NewRequest("GET", url, nil)
    
    req.Header.Set("Authorization", "Bearer "+c.token) 
    req.Header.Set("Duffel-Version", "v1")

    resp, err := c.httpClient.Do(req)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()

    return io.ReadAll(resp.Body)
}