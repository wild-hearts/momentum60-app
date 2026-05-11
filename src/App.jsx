import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './pages/Navbar';
import Landing from './pages/Landing';
import Tracker from './pages/Tracker';
import FAQ from './pages/FAQ';
import Books from './pages/Books';
import Auth from './pages/Auth';
import Team from './pages/Team';
import Insights from './pages/Insights';
import CustomRules from './pages/CustomRules';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/books" element={<Books />} />
        <Route path="/app" element={<Tracker />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/team" element={<Team />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/rules" element={<CustomRules />} />
      </Routes>
    </Router>
  );
}

export default App;
