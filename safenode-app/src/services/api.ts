/**
 * api.ts — Central API service
 * All backend calls go through here.
 * Change BASE_URL to your deployed backend URL when hosting.
 */

// ── [CONFIG] Change this to your deployed backend URL ─────────
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// ── Token helpers ─────────────────────────────────────────────
export const getToken = (): string | null =>
  localStorage.getItem('token');

export const setToken = (token: string): void =>
  localStorage.setItem('token', token);

export const clearToken = (): void =>
  localStorage.removeItem('token');

// ── Base fetch wrapper ────────────────────────────────────────
const request = async (path: string, options: RequestInit = {}) => {
  const token = getToken();

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
};

// ── Auth ──────────────────────────────────────────────────────

export const apiLogin = (phone: string, password: string) =>
  request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ phone, password }),
  });

export const apiRegister = (phone: string, password: string, displayName?: string) =>
  request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ phone, password, displayName }),
  });

// Firebase OTP login — send Firebase idToken to backend for verification
// Backend verifies with Firebase Admin SDK and returns our own JWT
export const apiFirebaseLogin = (idToken: string, displayName?: string, identity?: object | null) =>
  request('/api/auth/firebase', {
    method: 'POST',
    body: JSON.stringify({ idToken, displayName, identity }),
  });

// ── Contacts ──────────────────────────────────────────────────

export const apiGetContacts = () =>
  request('/api/contacts');

export const apiAddContact = (name: string, phone: string) =>
  request('/api/contacts', {
    method: 'POST',
    body: JSON.stringify({ name, phone }),
  });

export const apiVerifyContact = (contactId: string, otp: string) =>
  request('/api/contacts/verify', {
    method: 'POST',
    body: JSON.stringify({ contactId, otp }),
  });

export const apiDeleteContact = (id: string) =>
  request(`/api/contacts/${id}`, { method: 'DELETE' });

// ── SOS ───────────────────────────────────────────────────────

export const apiTriggerSos = (lat: number, lng: number, identity?: {
  fullName?: string; age?: string; bloodGroup?: string; address?: string; note?: string;
} | null) =>
  request('/api/sos', {
    method: 'POST',
    body: JSON.stringify({ lat, lng, identity }),
  });

export const apiGetAlertStatus = (alertId: string) =>
  request(`/api/sos/${alertId}/status`);

// ── Profile ───────────────────────────────────────────────────

export const apiGetProfile = () =>
  request('/api/profile');

export const apiUpdateProfile = (displayName: string, email: string) =>
  request('/api/profile', {
    method: 'PUT',
    body: JSON.stringify({ displayName, email }),
  });

// Save identity details — stored in DB, included in every SOS alert
export const apiSaveIdentity = (identity: {
  fullName?: string; age?: string; bloodGroup?: string; address?: string; note?: string;
}) =>
  request('/api/profile/identity', {
    method: 'PUT',
    body: JSON.stringify(identity),
  });
