import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const location = useLocation();

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
      </ul>
    </nav>
  );
}

export default Navbar;
