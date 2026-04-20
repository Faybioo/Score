import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  Trophy, Calendar, Plane, Search, LogOut, Loader2,
  MapPin, ArrowRight, Trash2, ExternalLink
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { useAuth0 } from '@auth0/auth0-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SavedTrip {
  id: number;
  auth0_id: string;
  match_id: number;
  flight_offer_id: string;
  origin: string;
  destination: string;
  departure_date: string;
  return_date: string | null;
  cabin_class: string;
  total_amount: number;
  created_at: string;
  // joined match fields
  home_team: string;
  away_team: string;
  host_city: string;
  stadium: string;
  kickoff: string;
  status: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], {
    hour: '2-digit', minute: '2-digit', hour12: false,
  });
}

// ─── Trip Card ────────────────────────────────────────────────────────────────

function TripCard({
  trip,
  onDelete,
}: {
  trip: SavedTrip;
  onDelete: (id: number) => void;
}) {
  return (
    <div className="bg-[#111f17] border border-white/8 rounded-2xl overflow-hidden hover:border-yellow-600/25 transition-colors">
      {/* Match info header */}
      <div className="px-5 pt-4 pb-3 border-b border-white/5 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <Trophy className="h-3 w-3 text-yellow-500" />
            <span className="text-[9px] text-yellow-500 uppercase tracking-widest font-semibold">
              {trip.status || 'World Cup 2026'}
            </span>
          </div>
          {trip.home_team && trip.away_team ? (
            <p className="text-sm font-bold text-white leading-tight">
              {trip.home_team} vs {trip.away_team}
            </p>
          ) : (
            <p className="text-sm font-bold text-white leading-tight">
              Match #{trip.match_id}
            </p>
          )}
          {trip.host_city && (
            <p className="text-[11px] text-white/35 mt-1 flex items-center gap-1">
              <MapPin className="h-3 w-3 shrink-0" />
              {trip.stadium ? `${trip.stadium}, ` : ''}{trip.host_city}
            </p>
          )}
        </div>
        <div className="text-right shrink-0">
          {trip.kickoff ? (
            <>
              <p className="text-sm font-bold text-white">{formatDate(trip.kickoff)}</p>
              <p className="text-[11px] text-white/35 mt-0.5">{formatTime(trip.kickoff)}</p>
            </>
          ) : (
            <p className="text-sm font-bold text-white">{formatDate(trip.departure_date)}</p>
          )}
        </div>
      </div>

      {/* Flight route */}
      <div className="px-5 py-4">
        <div className="flex items-center gap-1.5 mb-3">
          <Plane className="h-3 w-3 text-yellow-500" />
          <span className="text-[9px] text-white/35 uppercase tracking-widest">Flight</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-16">
            <p className="text-2xl font-black text-white font-mono leading-none tracking-tight">
              {trip.origin}
            </p>
          </div>
          <div className="flex-1 flex items-center gap-1">
            <div className="h-px flex-1 bg-white/10" />
            <ArrowRight className="h-3 w-3 text-white/20 shrink-0" />
          </div>
          <div className="w-16 text-right">
            <p className="text-2xl font-black text-white font-mono leading-none tracking-tight">
              {trip.destination}
            </p>
          </div>
        </div>
        <p className="text-[11px] text-white/25 mt-2">
          Departing {formatDate(trip.departure_date)}
        </p>
      </div>

      {/* Price + actions */}
      <div className="px-5 pb-4 flex items-end justify-between border-t border-white/5 pt-4">
        <div>
          <p className="text-[9px] text-white/25 uppercase tracking-widest mb-0.5">Package Price</p>
          <p className="text-3xl font-black text-white leading-none">
            ${trip.total_amount.toFixed(0)}
          </p>
          <p className="text-[9px] text-white/20 mt-1">
            Saved {formatDate(trip.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onDelete(trip.id)}
            className="flex items-center gap-1.5 text-[11px] text-white/20 hover:text-red-400 transition-colors px-3 py-2 rounded-lg hover:bg-red-500/10"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function TripSkeleton() {
  return (
    <div className="bg-[#111f17] border border-white/5 rounded-2xl overflow-hidden animate-pulse">
      <div className="px-5 pt-4 pb-3 border-b border-white/5 flex justify-between">
        <div className="space-y-2">
          <div className="h-2.5 w-20 bg-white/5 rounded" />
          <div className="h-4 w-44 bg-white/8 rounded" />
          <div className="h-2.5 w-32 bg-white/5 rounded" />
        </div>
        <div className="h-4 w-20 bg-white/8 rounded" />
      </div>
      <div className="px-5 py-5">
        <div className="flex items-center gap-4">
          <div className="h-8 w-12 bg-white/8 rounded" />
          <div className="flex-1 h-px bg-white/5" />
          <div className="h-8 w-12 bg-white/8 rounded" />
        </div>
      </div>
      <div className="px-5 pb-5 pt-3 border-t border-white/5">
        <div className="h-8 w-16 bg-white/8 rounded" />
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, getAccessTokenSilently, isAuthenticated, isLoading, logout } = useAuth0();

  const [trips, setTrips] = useState<SavedTrip[]>([]);
  const [isLoadingTrips, setIsLoadingTrips] = useState(true);
  const [error, setError] = useState('');

  // Sync user on login
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isLoading, isAuthenticated, navigate]);

  useEffect(() => {
    const syncUser = async () => {
      if (isAuthenticated && user) {
        try {
          const token = await getAccessTokenSilently();
          await fetch('http://localhost:8080/api/user/sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              auth0_id: user.sub,
              email: user.email,
            }),
          });
        } catch (err) {
          console.error('Failed to sync user:', err);
        }
      }
    };
    syncUser();
  }, [isAuthenticated, user, getAccessTokenSilently]);

  // Fetch saved trips
  useEffect(() => {
    const fetchTrips = async () => {
      if (!isAuthenticated) return;
      try {
        const token = await getAccessTokenSilently();
        const res = await fetch('http://localhost:8080/api/trips', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to load trips');
        const data = await res.json();
        setTrips(Array.isArray(data) ? data : data.trips || []);
      } catch (err: any) {
        console.error('Failed to fetch trips:', err);
        setError(err.message || 'Could not load saved trips.');
      } finally {
        setIsLoadingTrips(false);
      }
    };
    fetchTrips();
  }, [isAuthenticated, getAccessTokenSilently]);

  // Delete a saved trip
  const handleDelete = async (tripId: number) => {
    if (!confirm('Remove this saved itinerary?')) return;
    try {
      const token = await getAccessTokenSilently();
      const res = await fetch(`http://localhost:8080/api/trips/${tripId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Delete failed');
      setTrips((prev) => prev.filter((t) => t.id !== tripId));
    } catch (err) {
      console.error('Failed to delete trip:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A1612] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
      </div>
    );
  }

  // Dynamic stats
  const uniqueDestinations = new Set(trips.map((t) => t.destination)).size;
  const stats = [
    { label: 'Saved Trips', value: trips.length, icon: Calendar },
    { label: 'Destinations', value: uniqueDestinations, icon: Plane },
    { label: 'Matches Planned', value: new Set(trips.map((t) => t.match_id)).size, icon: Trophy },
  ];

  return (
    <div className="min-h-screen bg-[#0A1612] text-white font-sans">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0A1612]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <Trophy className="h-8 w-8 text-yellow-500" />
            <span className="text-2xl font-bold tracking-tighter">Score!</span>
          </div>
          <div className="flex items-center gap-6">
            <Button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-sm text-white/60 hover:text-yellow-500 transition-colors"
            >
              <Search className="h-4 w-4" />
              Find Trips
            </Button>
            <Button
              onClick={() =>
                logout({ logoutParams: { returnTo: window.location.origin } })
              }
              className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        {/* Welcome */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back{user?.given_name ? `, ${user.given_name}` : ''}!
          </h1>
          <p className="text-white/40 text-sm">
            Manage your World Cup travel itineraries
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {stats.map((stat) => (
            <Card
              key={stat.label}
              className="bg-[#122620] border-white/10 p-6 flex flex-col items-center justify-center text-center gap-3"
            >
              <p className="text-white/40 text-xs">{stat.label}</p>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
              <stat.icon className="h-10 w-10 text-yellow-600/60" />
            </Card>
          ))}
        </div>

        {/* Itineraries */}
        <div>
          <h2 className="text-2xl font-bold mb-6">My Itineraries</h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-4 mb-6 text-sm">
              {error}
            </div>
          )}

          {isLoadingTrips ? (
            <div className="space-y-4">
              <TripSkeleton />
              <TripSkeleton />
            </div>
          ) : trips.length === 0 ? (
            <Card className="bg-[#122620] border-white/10 p-16 flex flex-col items-center justify-center text-center">
              <Plane className="h-16 w-16 text-white/10 mb-6" />
              <h3 className="text-xl font-bold mb-2">No saved trips yet</h3>
              <p className="text-white/40 text-sm mb-8">
                Start planning your World Cup journey by searching for travel
                packages
              </p>
              <Button
                onClick={() => navigate('/')}
                className="bg-yellow-500/80 hover:bg-yellow-500 text-black font-bold px-12 h-12 w-full max-w-xl"
              >
                <Search className="mr-2 h-4 w-4" />
                Search Packages
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {trips.map((trip) => (
                <TripCard key={trip.id} trip={trip} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}