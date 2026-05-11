import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">Momentum 60</Link>
      </div>
      <ul className="navbar-links">
        <li>
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link>
        </li>
        <li>
          <Link to="/faq" className={location.pathname === '/faq' ? 'active' : ''}>FAQ</Link>
        </li>
        <li>
          <Link to="/books" className={location.pathname === '/books' ? 'active' : ''}>The Books</Link>
        </li>
        {user ? (
          <>
            <li>
              <Link to="/insights" className={location.pathname === '/insights' ? 'active' : ''}>Insights</Link>
            </li>
            <li>
              <Link to="/rules" className={location.pathname === '/rules' ? 'active' : ''}>My Rules</Link>
            </li>
            <li>
              <Link to="/team" className={location.pathname === '/team' ? 'active' : ''}>Team Up</Link>
            </li>
            <li>
              <Link to="/app" className={`nav-cta ${location.pathname === '/app' ? 'active' : ''}`}>Tracker</Link>
            </li>
            <li>
              <button onClick={handleSignOut} className="nav-cta" style={{ background: 'transparent', border: '1px solid #ec4899', color: '#ec4899', cursor: 'pointer' }}>Sign Out</button>
            </li>
          </>
        ) : (
          <li>
            <Link to="/auth" className="nav-cta">Sign In</Link>
          </li>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
