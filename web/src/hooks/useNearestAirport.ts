import { useState, useEffect } from 'react';

// ─── All World Cup host city airports + major US/CA/MX airports ───────────────
// Each entry: [lat, lng, iataCode, cityName]
const AIRPORTS: [number, number, string, string][] = [
  // Host cities
  [33.6407,  -84.4277,  "ATL", "Atlanta"],
  [42.3656,  -71.0096,  "BOS", "Boston"],
  [32.8998,  -97.0403,  "DFW", "Dallas"],
  [20.5218,  -103.3111, "GDL", "Guadalajara"],
  [29.9902,  -95.3368,  "IAH", "Houston"],
  [39.2976,  -94.7139,  "MCI", "Kansas City"],
  [33.9425,  -118.4081, "LAX", "Los Angeles"],
  [19.4363,  -99.0721,  "MEX", "Mexico City"],
  [25.7959,  -80.2870,  "MIA", "Miami"],
  [25.7785,  -100.1063, "MTY", "Monterrey"],
  [40.6895,  -74.1745,  "EWR", "New York/New Jersey"],
  [39.8721,  -75.2411,  "PHL", "Philadelphia"],
  [37.6213,  -122.3790, "SFO", "San Francisco"],
  [47.4502,  -122.3088, "SEA", "Seattle"],
  [43.6777,  -79.6248,  "YYZ", "Toronto"],
  [49.1967,  -123.1815, "YVR", "Vancouver"],
  // Additional major airports for better origin detection
  [40.6413,  -73.7781,  "JFK", "New York (JFK)"],
  [41.9742,  -87.9073,  "ORD", "Chicago"],
  [47.4431,  -122.3016, "SEA", "Seattle"],
  [44.8848,  -93.2223,  "MSP", "Minneapolis"],
  [39.8561,  -104.6737, "DEN", "Denver"],
  [36.0840,  -115.1537, "LAS", "Las Vegas"],
  [33.4373,  -112.0078, "PHX", "Phoenix"],
  [29.9902,  -90.2580,  "MSY", "New Orleans"],
  [35.0441,  -89.9767,  "MEM", "Memphis"],
  [30.1975,  -97.6664,  "AUS", "Austin"],
  [29.5337,  -98.4698,  "SAT", "San Antonio"],
  [32.8481,  -96.8512,  "DAL", "Dallas (Love Field)"],
  [37.3626,  -121.9290, "SJC", "San Jose"],
  [45.5898,  -122.5951, "PDX", "Portland"],
  [61.1743,  -149.9963, "ANC", "Anchorage"],
  [21.3245,  -157.9251, "HNL", "Honolulu"],
  [45.4706,  -73.7408,  "YUL", "Montreal"],
  [53.3097,  -113.5797, "YEG", "Edmonton"],
  [51.1139,  -114.0203, "YYC", "Calgary"],
  [19.0935,  -98.3706,  "PBC", "Puebla"],
  [20.6801,  -103.3476, "GDL", "Guadalajara"],
  [25.7785,  -80.2870,  "CUN", "Cancun"],
];

function degreesToRadians(deg: number): number {
  return deg * (Math.PI / 180);
}

function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371;
  const dLat = degreesToRadians(lat2 - lat1);
  const dLng = degreesToRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(degreesToRadians(lat1)) *
    Math.cos(degreesToRadians(lat2)) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function nearestAirportCode(lat: number, lng: number): string {
  let best = AIRPORTS[0];
  let bestDist = Infinity;
  for (const airport of AIRPORTS) {
    const dist = haversineDistance(lat, lng, airport[0], airport[1]);
    if (dist < bestDist) {
      bestDist = dist;
      best = airport;
    }
  }
  return best[2];
}

async function getLocationFromIP(): Promise<{ lat: number; lng: number } | null> {
  try {
    // ip-api.com is free, no key needed, limit 45 req/min
    const res = await fetch('http://ip-api.com/json/?fields=lat,lon,status');
    const data = await res.json();
    if (data.status === 'success') {
      return { lat: data.lat, lng: data.lon };
    }
    return null;
  } catch {
    return null;
  }
}

async function getLocationFromBrowser(): Promise<{ lat: number; lng: number } | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) { resolve(null); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      ()    => resolve(null),
      { timeout: 5000 }
    );
  });
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useNearestAirport() {
  const [originCode, setOriginCode] = useState<string>('JFK');
  const [isDetecting, setIsDetecting] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function detect() {
      setIsDetecting(true);

      // 1. Try browser geolocation
      let loc = await getLocationFromBrowser();

      // 2. Fall back to IP geolocation
      if (!loc) {
        loc = await getLocationFromIP();
      }

      // 3. Fall back to JFK
      if (!cancelled) {
        if (loc) {
          setOriginCode(nearestAirportCode(loc.lat, loc.lng));
        } else {
          setOriginCode('JFK');
        }
        setIsDetecting(false);
      }
    }

    detect();
    return () => { cancelled = true; };
  }, []);

  return { originCode, isDetecting };
}