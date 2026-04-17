import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import {
  Plane, MapPin, ArrowRight,
  ArrowLeft, Trophy, AlertCircle, ChevronDown, Check, X
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useAuth0 } from '@auth0/auth0-react';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Match {
  id: number;
  kickoff: string;
  host_city: string;
  stadium: string;
  home_team: string;
  away_team: string;
  status: string;
}

interface Segment {
  departing_at: string;
  arriving_at: string;
  origin: { iata_code: string; name: string };
  destination: { iata_code: string; name: string };
  marketing_carrier: { name: string; iata_code: string };
  aircraft?: { name: string };
}

interface Slice {
  origin: { iata_code: string; name: string };
  destination: { iata_code: string; name: string };
  duration: string;
  segments: Segment[];
}

interface Offer {
  id: string;
  total_amount: string;
  total_currency: string;
  slices: Slice[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CITY_AIRPORT: Record<string, string> = {
  "Atlanta":             "ATL",
  "Boston":              "BOS",
  "Dallas":              "DFW",
  "Guadalajara":         "GDL",
  "Houston":             "IAH",
  "Kansas City":         "MCI",
  "Los Angeles":         "LAX",
  "Mexico City":         "MEX",
  "Miami":               "MIA",
  "Monterrey":           "MTY",
  "New York/New Jersey": "EWR",
  "Philadelphia":        "PHL",
  "San Francisco":       "SFO",
  "Seattle":             "SEA",
  "Toronto":             "YYZ",
  "Vancouver":           "YVR",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDuration(iso: string): string {
  const h = iso.match(/(\d+)H/)?.[1];
  const m = iso.match(/(\d+)M/)?.[1];
  return [h && `${h}h`, m && `${m}m`].filter(Boolean).join(' ') || iso;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

function kickoffToDate(kickoff: string): string {
  return new Date(kickoff).toISOString().split('T')[0];
}

function kickoffDisplay(kickoff: string): string {
  return new Date(kickoff).toLocaleDateString('en-US', {
    month: 'numeric', day: 'numeric', year: 'numeric',
  });
}

function kickoffTime(kickoff: string): string {
  return new Date(kickoff).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

function durationToMinutes(iso: string): number {
  const hours = parseInt(iso.match(/(\d+)H/)?.[1] || '0');
  const minutes = parseInt(iso.match(/(\d+)M/)?.[1] || '0');
  return hours * 60 + minutes;
}

// ─── Toast Notification ───────────────────────────────────────────────────────

function Toast({
  message,
  type,
  onClose,
  onAction,
  actionLabel,
}: {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
  onAction?: () => void;
  actionLabel?: string;
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-5 py-3 rounded-xl border shadow-2xl backdrop-blur-md animate-[slideUp_0.3s_ease-out] ${
      type === 'success'
        ? 'bg-green-900/80 border-green-500/30 text-green-100'
        : 'bg-red-900/80 border-red-500/30 text-red-100'
    }`}>
      {type === 'success' ? (
        <Check className="h-4 w-4 text-green-400 shrink-0" />
      ) : (
        <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
      )}
      <span className="text-sm font-medium">{message}</span>
      {onAction && actionLabel && (
        <button
          onClick={onAction}
          className="text-sm font-bold text-yellow-400 hover:text-yellow-300 transition-colors ml-2 whitespace-nowrap"
        >
          {actionLabel}
        </button>
      )}
      <button onClick={onClose} className="ml-2 text-white/40 hover:text-white/80 transition-colors">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-[#111f17] border border-white/5 rounded-2xl overflow-hidden animate-pulse">
      <div className="px-5 pt-4 pb-3 border-b border-white/5 flex justify-between">
        <div className="space-y-2">
          <div className="h-2.5 w-20 bg-white/5 rounded" />
          <div className="h-4 w-44 bg-white/8 rounded" />
          <div className="h-2.5 w-32 bg-white/5 rounded" />
        </div>
        <div className="space-y-1 text-right">
          <div className="h-4 w-20 bg-white/8 rounded ml-auto" />
          <div className="h-2.5 w-10 bg-white/5 rounded ml-auto" />
        </div>
      </div>
      <div className="px-5 py-5">
        <div className="h-2.5 w-24 bg-white/5 rounded mb-4" />
        <div className="flex items-center gap-4">
          <div className="h-8 w-12 bg-white/8 rounded" />
          <div className="flex-1 h-px bg-white/5" />
          <div className="h-8 w-12 bg-white/8 rounded" />
        </div>
        <div className="h-2.5 w-28 bg-white/5 rounded mt-3" />
      </div>
      <div className="px-5 pb-5 flex justify-between items-end">
        <div className="space-y-1">
          <div className="h-2.5 w-24 bg-white/5 rounded" />
          <div className="h-8 w-16 bg-white/8 rounded" />
          <div className="h-2.5 w-20 bg-white/5 rounded" />
        </div>
        <div className="h-9 w-32 bg-white/5 rounded-xl" />
      </div>
    </div>
  );
}

// ─── Flight Card ──────────────────────────────────────────────────────────────

function FlightCard({
  offer,
  match,
  onSave,
  isSaved,
  isSaving,
}: {
  offer: Offer;
  match: Match;
  onSave: (offer: Offer) => void;
  isSaved: boolean;
  isSaving: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const slice    = offer.slices[0];
  const firstSeg = slice.segments[0];
  const lastSeg  = slice.segments[slice.segments.length - 1];
  const stops    = slice.segments.length - 1;

  return (
    <div className="bg-[#111f17] border border-white/8 rounded-2xl overflow-hidden hover:border-yellow-600/25 transition-colors">

      {/* Match header */}
      <div className="px-5 pt-4 pb-3 border-b border-white/5 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <Trophy className="h-3 w-3 text-yellow-500" />
            <span className="text-[9px] text-yellow-500 uppercase tracking-widest font-semibold">
              {match.status}
            </span>
          </div>
          <p className="text-sm font-bold text-white leading-tight">
            {match.home_team} vs {match.away_team}
          </p>
          <p className="text-[11px] text-white/35 mt-1 flex items-center gap-1">
            <MapPin className="h-3 w-3 shrink-0" />
            {match.stadium}, {match.host_city}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-bold text-white">{kickoffDisplay(match.kickoff)}</p>
          <p className="text-[11px] text-white/35 mt-0.5">{kickoffTime(match.kickoff)}</p>
        </div>
      </div>

      {/* Flight row */}
      <div className="px-5 py-4">
        <div className="flex items-center gap-1.5 mb-3">
          <Plane className="h-3 w-3 text-yellow-500" />
          <span className="text-[9px] text-white/35 uppercase tracking-widest">Flight Details</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-16">
            <p className="text-2xl font-black text-white font-mono leading-none tracking-tight">
              {firstSeg.origin.iata_code}
            </p>
            <p className="text-[11px] text-white/35 mt-0.5">{formatTime(firstSeg.departing_at)}</p>
          </div>

          <div className="flex-1 flex flex-col items-center gap-1">
            <p className="text-[9px] text-white/25">{formatDuration(slice.duration)}</p>
            <div className="w-full flex items-center gap-1">
              <div className="h-px flex-1 bg-white/10" />
              <ArrowRight className="h-3 w-3 text-white/20 shrink-0" />
            </div>
            <Badge className={`text-[9px] border-none px-2 py-0 leading-4 ${
              stops === 0 ? 'bg-green-500/10 text-green-400' : 'bg-orange-500/10 text-orange-400'
            }`}>
              {stops === 0 ? 'Non-stop' : `${stops} stop${stops > 1 ? 's' : ''}`}
            </Badge>
          </div>

          <div className="w-16 text-right">
            <p className="text-2xl font-black text-white font-mono leading-none tracking-tight">
              {lastSeg.destination.iata_code}
            </p>
            <p className="text-[11px] text-white/35 mt-0.5">{formatTime(lastSeg.arriving_at)}</p>
          </div>
        </div>

        <p className="text-[11px] text-white/25 mt-2">{firstSeg.marketing_carrier.name}</p>
      </div>

      {/* Price + CTA */}
      <div className="px-5 pb-4 flex items-end justify-between">
        <div>
          <p className="text-[9px] text-white/25 uppercase tracking-widest mb-0.5">Total Package Price</p>
          <p className="text-3xl font-black text-white leading-none">
            ${parseFloat(offer.total_amount).toFixed(0)}
          </p>
          <p className="text-[9px] text-white/20 mt-1">includes flight</p>
        </div>
        <Button
          onClick={() => onSave(offer)}
          disabled={isSaved || isSaving}
          className={`font-bold rounded-xl px-5 h-9 text-sm shadow-lg transition-all ${
            isSaved
              ? 'bg-green-600/20 text-green-400 border border-green-500/30 cursor-default shadow-none'
              : 'bg-yellow-600 hover:bg-yellow-500 text-black shadow-yellow-900/20'
          }`}
        >
          {isSaving ? (
            <>
              <span className="h-3.5 w-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin mr-2" />
              Saving…
            </>
          ) : isSaved ? (
            <>
              <Check className="h-3.5 w-3.5 mr-1.5" />
              Saved
            </>
          ) : (
            'Save Itinerary'
          )}
        </Button>
      </div>

      {/* Expand toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-center gap-1 py-2.5 text-[10px] text-white/20 hover:text-white/45 border-t border-white/5 transition-colors"
      >
        Flight details
        <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {expanded && (
        <div className="px-5 pb-5 pt-3 space-y-3 border-t border-white/5">
          {slice.segments.map((seg, i) => (
            <div key={i} className="flex gap-4 text-xs text-white/40">
              <span className="w-10 font-mono text-white/25 shrink-0 pt-0.5">{seg.marketing_carrier.iata_code}</span>
              <div>
                <p>
                  <span className="text-white/80 font-semibold">{seg.origin.iata_code}</span>
                  {' '}{formatTime(seg.departing_at)}
                  {' → '}
                  <span className="text-white/80 font-semibold">{seg.destination.iata_code}</span>
                  {' '}{formatTime(seg.arriving_at)}
                </p>
                <p className="text-white/20 mt-0.5">{seg.origin.name} → {seg.destination.name}</p>
                {seg.aircraft && <p className="text-white/15 mt-0.5">{seg.aircraft.name}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Sort Dropdown ────────────────────────────────────────────────────────────

type SortOrder = 'price_asc' | 'price_desc' | 'duration_asc' | 'time_asc' | 'nonstop_first';

function SortDropdown({ sortOrder, setSortOrder }: { sortOrder: SortOrder; setSortOrder: (s: SortOrder) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const options: { label: string; value: SortOrder }[] = [
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Fastest Flight', value: 'duration_asc' },
  { label: 'Earliest Arrival', value: 'time_asc' },
  { label: 'Non-stop First', value: 'nonstop_first' },
];

  const current = options.find(o => o.value === sortOrder) || options[0];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 border border-white/10 hover:border-white/20 rounded-lg px-3 py-1.5 transition-colors"
      >
        {current.label}
        <ChevronDown className={`h-3 w-3 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-1.5 w-44 bg-[#111f17] border border-white/10 rounded-xl overflow-hidden shadow-xl z-10">
          {options.map(opt => (
            <button
              key={opt.value}
              onClick={() => { setSortOrder(opt.value); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-xs transition-colors ${
                sortOrder === opt.value
                  ? 'text-yellow-500 bg-yellow-600/10'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/5'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SearchPage() {
  const { getAccessTokenSilently, isAuthenticated, loginWithRedirect } = useAuth0();

  const [searchParams]      = useSearchParams();
  const navigate            = useNavigate();

  const searchType = searchParams.get('type') as 'match' | 'team' | 'city' | null;
  const query      = searchParams.get('q') || '';
  const origin     = searchParams.get('origin') || 'JFK';

  const [allMatches,       setAllMatches]       = useState<Match[]>([]);
  const [relevantMatches,  setRelevantMatches]  = useState<Match[]>([]);
  const [activeMatch,      setActiveMatch]      = useState<Match | null>(null);
  const [offers,           setOffers]           = useState<Offer[]>([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(true);
  const [isLoadingFlights, setIsLoadingFlights] = useState(false);
  const [error,            setError]            = useState('');
  const [sortOrder,        setSortOrder]        = useState<SortOrder>('price_asc');

  // Track saved + saving state per offer
  const [savedOfferIds, setSavedOfferIds]   = useState<Set<string>>(new Set());
  const [savingOfferId, setSavingOfferId]   = useState<string | null>(null);

  // Toast state
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
    actionLabel?: string;
    onAction?: () => void;
  } | null>(null);

  const filteredOffers = offers.filter(offer => {
    if (!activeMatch) return true;
    
    const kickoffTime = new Date(activeMatch.kickoff).getTime();
    const arrivalTime = new Date(
      offer.slices[0].segments[offer.slices[0].segments.length - 1].arriving_at
    ).getTime();

    return arrivalTime < kickoffTime;
  });

  const sortedOffers = [...filteredOffers].sort((a, b) => {
    switch (sortOrder) {
      case 'price_asc':
        return parseFloat(a.total_amount) - parseFloat(b.total_amount);
      case 'price_desc':
        return parseFloat(b.total_amount) - parseFloat(a.total_amount);
      case 'duration_asc':
        return durationToMinutes(a.slices[0].duration) - durationToMinutes(b.slices[0].duration);
      case 'time_asc':
        const arrivalA = new Date(a.slices[0].segments[a.slices[0].segments.length - 1].arriving_at).getTime();
        const arrivalB = new Date(b.slices[0].segments[b.slices[0].segments.length - 1].arriving_at).getTime();
        return arrivalA - arrivalB;
      case 'nonstop_first':
        const stopsA = a.slices[0].segments.length - 1;
        const stopsB = b.slices[0].segments.length - 1;
        return stopsA - stopsB;
      default:
        return 0;
    }
  });

  const handleSaveTrip = async (offer: Offer) => {
    if (savedOfferIds.has(offer.id)) return;
    
    if (!isAuthenticated) {
      loginWithRedirect({
        appState: { returnTo: window.location.pathname + window.location.search },
      });
      return;
    }

    setSavingOfferId(offer.id);

    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(`${apiUrl}/api/trips/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          match_id: activeMatch?.id,
          flight_offer_id: offer.id,
          total_amount: parseFloat(offer.total_amount) || 0,
          origin: offer.slices[0].origin.iata_code,
          destination: offer.slices[0].destination.iata_code,
          departure_date: new Date(offer.slices[0].segments[0].departing_at).toISOString(),
        }),
      });

      if (response.status === 409) {
        setToast({
          message: 'You already saved this trip!',
          type: 'error',
          actionLabel: 'View Dashboard',
          onAction: () => navigate('/dashboard'),
        });
        setSavedOfferIds((prev) => new Set(prev).add(offer.id));
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Save failed');
      }

      setSavedOfferIds((prev) => new Set(prev).add(offer.id));
      setToast({
        message: 'Itinerary saved!',
        type: 'success',
        actionLabel: 'View My Trips',
        onAction: () => navigate('/dashboard'),
      });
    } catch (err: any) {
      console.error('Save failed:', err);
      setToast({
        message: err.message || 'Could not save itinerary. Try again.',
        type: 'error',
      });
    } finally {
      setSavingOfferId(null);
    }
  };

  useEffect(() => {
    fetch(`${apiUrl}/api/matches`)
      .then(r => r.json())
      .then((data: Match[]) => setAllMatches(data || []))
      .catch(() => setError('Could not load match data.'))
      .finally(() => setIsLoadingMatches(false));
  }, []);

  useEffect(() => {
    if (!allMatches.length) return;
    let filtered: Match[] = [];
    if      (searchType === 'match') filtered = allMatches.filter(m => m.id.toString() === query);
    else if (searchType === 'team')  filtered = allMatches.filter(m => m.home_team === query || m.away_team === query);
    else if (searchType === 'city')  filtered = allMatches.filter(m => m.host_city === query);
    setRelevantMatches(filtered);

    if (filtered.length === 1) {
      setActiveMatch(filtered[0]);
    }
  }, [allMatches, searchType, query]);

  useEffect(() => {
    if (!activeMatch) return;
    const destCode = CITY_AIRPORT[activeMatch.host_city];
    if (!destCode) { setError(`No airport code found for "${activeMatch.host_city}"`); return; }

    setIsLoadingFlights(true);
    setError('');
    setSavedOfferIds(new Set()); // Reset saved state when match changes

    fetch(`${apiUrl}/api/flights/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origin,
        destination: destCode,
        departure_date: kickoffToDate(activeMatch.kickoff),
      }),
    })
      .then(async r => { 
        if (!r.ok) {
          const errorData = await r.json().catch(() => ({})); 
          throw new Error(errorData.message || r.status.toString()); 
        }
        return r.json(); 
      })
      .then(data => {
        const raw = data?.data?.offers ?? data?.offers ?? data ?? [];
        setOffers(Array.isArray(raw) ? raw : []);
      })
      .catch(e => {
        const msg = e.message.toLowerCase();
        console.log("Caught search error:", msg);

        const isValidationError = 
          msg.includes('400') || 
          msg.includes('502') || 
          msg.includes('airport') || 
          msg.includes('invalid_identifier') || 
          msg.includes('not_found');

        if (isValidationError) {
          setError(`"${origin}" is not a recognized airport code. Please try a major hub like MCO, JAX, or MIA.`);
        } else {
          setError('Flight search failed. Our flight engine is having trouble connecting.');
        }
      })
      .finally(() => setIsLoadingFlights(false));
  }, [activeMatch, origin]);

  const isLoading = isLoadingMatches || isLoadingFlights;

  return (
    <div className="min-h-screen bg-[#0A1612] text-white font-sans">

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          onAction={toast.onAction}
          actionLabel={toast.actionLabel}
        />
      )}

      {/* Header */}
      <header className="border-b border-white/8 bg-[#0A1612]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <Trophy className="h-6 w-6 text-yellow-500" />
            <span className="text-xl font-bold tracking-tighter">Score!</span>
          </div>
          <button
            onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
            className="text-sm font-medium text-white/40 hover:text-yellow-500 transition-colors"
          >
            My Trips
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 max-w-3xl">

        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-serif mb-1">
            {searchType === 'team' ? `Follow ${query}` :
            searchType === 'city' ? `Matches in ${query}` :
            'Travel Packages'}
          </h1>
          <p className="text-white/30 text-sm">
            {activeMatch ? `Showing flights for ${activeMatch.home_team} vs ${activeMatch.away_team}` : 'Select a match to see flights'}
          </p>
        </div>

        {relevantMatches.length > 1 && (
          <div className="mb-8 overflow-x-auto pb-4 flex gap-3
            scrollbar-thin
            scrollbar-thumb-yellow-600/20
            scrollbar-track-white/5
            hover:scrollbar-thumb-yellow-600/40
            [&::-webkit-scrollbar]:h-1.5
            [&::-webkit-scrollbar-track]:bg-white/5
            [&::-webkit-scrollbar-track]:rounded-full
            [&::-webkit-scrollbar-thumb]:bg-yellow-600/80
            [&::-webkit-scrollbar-thumb]:rounded-full
            hover:[&::-webkit-scrollbar-thumb]:bg-yellow-600/40">
            {relevantMatches
              .filter(m => {
                const isPlaceholder = /^(Group|Match)/i.test(m.home_team) || /^(Group|Match)/i.test(m.away_team);
                return !isPlaceholder;
              })
              .map((m) => (
                <button
                  key={m.id}
                  onClick={() => setActiveMatch(m)}
                  className={`shrink-0 p-4 rounded-xl border transition-all text-left min-w-[200px] ${
                    activeMatch?.id === m.id
                      ? 'bg-yellow-600/10 border-yellow-600/50'
                      : 'bg-white/5 border-white/5 hover:border-white/10'
                  }`}
                >
                  <p className="text-[10px] text-yellow-500 font-bold uppercase mb-1">
                    {new Date(m.kickoff).toLocaleDateString()}
                  </p>
                  <p className="text-sm font-bold truncate">{m.home_team} vs {m.away_team}</p>
                  <p className="text-[11px] text-white/30">{m.host_city}</p>
                </button>
              ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-4 mb-6 text-sm">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Count + Sort */}
        {!isLoading && !error && (
          <div className="flex items-center justify-between mb-5">
            <p className="text-xs text-white/25">
              {offers.length} package{offers.length !== 1 ? 's' : ''} found
            </p>
            {offers.length > 1 && (
              <SortDropdown sortOrder={sortOrder} setSortOrder={setSortOrder} />
            )}
          </div>
        )}

        {/* Cards */}
        {isLoading ? (
          <div className="space-y-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : offers.length === 0 && !error ? (
          <div className="text-center py-24 text-white/15">
            <Plane className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p className="text-sm">No flights found for this route.</p>
          </div>
        ) : activeMatch ? (
          <div className="space-y-4">
            {sortedOffers.map(offer => (
              <FlightCard
                key={offer.id}
                offer={offer}
                match={activeMatch}
                onSave={handleSaveTrip}
                isSaved={savedOfferIds.has(offer.id)}
                isSaving={savingOfferId === offer.id}
              />
            ))}
          </div>
        ) : null}
      </main>

      {/* Slide-up animation for toast */}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translate(-50%, 20px); }
          to   { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </div>
  );
}