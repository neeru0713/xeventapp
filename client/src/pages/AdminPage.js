import React, { useEffect, useState } from 'react';

import Layout from '../components/Layout';
import { useAuth } from '../state/AuthContext';
import { fetchDashboardStats, fetchEvents, fetchUsers, updateUserRole } from '../utils/api';

export default function AdminPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function loadAdminData() {
    try {
      const [usersResponse, statsResponse, eventsResponse] = await Promise.all([
        fetchUsers(token),
        fetchDashboardStats(token),
        fetchEvents(token),
      ]);

      setUsers(usersResponse.users || []);
      setStats(statsResponse.stats || null);
      setEvents(eventsResponse.events || []);
    } catch (loadError) {
      setError(loadError.message);
    }
  }

  useEffect(() => {
    loadAdminData();
  }, [token]);

  async function handleApprove(event, userId) {
    event.preventDefault();

    try {
      const response = await updateUserRole(userId, 'Organizer', token);
      setMessage(response.message);
      await loadAdminData();
    } catch (submitError) {
      setError(submitError.message);
    }
  }

  async function handleReject(event, userId) {
    event.preventDefault();

    try {
      const response = await updateUserRole(userId, 'Participant', token);
      setMessage(response.message);
      await loadAdminData();
    } catch (submitError) {
      setError(submitError.message);
    }
  }

  return (
    <Layout
      subtitle="Review platform activity, approve organizer access, and monitor pending event work."
      title="Admin Dashboard"
    >
      <section className="stats-row">
        <div className="panel stat-card">
          <h3>Total Events</h3>
          <strong>{stats?.eventsCount || 0}</strong>
        </div>
        <div className="panel stat-card">
          <h3>Total Users</h3>
          <strong>{stats?.usersCount || 0}</strong>
        </div>
        <div className="panel stat-card">
          <h3>Pending Events</h3>
          <strong>{stats?.pendingEvents || 0}</strong>
        </div>
      </section>
      <section className="panel">
        <h2>Approve Organizer Requests</h2>
        {message && <p className="success-text">{message}</p>}
        {error && <p className="error-text">{error}</p>}
        <div className="table-like">
          {users.map((entry) => (
            <div className="table-row" key={entry._id}>
              <div>
                <strong>{entry.name}</strong>
                <p>{entry.email}</p>
              </div>
              <div>
                <p>{entry.role}</p>
              </div>
              <div className="row-actions">
                <form onSubmit={(event) => handleApprove(event, entry._id)}>
                  <button className="solid-button" type="submit">
                    Approve Organizer
                  </button>
                </form>
                <form onSubmit={(event) => handleReject(event, entry._id)}>
                  <button className="ghost-button" type="submit">
                    Reject Organizer
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="panel">
        <h2>Event Registrations</h2>
        <div className="list-grid">
          {events.map((event) => (
            <div className="list-card" key={event._id}>
              <h3>{event.title}</h3>
              <p>{event.location}</p>
              <p>{event.approvalStatus}</p>
              <p>Participants: {event.participantsCount || 0}</p>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
}
