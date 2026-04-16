import { useState, useEffect } from 'react';

async function getLocationFromIP(): Promise<{ lat: number; lng: number } | null> {
  try {
    const res = await fetch('http://ip-api.com/json/?fields=lat,lon,status');
    const data = await res.json();
    return data.status === 'success' ? { lat: data.lat, lng: data.lon } : null;
  } catch { return null; }
}

async function getLocationFromBrowser(): Promise<{ lat: number; lng: number } | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) { resolve(null); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { timeout: 5000 }
    );
  });
}

export function useNearestAirport() {
  const [originCode, setOriginCode] = useState<string>('JFK');
  const [isDetecting, setIsDetecting] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function detect() {
      setIsDetecting(true);
      
      const loc = await getLocationFromBrowser() || await getLocationFromIP();

      if (!cancelled && loc) {
        try {
          // Calling your Go backend
          const res = await fetch(`http://localhost:8080/api/airports/nearby?lat=${loc.lat}&lng=${loc.lng}`);
          
          if (!res.ok) throw new Error("Backend error");
          
          const data = await res.json();
          // Log this to your browser console to see what Duffel found!
          console.log("Duffel found nearest airport:", data.iata_code);
          
          if (data.iata_code) {
            setOriginCode(data.iata_code);
          }
        } catch (err) {
          console.error("Duffel detection failed, using JFK fallback:", err);
          setOriginCode('JFK');
        }
      }
      
      if (!cancelled) setIsDetecting(false);
    }

    detect();
    return () => { cancelled = true; };
  }, []);

  return { originCode, isDetecting };
}