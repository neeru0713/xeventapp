const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};

async function request(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      ...DEFAULT_HEADERS,
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
}

export function loginUser(payload) {
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function signupUser(payload) {
  return request('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function fetchCurrentUser(token) {
  return request('/api/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function fetchEvents(token) {
  return request('/api/events', {
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {},
  });
}

export function searchEvents(query, token) {
  const search = new URLSearchParams(query);
  return request(`/api/events?${search.toString()}`, {
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {},
  });
}

export function fetchProfile(token) {
  return request('/api/users/profile', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function fetchRegistrations(token) {
  return request('/api/registration/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function registerForEvent(eventId, token) {
  return request(`/api/registration/${eventId}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function cancelRegistration(eventId, token) {
  return request(`/api/registration/${eventId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function fetchUsers(token) {
  return request('/api/users', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function updateUserRole(userId, role, token) {
  return request(`/api/users/${userId}/role`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ role }),
  });
}

export function fetchDashboardStats(token) {
  return request('/api/users/dashboard/stats', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
