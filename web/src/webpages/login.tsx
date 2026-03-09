import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Trophy, User, Shield, Mail, Lock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';

export default function Login() {
  const navigate = useNavigate();
  
  const [accountRole, setaccountRole] = useState<'fan' | 'admin'>('fan');
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (accountRole === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
  };

  return (
    <div className="min-h-screen bg-[#0A1612] text-white flex flex-col font-sans">
      {/* Header */}
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

      {/* Login Form Wrapper */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-500/10 rounded-full blur-[100px] -z-10" />

        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-3 font-serif">
              {isSignup ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="text-white/40">
              {isSignup 
                ? 'Start planning your World Cup journey' 
                : 'Sign in to access your travel plans'}
            </p>
          </div>

          <Card className="border-white/10 bg-white/[0.03] p-6 md:p-8 backdrop-blur-sm">
            {/* User Type Selection */}
            <div className="mb-6">
              <Label className="mb-3 block text-xs uppercase tracking-widest text-white/40">I am a...</Label>
              <Tabs value={accountRole} onValueChange={(v) => setaccountRole(v as 'fan' | 'admin')}>
                <TabsList className="grid w-full grid-cols-2 bg-black/40">
                  <TabsTrigger value="fan" className="gap-2">
                    <User className="h-4 w-4" />
                    Fan
                  </TabsTrigger>
                  <TabsTrigger value="admin" className="gap-2">
                    <Shield className="h-4 w-4" />
                    Admin
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {isSignup && (
                <div>
                  <Label htmlFor="name" className="text-sm">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 bg-black/20 border-white/10 text-white focus:border-yellow-500/50"
                    placeholder="Your Name"
                    required
                  />
                </div>
              )}

              <div>
                <Label htmlFor="email" className="text-sm">Email Address</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-black/20 border-white/10 text-white focus:border-yellow-500/50"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password" className="text-sm">Password</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-black/20 border-white/10 text-white focus:border-yellow-500/50"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {accountRole === 'admin' && (
                <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-3 text-xs text-yellow-500/80 flex items-center gap-3">
                  <Shield className="h-5 w-5 shrink-0" />
                  <p>Administrator access requires additional verification.</p>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-yellow-600 text-black font-bold h-12 hover:bg-yellow-500 transition-all active:scale-95"
              >
                {(isSignup ? 'Create Account' : 'Sign In')}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <button
                onClick={() => setIsSignup(!isSignup)}
                className="text-sm text-yellow-500 hover:text-yellow-400 transition-colors"
              >
                {isSignup 
                  ? 'Already have an account? Sign in' 
                  : "Don't have an account? Sign up"}
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}