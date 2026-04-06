import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';

import { useAuth } from '../state/AuthContext';

export default function Layout({ children, title, subtitle, actions }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/events');
  }

  return (
    <div className="app-shell">
      <header className="top-bar">
        <nav className="nav-card">
          <Link className="brand-link" to="/events">
            The Social Hub
          </Link>
          <div className="nav-actions">
            {!user && (
              <>
                <NavLink className="nav-link" to="/login">
                  Login
                </NavLink>
                <NavLink className="nav-link primary-link" to="/signup">
                  Signup
                </NavLink>
              </>
            )}
            {user && (
              <>
                <NavLink className="nav-link" to="/dashboard">
                  Dashboard
                </NavLink>
                <NavLink className="nav-link" to="/profile">
                  Profile
                </NavLink>
                {user.role === 'Admin' && (
                  <>
                    <NavLink className="nav-link" to="/admin">
                      Admin
                    </NavLink>
                    <NavLink className="nav-link" to="/organizer">
                      Organizer
                    </NavLink>
                  </>
                )}
                {user.role === 'Organizer' && (
                  <NavLink className="nav-link" to="/organizer">
                    Organizer
                  </NavLink>
                )}
                <button className="nav-link nav-button" onClick={handleLogout} type="submit">
                  Logout
                </button>
              </>
            )}
          </div>
        </nav>
      </header>
      <main className="content-wrap">
        {(title || subtitle || actions) && (
          <section className="hero-card">
            <div>
              {title && <h1>{title}</h1>}
              {subtitle && <p>{subtitle}</p>}
            </div>
            {actions && <div className="hero-actions">{actions}</div>}
          </section>
        )}
        {children}
      </main>
    </div>
  );
}
