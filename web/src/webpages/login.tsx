import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth0 } from '@auth0/auth0-react';
import { Trophy, Shield } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';

export default function Login() {
  const navigate = useNavigate();
  const { loginWithRedirect, isAuthenticated, isLoading } = useAuth0();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  if (isLoading) {
    return <div className="min-h-screen bg-[#0A1612] flex items-center justify-center text-yellow-500">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#0A1612] text-white flex flex-col font-sans">
      <header className="border-b border-white/10 bg-[#0A1612]/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Trophy className="h-8 w-8 text-yellow-500" />
            <span className="text-2xl font-bold tracking-tighter">Score!</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-500/10 rounded-full blur-[100px] -z-10" />

        <div className="w-full max-w-md text-center">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-3 font-serif">Welcome to Score!</h1>
            <p className="text-white/40">Securely sign in to manage your matches and profile.</p>
          </div>

          <Card className="border-white/10 bg-white/[0.03] p-6 md:p-8 backdrop-blur-sm">
            <div className="space-y-6">
              <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-4 text-sm text-yellow-500/80 flex items-start gap-3 text-left">
                <Shield className="h-5 w-5 shrink-0 mt-0.5" />
                <p>We use Auth0 for enterprise-grade security. You can sign up or sign in using the button below.</p>
              </div>

              <Button 
                onClick={() => loginWithRedirect()} 
                className="w-full bg-yellow-600 text-black font-bold h-12 hover:bg-yellow-500 transition-all active:scale-95"
              >
                Sign In / Sign Up
              </Button>

              <p className="text-xs text-white/20">
                By signing in, you agree to our Terms of Service.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}