/**
 * storage.ts — Shared localStorage helpers
 * Single source of truth for all persisted data.
 * Replace localStorage calls with API calls when backend is ready.
 */

export interface Contact {
  id: string;
  name: string;
  phone: string;
  verified: boolean;
}

// ── Sensor sensitivity thresholds (m/s²) ─────────────────────
export type Sensitivity = 'low' | 'medium' | 'high';

export const SENSITIVITY_THRESHOLDS = {
  fall: {
    low:    25,   // Less sensitive — fewer false positives
    medium: 20,   // Default
    high:   15,   // More sensitive — detects lighter falls
  },
  shake: {
    low:    20,
    medium: 15,   // Default
    high:   10,
  },
  motion: {
    low:    18,
    medium: 13,   // Default
    high:   8,
  },
};

export interface AppSettings {
  // Alert channels
  smsAlerts:       boolean;
  locationSharing: boolean;

  // Sensor toggles
  fallAlert:        boolean;
  shakeAlert:       boolean;
  noMovementAlert:  boolean;

  // Sensor configuration
  sensitivity:      Sensitivity;  // Low / Medium / High
  autoSosOnDetect:  boolean;       // Auto-trigger SOS when sensor fires
  sosDelay:         number;        // Countdown seconds: 5 / 10 / 15 / 30
}

const CONTACTS_KEY = 'sn_contacts';
const SETTINGS_KEY = 'sn_settings';

const DEFAULT_SETTINGS: AppSettings = {
  smsAlerts:       true,
  locationSharing: false,
  fallAlert:       false,
  shakeAlert:      true,
  noMovementAlert: false,
  sensitivity:     'medium',
  autoSosOnDetect: true,
  sosDelay:        10,
};

// ── Contacts ──────────────────────────────────────────────────

export const getContacts = (): Contact[] => {
  try { return JSON.parse(localStorage.getItem(CONTACTS_KEY) || '[]'); }
  catch { return []; }
};

export const saveContacts = (contacts: Contact[]): void =>
  localStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));

export const addContact = (name: string, phone: string): Contact => {
  const contacts = getContacts();
  const newContact: Contact = {
    id: Date.now().toString(),
    name: name.trim(),
    phone: phone.trim(),
    verified: false,
  };
  saveContacts([...contacts, newContact]);
  return newContact;
};

export const removeContact  = (id: string): void =>
  saveContacts(getContacts().filter(c => c.id !== id));

export const verifyContact  = (id: string): void =>
  saveContacts(getContacts().map(c => c.id === id ? { ...c, verified: true } : c));

// ── Settings ──────────────────────────────────────────────────

export const getSettings = (): AppSettings => {
  try { return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') }; }
  catch { return DEFAULT_SETTINGS; }
};

export const saveSettings = (settings: AppSettings): void =>
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
