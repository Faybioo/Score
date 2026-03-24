import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Card } from '../components/ui/card';
import { useAuth0 } from '@auth0/auth0-react';
import { Loader2, ShieldAlert } from 'lucide-react';

interface ScoreUser {
  'https://score-app.com/roles'?: string[];
}

export default function Admin() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth0();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        navigate('/login');
        return;
      }

      const roles = (user as ScoreUser)?.['https://score-app.com/roles'] || [];
      const isAdmin = roles.some(role => role.toLowerCase() === 'admin');

        if (!isAdmin) {
        navigate('/dashboard');
      }
    }
  }, [isLoading, isAuthenticated, user, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A1612] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A1612] text-white p-8">
      <div className="flex items-center gap-3 mb-8">
        <ShieldAlert className="h-8 w-8 text-red-500" />
        <h1 className="text-3xl font-bold">Admin Control Panel</h1>
      </div>
      
      <Card className="bg-[#122620] border-white/10 p-6">
        <p className="text-white/60">Welcome, {user?.email}. You have full access to manage matches and users.</p>
        {/* Your Admin Tools (Match Editor, User Manager, etc.) Go Here */}
      </Card>
    </div>
  );
}