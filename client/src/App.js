import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { AdminPage, DashboardPage, EventsPage, LandingPage, LoginPage, OrganizerPage, ProfilePage, SignupPage } from './pages';
import { AuthGate, useAuth } from './state/AuthContext';

function ProtectedRoute({ children }) {
  const { token } = useAuth();

  if (!token) {
    return <Navigate replace to="/login" />;
  }

  return children;
}

function AdminRoute({ children }) {
  const { user } = useAuth();

  if (!user || user.role !== 'Admin') {
    return <Navigate replace to="/events" />;
  }

  return children;
}

function OrganizerRoute({ children }) {
  const { user } = useAuth();

  if (!user || !['Admin', 'Organizer'].includes(user.role)) {
    return <Navigate replace to="/events" />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthGate>
        <Routes>
          <Route element={<LandingPage />} path="/" />
          <Route element={<EventsPage />} path="/events" />
          <Route element={<SignupPage />} path="/signup" />
          <Route element={<LoginPage />} path="/login" />
          <Route
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
            path="/dashboard"
          />
          <Route
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
            path="/profile"
          />
          <Route
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <AdminPage />
                </AdminRoute>
              </ProtectedRoute>
            }
            path="/admin"
          />
          <Route
            element={
              <ProtectedRoute>
                <OrganizerRoute>
                  <OrganizerPage />
                </OrganizerRoute>
              </ProtectedRoute>
            }
            path="/organizer"
          />
          <Route element={<Navigate replace to="/" />} path="*" />
        </Routes>
      </AuthGate>
    </BrowserRouter>
  );
}
