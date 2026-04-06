import React, { useEffect, useState } from 'react';

import Layout from '../components/Layout';
import { useAuth } from '../state/AuthContext';
import { fetchRegistrations } from '../utils/api';

export default function DashboardPage() {
  const { token, user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDashboard() {
      try {
        const response = await fetchRegistrations(token);
        setRegistrations(response.registrations || []);
      } catch (loadError) {
        setError(loadError.message);
      }
    }

    loadDashboard();
  }, [token]);

  return (
    <Layout
      subtitle="Track your activity and keep an eye on the events you have joined."
      title={`Welcome ${user?.name || ''}`}
    >
      <section className="stats-row">
        <div className="panel stat-card">
          <h3>Your Registered Events</h3>
          <strong>{registrations.filter((item) => item.status === 'Registered').length}</strong>
        </div>
        <div className="panel stat-card">
          <h3>Cancelled Registrations</h3>
          <strong>{registrations.filter((item) => item.status === 'Cancelled').length}</strong>
        </div>
      </section>
      <section className="panel">
        <h2>Your Registered Events</h2>
        {error && <p className="error-text">{error}</p>}
        <div className="list-grid">
          {registrations
            .filter((item) => item.event)
            .map((item) => (
              <div className="list-card" key={item._id}>
                <h3>{item.event.title}</h3>
                <p>{item.event.location}</p>
                <p>{item.event.status}</p>
                <p>{item.status}</p>
              </div>
            ))}
          {!registrations.length && <p>No registrations yet.</p>}
        </div>
      </section>
    </Layout>
  );
}
