import { getCurrentLanguage } from './i18n.js';

const TOKEN_KEY = 'subtrack-token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (!token) {
    localStorage.removeItem(TOKEN_KEY);
  } else {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

async function request(path, options = {}) {
  const headers = Object.assign({ 'Content-Type': 'application/json' }, options.headers || {});
  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  headers['Accept-Language'] = getCurrentLanguage();
  const response = await fetch(path, {
    ...options,
    headers
  });
  if (response.status === 204) {
    return {};
  }
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || data.message || 'Request failed');
    }
    return data;
  }
  if (!response.ok) {
    throw new Error('Request failed');
  }
  return response;
}

export async function register(payload) {
  return request('/api/register', { method: 'POST', body: JSON.stringify(payload) });
}

export async function login(payload) {
  return request('/api/login', { method: 'POST', body: JSON.stringify(payload) });
}

export async function logout() {
  try {
    await request('/api/logout', { method: 'POST', body: JSON.stringify({}) });
  } finally {
    setToken(null);
  }
}

export async function fetchUser() {
  const data = await request('/api/user');
  return data.user;
}

export async function updateUser(payload) {
  const data = await request('/api/user', { method: 'PATCH', body: JSON.stringify(payload) });
  return data.user;
}

export async function fetchSubscriptions() {
  const data = await request('/api/subscriptions');
  return data.subscriptions;
}

export async function createSubscription(payload) {
  const data = await request('/api/subscriptions', { method: 'POST', body: JSON.stringify(payload) });
  return data.subscription;
}

export async function updateSubscription(id, payload) {
  const data = await request(`/api/subscriptions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
  return data.subscription;
}

export async function toggleSubscription(id) {
  const data = await request(`/api/subscriptions/${id}`, { method: 'PATCH' });
  return data.subscription;
}

export async function deleteSubscription(id) {
  await request(`/api/subscriptions/${id}`, { method: 'DELETE' });
}

export async function exportSubscriptions() {
  const token = getToken();
  const headers = { Authorization: token ? `Bearer ${token}` : undefined };
  const response = await fetch('/api/subscriptions/export', { headers });
  if (!response.ok) {
    throw new Error('Failed to export');
  }
  return response;
}
