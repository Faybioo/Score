import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useAuth0 } from '@auth0/auth0-react';
import { 
  Loader2, ShieldAlert, Edit, Trash2, 
  Plus, Users, Trophy, Activity, type LucideIcon
} from 'lucide-react';

interface Match {
  id: number;
  home_team: string;
  away_team: string;
  host_city: string;
  stadium: string;
  kickoff: string;
  status: string;
}

interface ScoreUser {
  'https://score-app.com/roles'?: string[];
}

export default function Admin() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();
  const [matches, setMatches] = useState<Match[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [userCount, setUserCount] = useState<number | string>('--');

  // Security Gate
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        navigate('/login');
        return;
      }
      const roles = (user as ScoreUser)?.['https://score-app.com/roles'] || [];
      const isAdmin = roles.some(role => role.toLowerCase() === 'admin');
      if (!isAdmin) navigate('/dashboard');
    }
  }, [isLoading, isAuthenticated, user, navigate]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = await getAccessTokenSilently();
        const response = await fetch('http://localhost:8080/api/admin/user-count', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        setUserCount(data.count);
      } catch (err) {
        console.error("Failed to fetch user count:", err);
      }
    };
    
    if (isAuthenticated) fetchStats();
  }, [getAccessTokenSilently, isAuthenticated]);

  // Fetch Matches for Management
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/matches');
        const data = await response.json();
        setMatches(data);
      } catch (err) {
        console.error("Failed to load matches", err);
      } finally {
        setIsDataLoading(false);
      }
    };
    fetchMatches();
  }, []);

  const handleDeleteMatch = async (id: number) => {
    if (!window.confirm("Are you sure you want to remove this match?")) return;
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(`http://localhost:8080/api/matches/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        setMatches(matches.filter(m => m.id !== id));
      } else {
        const error = await response.text();
        console.error("Failed to delete match:", error);
        alert("Failed to delete match");
      }
    } catch (err) {
      console.error("Error deleting match:", err);
      alert("Error deleting match");
    }
  };

  const handleEditMatch = (match: Match) => {
    setEditingMatch({ ...match });
  };

  const handleSaveMatch = async () => {
    if (!editingMatch) return;
    try {
        const token = await getAccessTokenSilently({
          authorizationParams: {
            audience: 'https://score-loginapi.com',
          }
        });
        const response = await fetch(`http://localhost:8080/api/matches/${editingMatch.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          home_team: editingMatch.home_team,
          away_team: editingMatch.away_team,
          host_city: editingMatch.host_city,
          stadium: editingMatch.stadium,
          kickoff: editingMatch.kickoff,
          status: editingMatch.status
        })
      });
      
      if (response.ok) {
        const updatedMatch = await response.json();
        setMatches(matches.map(m => m.id === updatedMatch.id ? updatedMatch : m));
        setEditingMatch(null);
      } else {
        const error = await response.text();
        console.error("Failed to update match:", error);
        alert("Failed to update match");
      }
    } catch (err) {
      console.error("Error updating match:", err);
      alert("Error updating match");
    }
  };

  if (isLoading || isDataLoading) {
    return (
      <div className="min-h-screen bg-[#0A1612] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A1612] text-white font-sans relative">
      <header className="border-b border-white/10 bg-[#0A1612]/80 backdrop-blur-md p-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <ShieldAlert className="h-8 w-8 text-red-500" />
            <h1 className="text-3xl font-bold tracking-tighter">Admin Panel</h1>
          </div>
          <Button onClick={() => navigate('/dashboard')} variant="outline" className="border-white/20">
            Exit to Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto p-8">
        {/* Global System Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard label="Total Matches" value={matches?.length || 0} icon={Trophy} />
          <StatCard label="Registered Users" value={userCount} icon={Users} />
          <StatCard label="API Status" value="Healthy" icon={Activity} />
        </div>

        {/* Match Manager Section */}
        <Card className="bg-[#122620] border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10 flex justify-between items-center">
            <h2 className="text-xl font-bold">Match Schedule Manager</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-black/20 text-white/40 text-xs uppercase tracking-widest">
                <tr>
                  <th className="p-4">Matchup</th>
                  <th className="p-4">Venue</th>
                  <th className="p-4">Kickoff</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {matches.map((match) => (
                  <tr key={match.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-bold">{match.home_team} vs {match.away_team}</td>
                    <td className="p-4 text-sm text-white/60">{match.stadium}, {match.host_city}</td>
                    <td className="p-4 text-sm">{new Date(match.kickoff).toLocaleDateString()}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded-full text-[10px] bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 uppercase">
                        {match.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="hover:text-yellow-500"
                          onClick={() => handleEditMatch(match)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="hover:text-red-500"
                          onClick={() => handleDeleteMatch(match.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </main>

      {/* --- EDIT MODAL --- */}
      {editingMatch && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <Card className="bg-[#122620] border-white/20 p-8 w-full max-w-lg shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Edit className="h-5 w-5 text-yellow-500" />
              Edit Match Details
            </h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-white/40 font-bold">Home Team</label>
                  <input 
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-sm focus:border-yellow-500 outline-none"
                    value={editingMatch.home_team}
                    onChange={e => setEditingMatch({...editingMatch, home_team: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-white/40 font-bold">Away Team</label>
                  <input 
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-sm focus:border-yellow-500 outline-none"
                    value={editingMatch.away_team}
                    onChange={e => setEditingMatch({...editingMatch, away_team: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase text-white/40 font-bold">Status</label>
                <select 
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-sm focus:border-yellow-500 outline-none text-white"
                  value={editingMatch.status}
                  onChange={e => setEditingMatch({...editingMatch, status: e.target.value})}
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="live">Live</option>
                  <option value="finished">Finished</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="pt-6 flex gap-3">
                <Button 
                  onClick={handleSaveMatch}
                  className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-black font-bold"
                >
                  Save Changes
                </Button>
                <Button 
                  onClick={() => setEditingMatch(null)}
                  variant="ghost" 
                  className="flex-1 border border-white/10 hover:bg-white/5"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number; 
  icon: LucideIcon;
}

function StatCard({ label, value, icon: Icon }: StatCardProps) {
  return (
    <Card className="bg-[#122620] border-white/10 p-6 flex items-center justify-between">
      <div>
        <p className="text-white/40 text-xs mb-1 uppercase tracking-widest">{label}</p>
        <p className="text-3xl font-bold">{value}</p>
      </div>
      <Icon className="h-10 w-10 text-yellow-600/40" />
    </Card>
  );
}