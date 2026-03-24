import { useNavigate } from 'react-router';
import { Trophy, Calendar, Plane, Search, LogOut } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { useAuth0 } from '@auth0/auth0-react';
import { useEffect } from 'react';

export default function Dashboard() {
  const navigate=useNavigate();
  const { user, getAccessTokenSilently, isAuthenticated } = useAuth0();

  useEffect(() => {
    const syncUser = async () => {
      if (isAuthenticated && user) {
        try {
          const token = await getAccessTokenSilently();
          // Inside SyncUser function in Dashboard.tsx
          await fetch('http://localhost:8080/api/user/sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              auth0_id: user.sub, 
              email: user.email,
            }),
          });
        } catch (err) {
          console.error("Failed to sync user:", err);
        }
      }
    };
    syncUser();
  }, [isAuthenticated, user, getAccessTokenSilently]);

  const stats=[{label: "Saved Trips", value: 0, icon: Calendar}, {label: "Total Destinations", value: 0, icon: Plane}, 
    {label: "Matches Planned", value: 0, icon: Trophy}
  ];
  return(
    <div className="min-h-screen bg-[#0A1612] text-white font-sans">
         <header className="border-b border-white/10 bg-[#0A1612]/80 backdrop-blur-md sticky top-0 z-50">
         <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <Trophy className="h-8 w-8 text-yellow-500" />
            <span className="text-2xl font-bold tracking-tighter">Score!</span>
          </div>

         <div className="flex items-center gap-6">
            <Button 
            onClick={() => navigate('/')}
            className='flex items-center gap-2 text-sm text-white/60 hover:text-yellow-500 transition-colors'>
                <Search className="h-4 w-4"/>
                Find Trips
            </Button>
            <Button
            className='flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors'>
                <LogOut className=' h-4 w-4'/>
                Sign Out
            </Button>
         </div>


         </div>
         </header>

         {/*Main stuff*/}
        <main className='container mx-auto px-4 py-12'>
        {/*Welcome stuff*/}
        <div className='mb-10'>
            <h1 className='text-4x1 font-bold mb-2'> Welcome back Travaler!</h1>
            <p className='text-white/40 text-sm'> Manage Your world cup travel iterneraires</p>
        </div>
        {/* Stat cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {stats.map((stat) => (
            <Card
              key={stat.label}
              className="bg-[#122620] border-white/10 p-6 flex items-center justify-between"
            >
              <div>
                <p className="text-white/40 text-xs mb-2">{stat.label}</p>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
              </div>
              <stat.icon className="h-10 w-10 text-yellow-600/60" />
            </Card>
          ))}
            </div>

        {/*Itn stuff*/}
        <div>
            <h2 className='text 2x1 font-bold mb-6'>My Itineraries</h2>
            <Card className="bg-[#122620] border-white/10 p-16 flex flex-col items-center justify-center text-center">
            <Trophy className="h-16 w-16 text-white/20 mb-6 opacity-0" />
            <h3 className="text-xl font-bold mb-2">No saved trips yet</h3>
            <p className="text-white/40 text-sm mb-8">
              Start planning your World Cup journey by searching for travel packages
            </p>
            <Button
              onClick={() => navigate('/')}
              className="bg-yellow-500/80 hover:bg-yellow-500 text-black font-bold px-12 h-12 w-full max-w-xl"
            >
              <Search className="mr-2 h-4 w-4" />
              Search Packages
            </Button>
          </Card>
        </div>
        </main>



    </div>




  )






}