import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { fetchCurrentUser } from '../utils/api';

const AUTH_STORAGE_KEY = 'socialHubAuth';
const AVATAR_STORAGE_KEY = 'socialHubAvatars';

const AuthContext = createContext(null);

function readAuthStorage() {
  try {
    const value = window.localStorage.getItem(AUTH_STORAGE_KEY);
    return value ? JSON.parse(value) : { token: '', user: null };
  } catch (error) {
    return { token: '', user: null };
  }
}

function readAvatarStorage() {
  try {
    const value = window.localStorage.getItem(AVATAR_STORAGE_KEY);
    return value ? JSON.parse(value) : {};
  } catch (error) {
    return {};
  }
}

function mergeAvatar(user) {
  if (!user) {
    return user;
  }

  const avatars = readAvatarStorage();
  return {
    ...user,
    picture: avatars[user.email] || user.picture || '',
  };
}

export function AuthProvider({ children }) {
  const initial = readAuthStorage();
  const [token, setToken] = useState(initial.token || '');
  const [user, setUser] = useState(mergeAvatar(initial.user));
  const [loading, setLoading] = useState(Boolean(initial.token));

  useEffect(() => {
    window.localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        token,
        user,
      }),
    );
  }, [token, user]);

  useEffect(() => {
    let ignore = false;

    async function hydrateUser() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetchCurrentUser(token);
        if (!ignore) {
          setUser(mergeAvatar(response.user));
        }
      } catch (error) {
        if (!ignore) {
          setToken('');
          setUser(null);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    hydrateUser();

    return () => {
      ignore = true;
    };
  }, [token]);

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      login(nextToken, nextUser) {
        setToken(nextToken);
        setUser(mergeAvatar(nextUser));
        setLoading(false);
      },
      logout() {
        setToken('');
        setUser(null);
        setLoading(false);
      },
      updateAvatar(avatarUrl) {
        if (!user) {
          return;
        }

        const avatars = readAvatarStorage();
        avatars[user.email] = avatarUrl;
        window.localStorage.setItem(AVATAR_STORAGE_KEY, JSON.stringify(avatars));
        setUser((currentUser) => (currentUser ? { ...currentUser, picture: avatarUrl } : currentUser));
      },
      setUser,
    }),
    [loading, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function AuthGate({ children }) {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="app-shell centered-shell">
        <div className="panel soft-panel">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return children;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
