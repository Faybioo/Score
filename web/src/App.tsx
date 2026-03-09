import { useState, useEffect } from 'react';
import { RouterProvider } from 'react-router';
import { Toaster } from './components/ui/sonner';
import { router } from './routes';

export default function App() {
  const [isApiReady, setIsApiReady] = useState(false);

  useEffect(() => {
    // Check if Docker API is alive
    fetch('http://localhost:8080/api/health')
      .then(res => {
        if (res.ok) setIsApiReady(true);
      })
      .catch(() => console.log("Waiting for Docker backend..."));
  }, []);

  if (!isApiReady) {
    return (
      <div className="dark min-h-screen bg-[#0A1612] flex items-center justify-center">
        <div className="text-center">
          <p className="text-yellow-500 text-sm animate-pulse mb-2">Connecting to Score! Engine...</p>
          <p className="text-white/20 text-xs">Ensure Docker Desktop is running</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dark size-full">
      <RouterProvider router={router} />
      <Toaster />
    </div>
  );
}