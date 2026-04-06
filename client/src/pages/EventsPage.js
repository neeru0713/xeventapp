import React, { useEffect, useMemo, useState } from 'react';

import EventCard from '../components/EventCard';
import Layout from '../components/Layout';
import { useAuth } from '../state/AuthContext';
import { cancelRegistration, fetchEvents, fetchRegistrations, registerForEvent, searchEvents } from '../utils/api';

export default function EventsPage() {
  const { token, user } = useAuth();
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [filters, setFilters] = useState({ q: '' });
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');

  async function loadEvents() {
    setLoading(true);
    setError('');

    try {
      const [eventsResponse, registrationsResponse] = await Promise.all([
        fetchEvents(token),
        token ? fetchRegistrations(token) : Promise.resolve({ registrations: [] }),
      ]);

      setEvents(eventsResponse.events || []);
      setRegistrations(registrationsResponse.registrations || []);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEvents();
  }, [token]);

  const registeredIds = useMemo(
    () =>
      new Set(
        registrations
          .filter((registration) => registration.status === 'Registered' && registration.event)
          .map((registration) => registration.event._id),
      ),
    [registrations],
  );

  async function handleSearch(event) {
    event.preventDefault();
    setFeedback('');
    setError('');
    setLoading(true);

    try {
      const response = await searchEvents(filters, token);
      setEvents(response.events || []);
    } catch (searchError) {
      setError(searchError.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(eventId) {
    setBusyId(eventId);
    setFeedback('');
    setError('');

    try {
      const response = await registerForEvent(eventId, token);
      setFeedback(response.message);
      await loadEvents();
    } catch (registerError) {
      setError(registerError.message);
    } finally {
      setBusyId('');
    }
  }

  async function handleCancel(eventId) {
    setBusyId(eventId);
    setFeedback('');
    setError('');

    try {
      const response = await cancelRegistration(eventId, token);
      setFeedback(response.message);
      await loadEvents();
    } catch (cancelError) {
      setError(cancelError.message);
    } finally {
      setBusyId('');
    }
  }

  return (
    <Layout
      actions={!user ? <span className="badge">Open to everyone</span> : <span className="badge">Logged in as {user.role}</span>}
      subtitle="Explore workshops, meetups, and community gatherings curated for every kind of participant."
      title="Explore Events"
    >
      <section className="panel filter-panel">
        <form className="search-form" onSubmit={handleSearch}>
          <label className="field grow">
            <span>Search</span>
            <input
              name="search"
              onChange={(event) => setFilters({ q: event.target.value })}
              placeholder="Search events by title, location, or category"
              type="text"
              value={filters.q}
            />
          </label>
          <button className="solid-button" type="submit">
            Search
          </button>
        </form>
        {feedback && <p className="success-text">{feedback}</p>}
        {error && <p className="error-text">{error}</p>}
      </section>

      <section className="event-grid">
        {loading && <div className="panel soft-panel">Loading events...</div>}
        {!loading &&
          events.map((event) => (
            <EventCard
              busy={busyId === event._id}
              canRegister={Boolean(token && user?.role === 'Participant')}
              event={event}
              isRegistered={registeredIds.has(event._id)}
              key={event._id}
              onCancel={handleCancel}
              onRegister={handleRegister}
            />
          ))}
        {!loading && !events.length && <div className="panel soft-panel">No events found.</div>}
      </section>
    </Layout>
  );
}
