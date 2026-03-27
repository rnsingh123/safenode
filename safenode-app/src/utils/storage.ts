/**
 * storage.ts — Shared localStorage helpers
 * Centralises all persistence so future backend swap is easy.
 * Replace localStorage calls here with API calls when backend is ready.
 */

export interface Contact {
  id: string;
  name: string;
  phone: string;
  verified: boolean; // OTP verified — future: backend verification
}

export interface AppSettings {
  smsAlerts: boolean;
  locationSharing: boolean;
  fallAlert: boolean;
  shakeAlert: boolean;
  noMovementAlert: boolean;
}

const CONTACTS_KEY = 'sn_contacts';
const SETTINGS_KEY = 'sn_settings';

// ── Contacts ──────────────────────────────────────────────────

export const getContacts = (): Contact[] => {
  try {
    return JSON.parse(localStorage.getItem(CONTACTS_KEY) || '[]');
  } catch { return []; }
};

export const saveContacts = (contacts: Contact[]): void => {
  localStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));
};

export const addContact = (name: string, phone: string): Contact => {
  const contacts = getContacts();
  const newContact: Contact = {
    id: Date.now().toString(),
    name: name.trim(),
    phone: phone.trim(),
    verified: false, // Requires OTP verification
  };
  saveContacts([...contacts, newContact]);
  return newContact;
};

export const removeContact = (id: string): void => {
  saveContacts(getContacts().filter(c => c.id !== id));
};

export const verifyContact = (id: string): void => {
  saveContacts(getContacts().map(c => c.id === id ? { ...c, verified: true } : c));
};

// ── Settings ──────────────────────────────────────────────────

const DEFAULT_SETTINGS: AppSettings = {
  smsAlerts: true,
  locationSharing: false,
  fallAlert: false,
  shakeAlert: true,
  noMovementAlert: false,
};

export const getSettings = (): AppSettings => {
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') };
  } catch { return DEFAULT_SETTINGS; }
};

export const saveSettings = (settings: AppSettings): void => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};
