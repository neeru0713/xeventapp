import React, { useEffect, useMemo, useState } from 'react';

import Layout from '../components/Layout';
import { useAuth } from '../state/AuthContext';
import { fetchEvents, fetchRegistrations } from '../utils/api';

export default function OrganizerPage() {
  const { token, user } = useAuth();
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadOrganizerData() {
      try {
        const [eventsResponse, registrationsResponse] = await Promise.all([
          fetchEvents(token),
          fetchRegistrations(token).catch(() => ({ registrations: [] })),
        ]);

        setEvents(eventsResponse.events || []);
        setRegistrations(registrationsResponse.registrations || []);
      } catch (loadError) {
        setError(loadError.message);
      }
    }

    loadOrganizerData();
  }, [token]);

  const ownedEvents = useMemo(() => {
    if (user?.role === 'Admin') {
      return events;
    }

    return events.filter((event) => event.organizer?._id === user?._id);
  }, [events, user?._id, user?.role]);

  return (
    <Layout
      subtitle="Review the events you manage and keep an eye on participant activity."
      title="Organizer Dashboard"
    >
      {error && <p className="error-text">{error}</p>}
      <section className="panel">
        <h2>View Event Registrations</h2>
        <div className="list-grid">
          {registrations.map((registration) => (
            <div className="list-card" key={registration._id}>
              <h3>{registration.event?.title || 'Event'}</h3>
              <p>{registration.status}</p>
              <p>{registration.event?.location || 'Location'}</p>
            </div>
          ))}
          {!registrations.length && <p>No registrations available for this account.</p>}
        </div>
      </section>
      <section className="panel">
        <h2>Your Organized Events</h2>
        <div className="list-grid">
          {ownedEvents.map((event) => (
            <div className="list-card" key={event._id}>
              <h3>{event.title}</h3>
              <p>{event.location}</p>
              <p>{event.status}</p>
              <p>{event.approvalStatus}</p>
            </div>
          ))}
          {!ownedEvents.length && <p>No organized events found.</p>}
        </div>
      </section>
    </Layout>
  );
}
