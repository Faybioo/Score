import { useState, useEffect } from 'react';
import { RouterProvider } from 'react-router';
import { Toaster } from './components/ui/sonner';
import { Auth0Provider } from '@auth0/auth0-react';
import { router } from './routes';

// @ts-expect-error - Vite injects 'env' into import.meta at runtime, which is not part of the standard TypeScript ImportMeta interface.
const domain = import.meta.env.VITE_AUTH0_DOMAIN;

// @ts-expect-error - The VITE_AUTH0_CLIENT_ID property is defined in the external .env file and populated during the Vite build process.
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;

// @ts-expect-error - TypeScript is unaware of the custom 'env' property on import.meta without a dedicated vite-env.d.ts declaration file.
const audience = import.meta.env.VITE_AUTH0_AUDIENCE;

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
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: audience, 
      }}
    >
      <div className="dark size-full">
        <RouterProvider router={router} />
        <Toaster />
      </div>
    </Auth0Provider>
  );
}