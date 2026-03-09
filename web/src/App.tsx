import { useState, useEffect } from 'react'
import MatchCards from './webpages/homepage'

function App() {
  const [connectionInfo, setConnectionInfo] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('http://localhost:8080/api/health')
      .then(response => {
        if (!response.ok) throw new Error('API not responding.')
        return response.json()
      })
      .then(data => setConnectionInfo(data))
      .catch(err => setError(err.message))
  }, [])

  if (error) {
    return (
      <div className="bg-[#0D1A0D] min-h-screen flex items-center justify-center">
        <p className="text-red-400 text-sm">Error: {error}</p>
      </div>
    )
  }

  if (!connectionInfo) {
    return (
      <div className="bg-[#0D1A0D] min-h-screen flex items-center justify-center">
        <p className="text-yellow-500 text-sm">Connecting...</p>
      </div>
    )
  }

  return <MatchCards />
}

export default App