import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../state/AuthContext';
import Layout from './Layout';

export default function AuthForm({ mode, submitAction }) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = mode === 'signup' ? form : { email: form.email, password: form.password };
      const response = await submitAction(payload);
      login(response.token, response.user);
      navigate('/events');
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout
      subtitle={mode === 'signup' ? 'Join the community and start exploring events.' : 'Login to discover events and manage your profile.'}
      title={mode === 'signup' ? 'Signup' : 'Login'}
    >
      <section className="auth-layout">
        <div className="panel auth-panel">
          <h2>{mode === 'signup' ? 'Create your account' : 'Welcome back'}</h2>
          <p>{mode === 'signup' ? 'Signup Page' : 'Login Page'}</p>
          <form className="auth-form" onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <label className="field">
                <span>Name</span>
                <input
                  name="name"
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Enter your name"
                  required
                  type="text"
                  value={form.name}
                />
              </label>
            )}
            <label className="field">
              <span>Email</span>
              <input
                name="email"
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                placeholder="Enter your email"
                required
                type="email"
                value={form.email}
              />
            </label>
            <label className="field">
              <span>Password</span>
              <input
                name="password"
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                placeholder="Enter your password"
                required
                type="password"
                value={form.password}
              />
            </label>
            {error && <p className="error-text">{error}</p>}
            <button className="solid-button full-width" disabled={loading} type="submit">
              {mode === 'signup' ? 'Signup' : 'Login'}
            </button>
          </form>
          <p className="helper-text">
            {mode === 'signup' ? 'Already have an account?' : 'Need an account?'}{' '}
            <Link to={mode === 'signup' ? '/login' : '/signup'}>
              {mode === 'signup' ? 'Login' : 'Signup'}
            </Link>
          </p>
        </div>
      </section>
    </Layout>
  );
}
