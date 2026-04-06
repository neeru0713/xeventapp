import React from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="landing-shell">
      <section className="landing-card">
        <p className="eyebrow">Community Events Platform</p>
        <h1>Welcome to The Social Hub</h1>
        <p>
          Discover experiences, connect with communities, and stay close to the events that matter to you.
        </p>
        <div className="landing-actions">
          <Link className="solid-link" to="/events">
            Explore Events
          </Link>
        </div>
      </section>
    </div>
  );
}
