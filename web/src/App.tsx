import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [connectionInfo, setConnectionInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  //send request for api diagnostic route
  useEffect(() => {
    fetch('http://localhost:8080/api/health')
    .then(response => {
      if (!response.ok) throw new Error('API not responding.');
      return response.json();
    })
    .then(data => setConnectionInfo(data))
    .catch(err => setError(err.message));
  }, []);

  return (
    <div className='App'>
      <h1>Score</h1>
      <div>
        {error ? (
          <p style={{color:'red'}}>Error: {error}</p>
        ) : connectionInfo ? (
          <div>
            <p>Connected to API successfully.</p>
            <p>Database Time: {new Date(connectionInfo.db_time).toLocaleString()}</p>
          </div>
        ) : (
          <p>Connecting...</p>
        )}
      </div>
    </div>
  )
}

export default App
