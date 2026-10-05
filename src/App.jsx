import React from 'react';
import {Capacitor} from '@capacitor/core';
import {Privacy,Terms,DeleteAccount} from './pages/Legal';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import InstallPWA from './components/InstallPWA';
import Navbar from './pages/Navbar';
import Landing from './pages/Landing';
import Tracker from './pages/Tracker';
import Today from './pages/Today';
import Calendar from './pages/Calendar';
import Music from './pages/Music';
import FAQ from './pages/FAQ';
import Books from './pages/Books';
import Auth from './pages/Auth';
import Insights from './pages/Insights';
import CustomRules from './pages/CustomRules';
import JourneySummary from './pages/JourneySummary';
import Settings from './pages/Settings';
import Subscribe, { SubscriptionGate } from './pages/Subscribe';
import Tools from './pages/Tools';
import InstallInstructions from './pages/InstallInstructions';
import UpdatePassword from './pages/UpdatePassword';
import { useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#E1A756', fontSize: '1.5rem', fontWeight: 'bold' }}>Loading Momentum 60...</div>;
  if (!user) return <Navigate to="/auth" />;
  return children;
};

function LegacyRoute({children}) {
  const {legacyAccess} = useAuth();
  return legacyAccess ? children : <Navigate to="/app" replace />;
}

function App() {
  return (
    <Router>
      <InstallPWA />
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/delete-account" element={<DeleteAccount />} />
        <Route path="/" element={<Landing />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/books" element={Capacitor.isNativePlatform()?<Navigate to="/app" replace/>:<Books />} />
        <Route path="/tools" element={Capacitor.isNativePlatform()?<Navigate to="/app" replace/>:<Tools />} />
        <Route path="/install" element={<InstallInstructions />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/update-password" element={<UpdatePassword />} />
        
        {/* Protected Routes */}
        <Route path="/subscribe" element={<ProtectedRoute><Subscribe /></ProtectedRoute>} />
        <Route path="/app" element={<ProtectedRoute><SubscriptionGate><Today /></SubscriptionGate></ProtectedRoute>} />
        <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
        <Route path="/music" element={<ProtectedRoute><SubscriptionGate><Music /></SubscriptionGate></ProtectedRoute>} />
        <Route path="/tracker" element={<ProtectedRoute><LegacyRoute><SubscriptionGate><Tracker /></SubscriptionGate></LegacyRoute></ProtectedRoute>} />
        <Route path="/team" element={<main className="app-container"><h1>Team Up is unavailable</h1><p>Partner sharing is paused while we improve its privacy controls. Your own progress remains available in Today.</p></main>} />
        <Route path="/insights" element={<ProtectedRoute><Insights /></ProtectedRoute>} />
        <Route path="/rules" element={<ProtectedRoute><LegacyRoute><CustomRules /></LegacyRoute></ProtectedRoute>} />
        <Route path="/summary" element={<ProtectedRoute><JourneySummary /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        
        {/* Catch-all redirect to Home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
