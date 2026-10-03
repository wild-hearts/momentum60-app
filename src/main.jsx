import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { hasServiceConfiguration } from './supabaseClient'
import { AuthProvider } from './context/AuthContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {hasServiceConfiguration ? <AuthProvider>
      <App />
    </AuthProvider> : <main style={{padding:40}}><h1>Momentum 60</h1><p>This development build is not connected to its account service yet.</p><p>Your existing account and data have not been changed.</p></main>}
  </StrictMode>,
)
