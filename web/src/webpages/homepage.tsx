import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Trophy, Plane, Calendar, MapPin, Search, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { useAuth0 } from '@auth0/auth0-react';
import { useNearestAirport } from '../hooks/useNearestAirport';

interface Match {
  id: number;
  kickoff: string;
  host_city: string;
  stadium: string;
  home_team: string;
  away_team: string;
  status: string;
}

const CITY_DATA: Record<string, { country: string; code: string }> = {
  "Atlanta":             { country: "USA",    code: "ATL" },
  "Boston":              { country: "USA",    code: "BOS" },
  "Dallas":              { country: "USA",    code: "DFW" },
  "Guadalajara":         { country: "Mexico", code: "GDL" },
  "Houston":             { country: "USA",    code: "IAH" },
  "Kansas City":         { country: "USA",    code: "MCI" },
  "Los Angeles":         { country: "USA",    code: "LAX" },
  "Mexico City":         { country: "Mexico", code: "MEX" },
  "Miami":               { country: "USA",    code: "MIA" },
  "Monterrey":           { country: "Mexico", code: "MTY" },
  "New York/New Jersey": { country: "USA",    code: "NYC" },
  "Philadelphia":        { country: "USA",    code: "PHL" },
  "San Francisco":       { country: "USA",    code: "SFO" },
  "Seattle":             { country: "USA",    code: "SEA" },
  "Toronto":             { country: "Canada", code: "YYZ" },
  "Vancouver":           { country: "Canada", code: "YVR" },
};

export default function Homepage() {
  const { user, logout, isAuthenticated, isLoading: authLoading } = useAuth0();
  const navigate = useNavigate();
  const { originCode, isDetecting } = useNearestAirport();

  const [manualOrigin, setManualOrigin] = useState('');

  const [matches,       setMatches]       = useState<Match[]>([]);
  const [isLoading,     setIsLoading]     = useState(true);
  const [searchType,    setSearchType]    = useState<'match' | 'team' | 'city'>('match');
  const [selectedMatch, setSelectedMatch] = useState('');
  const [selectedTeam,  setSelectedTeam]  = useState('');
  const [selectedCity,  setSelectedCity]  = useState('');

  const roles = (user as any)?.['https://score-app.com/roles'] || [];
  const isAdmin = roles.some((role: string) => role.toLowerCase() === 'admin');

  useEffect(() => {
    if (originCode) setManualOrigin(originCode);
  }, [originCode]);

  useEffect(() => {
    fetch('http://localhost:8080/api/matches')
      .then(r => r.json())
      .then(data => setMatches(data || []))
      .catch(e => console.error('Error fetching matches:', e))
      .finally(() => setIsLoading(false));
  }, []);

  const uniqueTeams = Array.from(new Set(
    matches.flatMap(m => [m.home_team, m.away_team])
  ))
  .filter(team => team && !/^(Group|Match)/i.test(team))
  .sort();

  const uniqueCities = Array.from(new Set(matches.map(m => m.host_city))).sort();

  const buildSearchUrl = (type: string, q: string) => {
    const finalOrigin = manualOrigin.trim().toUpperCase() || originCode || 'JFK';
    return `/search?type=${type}&q=${encodeURIComponent(q)}&origin=${finalOrigin}`;
  };

  const handleSearch = () => {
    const query =
      searchType === 'match' ? selectedMatch :
      searchType === 'team'  ? selectedTeam  :
      selectedCity;

    if (!query || !manualOrigin) {
      alert("Please select a match and a departure airport.");
      return;
    }

    if (manualOrigin.length !== 3 || !/^[A-Z]{3}$/.test(manualOrigin)) {
      alert("Please enter a valid 3-letter airport code (e.g., MCO).");
      return;
    }

    navigate(buildSearchUrl(searchType, query));
  };

  const handleCityClick = (cityName: string) => {
  const origin = manualOrigin.trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(origin)) {
    alert("Please enter a valid 3-letter departure airport code first!");
    scrollToSection('hero');
    return;
  }
  navigate(buildSearchUrl('city', cityName));
};

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0A1612] text-white selection:bg-yellow-500/30 font-sans">

      {/* Header */}
      <header className="border-b border-white/10 bg-[#0A1612]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <Trophy className="h-8 w-8 text-yellow-500" />
            <span className="text-2xl font-bold tracking-tighter">Score!</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-white/60">
            <button onClick={() => scrollToSection('hero')}         className="hover:text-yellow-500 transition-colors">Home</button>
            <button onClick={() => scrollToSection('matches')}      className="hover:text-yellow-500 transition-colors">Matches</button>
            <button onClick={() => scrollToSection('destinations')} className="hover:text-yellow-500 transition-colors">Destinations</button>
          </nav>
          <div className="flex items-center gap-4">
            {!authLoading && (
              isAuthenticated ? (
                <>
                  {isAdmin && (
                    <button
                      onClick={() => navigate('/admin')}
                      className="flex items-center gap-1.5 text-sm font-bold text-red-400 hover:text-red-300 transition-colors mr-2"
                    >
                      <ShieldCheck className="h-4 w-4" />
                      Admin
                    </button>
                  )}

                  <button
                    onClick={() => navigate('/dashboard')}
                    className="text-sm font-medium text-white/60 hover:text-yellow-500 transition-colors mr-2"
                  >
                    Dashboard
                  </button>
                  <Button
                    variant="outline"
                    className="border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-500"
                    onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 hover:text-yellow-500"
                  onClick={() => navigate('/login')}
                >
                  Sign In
                </Button>
              )
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section id="hero" className="py-20 md:py-32 px-4 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-500/10 via-transparent to-transparent -z-10" />
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 font-serif leading-tight">
            Your Journey to <span className="text-yellow-500 italic">Glory</span> Starts Here
          </h1>
          <p className="text-lg md:text-xl text-white/50 mb-12 max-w-2xl mx-auto">
            Book flights and hotels for the 2026 FIFA World Cup. Follow your team across North America.
          </p>

          {/* Search and Origin */}
          <div className="mb-6 space-y-2">
            <div className="flex justify-between items-end px-1">
              <Label className="text-white/40 text-[10px] uppercase tracking-widest font-bold">
                Flying From
              </Label>
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${isDetecting ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
                <span className="text-[10px] text-white/25">
                  {isDetecting ? 'Locating...' : 'Auto-detected'}
                </span>
              </div>
            </div>
            <div className="relative group">
              <Plane className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-yellow-500 transition-colors group-focus-within:text-yellow-400" />
              <input 
                type="text"
                value={manualOrigin}
                onChange={(e) => setManualOrigin(e.target.value.toUpperCase())}
                placeholder="Airport Code (e.g. GNV)"
                maxLength={3}
                className="w-full bg-[#1A3A2E]/40 border border-white/10 rounded-xl h-14 pl-12 pr-4 text-white font-mono text-lg focus:border-yellow-500/50 outline-none transition-all placeholder:text-white/10"
              />
              {manualOrigin !== originCode && (
                <button 
                  onClick={() => setManualOrigin(originCode)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-yellow-500 hover:text-yellow-400 transition-colors"
                >
                  RESET
                </button>
              )}
            </div>
          </div>

          <div className="max-/w-2xl mx-auto bg-[#122620] border border-white/10 p-6 md:p-8 rounded-3xl shadow-2xl backdrop-blur-sm text-left">
            <Tabs value={searchType} onValueChange={(v) => setSearchType(v as 'match' | 'team' | 'city')}>
              <TabsList className="grid w-full grid-cols-3 mb-8 bg-[#1A3A2E] p-1 rounded-xl">
                <TabsTrigger value="match">Match</TabsTrigger>
                <TabsTrigger value="team">Team</TabsTrigger>
                <TabsTrigger value="city">City</TabsTrigger>
              </TabsList>

              <TabsContent value="match" className="space-y-4">
                <Label className="text-white/40 text-xs uppercase tracking-widest ml-1">Select</Label>
                <Select value={selectedMatch} onValueChange={setSelectedMatch}>
                  <SelectTrigger className="bg-[#1A3A2E]/30 border-white/10 h-12">
                    <SelectValue placeholder={isLoading ? "Loading..." : "Choose a match..."} />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A3A2E] border-white/10 text-white max-h-60 overflow-y-auto">
                    {matches.map((m) => (
                      <SelectItem key={m.id} value={m.id.toString()}>
                        {m.home_team} vs {m.away_team} — {m.host_city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TabsContent>

              <TabsContent value="team" className="space-y-4">
                <Label className="text-white/40 text-xs uppercase tracking-widest ml-1">Follow Your Country</Label>
                <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                  <SelectTrigger className="bg-[#1A3A2E]/30 border-white/10 h-12">
                    <SelectValue placeholder="Select a country..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A3A2E] border-white/10 text-white max-h-60 overflow-y-auto">
                    {uniqueTeams.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TabsContent>

              <TabsContent value="city" className="space-y-4">
                <Label className="text-white/40 text-xs uppercase tracking-widest ml-1">Destination</Label>
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger className="bg-[#1A3A2E]/30 border-white/10 h-12">
                    <SelectValue placeholder="Select host city..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A3A2E] border-white/10 text-white max-h-60 overflow-y-auto">
                    {uniqueCities.map((cityName) => (
                      <SelectItem key={cityName} value={cityName}>{cityName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TabsContent>
            </Tabs>

            <Button
              onClick={handleSearch}
              disabled={isDetecting}
              className="w-full mt-8 bg-yellow-600 hover:bg-yellow-500 text-black font-bold h-14 text-lg rounded-xl shadow-lg shadow-yellow-600/20 disabled:opacity-50"
            >
              <Search className="mr-2 h-5 w-5" />
              Search Travel Packages
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Matches */}
      <section id="matches" className="py-24 bg-black/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 font-serif">Featured Matches</h2>
            <p className="text-white/40">Secure your travel before the crowds arrive.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 max-w-7xl mx-auto">
            {isLoading ? (
              <div className="col-span-full flex justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
              </div>
            ) : matches.slice(0, 72).map((match) => (
              <Card key={match.id} className="bg-[#122620] border-white/10 p-4 hover:border-yellow-600/40 transition-all group flex flex-col justify-between">
                <div>
                  <Badge className="bg-yellow-600/20 text-yellow-500 border-none mb-3 uppercase text-[9px] tracking-tighter">
                    {match.status}
                  </Badge>
                  <div className="mb-3">
                    <p className="text-sm font-bold text-white leading-tight">{match.home_team}</p>
                    <p className="text-yellow-500 font-black text-xs my-1">VS</p>
                    <p className="text-sm font-bold text-white leading-tight">{match.away_team}</p>
                  </div>
                  <div className="space-y-1 text-[11px] text-white/40">
                    <p className="flex items-center gap-1"><MapPin className="h-3 w-3 shrink-0" /> {match.host_city}</p>
                    <p className="flex items-center gap-1"><Calendar className="h-3 w-3 shrink-0" /> {new Date(match.kickoff).toLocaleDateString()}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="mt-4 w-full bg-yellow-600 text-black font-bold hover:bg-yellow-500 text-xs h-8"
                  onClick={() => {
                      const origin = manualOrigin.trim().toUpperCase();
                      if (!/^[A-Z]{3}$/.test(origin)) {
                        alert("Please enter a valid departure airport code above!");
                        scrollToSection('hero');
                        return;
                      }
                      navigate(buildSearchUrl('match', match.id.toString()));
                    }}            
                  >
                  Book Now <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Host Cities */}
      <section id="destinations" className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 font-serif">Host Cities</h2>
            <p className="text-white/40">Explore the amazing cities hosting the 2026 World Cup.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {uniqueCities.map((cityName) => {
              const info = CITY_DATA[cityName] || { country: "Host Nation", code: cityName.substring(0, 3).toUpperCase() };
              return (
                <Card
                  key={cityName}
                  className="overflow-hidden bg-[#122620] border-white/10 hover:border-yellow-600/50 transition-all cursor-pointer group"
                  onClick={() => handleCityClick(cityName)}
                >
                  <div className="h-40 bg-gradient-to-br from-yellow-600/20 to-transparent flex items-center justify-center relative">
                    <MapPin className="h-10 w-10 text-yellow-500/50 group-hover:scale-110 transition-transform" />
                    <span className="absolute bottom-4 right-4 text-white/20 font-black text-4xl">{info.code}</span>
                  </div>
                  <div className="p-6 text-white">
                    <h3 className="text-xl font-bold mb-1 group-hover:text-yellow-500 transition-colors">{cityName}</h3>
                    <p className="text-white/40 text-sm mb-4">{info.country}</p>
                    <div className="flex items-center justify-between text-xs text-yellow-500">
                      <span>View Packages</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Book With Score */}
      <section className="py-24 border-t border-white/5 bg-black/10">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16 font-serif">Why Book with Score?</h2>
          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto text-center">
            {[
              { icon: Plane,  title: "Best Flight Deals",  desc: "Compare prices from top airlines and find the perfect flight to match day" },
              { icon: MapPin, title: "Prime Locations",    desc: "Hotels near stadiums and fan zones across all host cities" },
              { icon: Trophy, title: "Follow Your Team",   desc: "Track your favorite team's journey through the tournament" },
            ].map((f, i) => (
              <div key={i} className="space-y-4 group">
                <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto text-yellow-500 group-hover:bg-yellow-500 group-hover:text-black transition-all">
                  <f.icon className="h-8 w-8" />
                </div>
                <h3 className="font-bold text-xl">{f.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}