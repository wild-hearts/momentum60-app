import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './pages/Navbar';
import Landing from './pages/Landing';
import Tracker from './pages/Tracker';
import FAQ from './pages/FAQ';
import Books from './pages/Books';
import Auth from './pages/Auth';
import Team from './pages/Team';
import Insights from './pages/Insights';
import CustomRules from './pages/CustomRules';
import JourneySummary from './pages/JourneySummary';
import { useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#ec4899', fontSize: '1.5rem', fontWeight: 'bold' }}>Loading Momentum 60...</div>;
  if (!user) return <Navigate to="/auth" />;
  return children;
};

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/books" element={<Books />} />
        <Route path="/auth" element={<Auth />} />
        
        {/* Protected Routes */}
        <Route path="/app" element={<ProtectedRoute><Tracker /></ProtectedRoute>} />
        <Route path="/tracker" element={<ProtectedRoute><Tracker /></ProtectedRoute>} />
        <Route path="/team" element={<ProtectedRoute><Team /></ProtectedRoute>} />
        <Route path="/insights" element={<ProtectedRoute><Insights /></ProtectedRoute>} />
        <Route path="/rules" element={<ProtectedRoute><CustomRules /></ProtectedRoute>} />
        <Route path="/summary" element={<ProtectedRoute><JourneySummary /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
