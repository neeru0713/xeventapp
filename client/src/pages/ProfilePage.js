import React, { useEffect, useState } from 'react';

import Layout from '../components/Layout';
import { useAuth } from '../state/AuthContext';
import { fetchProfile } from '../utils/api';

export default function ProfilePage() {
  const { token, user, updateAvatar } = useAuth();
  const [profile, setProfile] = useState(null);
  const [avatar, setAvatar] = useState(user?.picture || '');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetchProfile(token);
        setProfile(response.profile);
        setAvatar(response.profile.picture || user?.picture || '');
      } catch (loadError) {
        setError(loadError.message);
      }
    }

    loadProfile();
  }, [token, user?.picture]);

  function handleSave(event) {
    event.preventDefault();
    updateAvatar(avatar);
    setMessage('Profile updated locally');
  }

  function handleOrganizerRequest(event) {
    event.preventDefault();
    setMessage('Organizer role request captured');
  }

  return (
    <Layout subtitle="Manage your account details and keep your public profile fresh." title="Your Profile">
      <section className="profile-grid">
        <div className="panel profile-card">
          <div className="avatar-circle">{(profile?.name || user?.name || 'U').slice(0, 1).toUpperCase()}</div>
          <h2>{profile?.name || user?.name}</h2>
          <p>{profile?.role || user?.role}</p>
        </div>
        <div className="panel">
          <form className="auth-form" onSubmit={handleSave}>
            <label className="field">
              <span>Name</span>
              <input disabled name="name" readOnly type="text" value={profile?.name || user?.name || ''} />
            </label>
            <label className="field">
              <span>Email</span>
              <input disabled name="email" readOnly type="email" value={profile?.email || user?.email || ''} />
            </label>
            <label className="field">
              <span>Change Avatar</span>
              <input
                name="change avatar"
                onChange={(event) => setAvatar(event.target.value)}
                placeholder="Paste an image URL"
                type="text"
                value={avatar}
              />
            </label>
            {message && <p className="success-text">{message}</p>}
            {error && <p className="error-text">{error}</p>}
            <button className="solid-button" type="submit">
              Save Changes
            </button>
          </form>
          {user?.role === 'Participant' && (
            <form onSubmit={handleOrganizerRequest}>
              <button className="outline-button top-space" type="submit">
                Request Organizer Role
              </button>
            </form>
          )}
        </div>
      </section>
      <section className="panel">
        <h2>Registered Events</h2>
        <div className="list-grid">
          {profile?.registeredEvents?.map((event) => (
            <div className="list-card" key={event._id}>
              <h3>{event.title}</h3>
              <p>{event.location}</p>
              <p>{event.status}</p>
            </div>
          ))}
          {!profile?.registeredEvents?.length && <p>No registered events yet.</p>}
        </div>
      </section>
    </Layout>
  );
}
