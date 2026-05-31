/**
 * Dashboard.tsx — 3-tab app shell
 * Logic: unchanged. UI: redesigned.
 * ── EDIT GUIDE ──────────────────────────────────────────────
 *  Global colors/spacing → src/theme/variables.css
 *  Header band           → .sn-header-band
 *  Card style            → .sn-card
 *  Toggle rows           → .sn-toggle-row / .sn-icon-wrap
 *  Tab bar               → IonTabBar at bottom of return
 * ────────────────────────────────────────────────────────────
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  IonPage, IonContent, IonHeader, IonToolbar, IonTitle,
  IonTabBar, IonTabButton, IonIcon, IonLabel,
  IonToggle, IonList, IonItem, IonAlert, IonButton, IonText,
  IonSelect, IonSelectOption, IonModal, IonButtons
} from '@ionic/react';
import {
  homeOutline, personOutline, settingsOutline,
  shieldCheckmarkOutline, locationOutline, pencilOutline,
  logOutOutline, callOutline, mailOutline,
  bodyOutline, phonePortraitOutline, timeOutline,
  checkmarkCircleOutline, wifiOutline, navigateOutline,
  peopleOutline, closeOutline, chatbubbleOutline
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import SosButton, { SosButtonHandle } from '../components/sos/SosButton';
import ContactsManager from '../components/contacts/ContactsManager';
import { getSettings, saveSettings, AppSettings, Sensitivity } from '../utils/storage';
import { sensorService } from '../services/sensorService';
import { getUserIdentity, saveUserIdentity } from '../pages/Register';

/* ── [STYLE AREA] ── */
const styles = `
  .sn-page { background: var(--clr-bg); }

  /* Card */
  .sn-card {
    background: var(--clr-surface);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
    border: 1px solid var(--clr-primary-border);
    margin: 0 0 var(--space-md);
    overflow: hidden;
    transition: box-shadow var(--transition-fast);
  }

  /* Header band */
  .sn-header-band {
    background: linear-gradient(135deg, var(--clr-primary) 0%, var(--clr-primary-light) 100%);
    padding: var(--space-xl) var(--space-md) var(--space-lg);
    color: white;
  }

  /* Section label */
  .sn-section-label {
    font-size: var(--font-xs); font-weight: 800;
    color: var(--clr-primary-muted);
    text-transform: uppercase; letter-spacing: 1.2px;
    padding: var(--space-lg) 0 var(--space-sm);
  }

  /* Toggle row */
  .sn-toggle-row {
    display: flex; align-items: center;
    padding: var(--space-md) 0;
    border-bottom: 1px solid var(--clr-primary-tint);
    transition: background var(--transition-fast);
  }
  .sn-toggle-row:last-child { border-bottom: none; }

  /* Toggle row text — prevent overflow */
  .sn-toggle-row > div[style*="flex: 1"] {
    min-width: 0;
    overflow: hidden;
  }
  .sn-toggle-row p {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Icon wrap */
  .sn-icon-wrap {
    width: 44px; height: 44px; border-radius: var(--radius-sm);
    display: flex; align-items: center; justify-content: center;
    margin-right: var(--space-md); flex-shrink: 0;
    transition: transform var(--transition-fast);
  }

  /* Profile avatar */
  .sn-avatar {
    width: 84px; height: 84px; border-radius: 50%;
    background: rgba(255,255,255,0.22);
    border: 3px solid rgba(255,255,255,0.5);
    display: flex; align-items: center; justify-content: center;
    font-size: 34px; font-weight: 900; color: white;
    margin: 0 auto var(--space-sm);
    box-shadow: 0 4px 20px rgba(0,0,0,0.18);
  }

  /* Tab bar */
  ion-tab-button {
    --color: var(--clr-text-muted);
    --color-selected: var(--clr-primary);
    font-size: var(--font-xs);
    font-weight: 700;
  }

  /* Tab fade animation */
  @keyframes tabFade {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .tab-content { animation: tabFade var(--transition-normal) both; }

  /* Inline edit inputs */
  .sn-edit-input {
    flex: 1; padding: 8px 12px;
    border-radius: var(--radius-sm);
    border: 2px solid var(--clr-primary-border);
    font-size: var(--font-md); font-weight: 700;
    outline: none; background: #ffffff; color: #1b2e1c;
    transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
  }
  .sn-edit-input:focus {
    border-color: var(--clr-primary);
    box-shadow: var(--focus-ring);
  }
  .sn-edit-confirm {
    background: var(--clr-primary); border: none;
    border-radius: var(--radius-sm); padding: 8px 14px;
    color: white; cursor: pointer; font-weight: 700;
    transition: opacity var(--transition-fast);
  }
  .sn-edit-cancel {
    background: #eeeeee; border: none;
    border-radius: var(--radius-sm); padding: 8px 12px;
    cursor: pointer; color: #333;
    transition: background var(--transition-fast);
  }
  .sn-edit-cancel:active { background: #dddddd; }
`;

interface UserProfile { username: string; contact: string; email: string; displayName: string; }

const Dashboard: React.FC = () => {
  const history      = useHistory();
  const sosRef       = useRef<SosButtonHandle>(null); // ref to trigger SOS from sensors

  const [activeTab, setActiveTab]         = useState<'home' | 'settings' | 'profile'>('home');
  const [userProfile, setUserProfile]     = useState<UserProfile>({ username: '', contact: '', email: '', displayName: '' });
  const [editingName, setEditingName]     = useState(false);
  const [tempName, setTempName]           = useState('');
  const [editingEmail, setEditingEmail]   = useState(false);
  const [tempEmail, setTempEmail]         = useState('');
  const [editingPhone, setEditingPhone]   = useState(false);
  const [tempPhone, setTempPhone]         = useState('');

  // SOS Identity — loaded from localStorage (set in Register.tsx)
  const [identity, setIdentity]           = useState(() => getUserIdentity() || { fullName: '', age: '', bloodGroup: '', address: '', note: '' });
  const [editingIdentity, setEditingIdentity] = useState(false);
  const [tempIdentity, setTempIdentity]   = useState(identity);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [settings, setSettings]           = useState<AppSettings>(getSettings());
  const [saveMsg, setSaveMsg]             = useState('');
  const [showContactsModal, setShowContactsModal] = useState(false);

  /* ── [AUTH GUARD] ── */
  useEffect(() => {
    const stored = sessionStorage.getItem('user');
    if (!stored) { history.replace('/login'); return; }
    setUserProfile(JSON.parse(stored));
  }, [history]);

  /* ── [SENSOR WIRING] ─────────────────────────────────────────
     Start sensor monitoring when any sensor toggle is ON.
     When a sensor fires, call sosRef.current.triggerFromSensor()
     which starts the countdown in SosButton.
  ── */
  useEffect(() => {
    const s = getSettings();
    const anySensorOn = s.fallAlert || s.shakeAlert || s.noMovementAlert;

    if (anySensorOn) {
      sensorService.start((event) => {
        sosRef.current?.triggerFromSensor(event);
      });
    } else {
      sensorService.stop();
    }

    return () => { sensorService.stop(); };
  }, [settings.fallAlert, settings.shakeAlert, settings.noMovementAlert]);

  const updateSetting = (key: keyof AppSettings, value: boolean | string | number) => {
    const updated = { ...settings, [key]: value } as AppSettings;
    setSettings(updated); saveSettings(updated);
  };

  const saveDisplayName = () => {
    if (tempName.trim()) {
      const updated = { ...userProfile, displayName: tempName.trim() };
      setUserProfile(updated);
      sessionStorage.setItem('user', JSON.stringify(updated));
    }
    setEditingName(false);
  };

  const saveEmail = () => {
    if (tempEmail.trim()) {
      const updated = { ...userProfile, email: tempEmail.trim() };
      setUserProfile(updated);
      sessionStorage.setItem('user', JSON.stringify(updated));
    }
    setEditingEmail(false);
  };

  const savePhone = () => {
    if (tempPhone.trim()) {
      const updated = { ...userProfile, contact: tempPhone.trim() };
      setUserProfile(updated);
      sessionStorage.setItem('user', JSON.stringify(updated));
    }
    setEditingPhone(false);
  };

  const saveIdentity = () => {
    // Save to localStorage immediately (works offline)
    saveUserIdentity(tempIdentity);
    setIdentity(tempIdentity);
    setEditingIdentity(false);

    // TODO: when backend is connected, also sync to server:
    // apiSaveIdentity(tempIdentity).catch(err => console.warn('[Profile] Backend sync failed:', err.message));
  };

  const handleLogout = () => { sessionStorage.removeItem('user'); history.replace('/login'); };

  /* ══════════════════════════════════════════════════════════
     TAB 1 — HOME
  ══════════════════════════════════════════════════════════ */
  const renderHome = () => (
    <IonContent className="sn-page">
      {/* ── Header ── */}
      <div className="sn-header-band">
        <p style={{ margin: 0, fontSize: 'var(--font-sm)', opacity: 0.8 }}>Hello,</p>
        <h2 style={{ margin: '2px 0 0', fontSize: 'var(--font-xl)', fontWeight: 900, letterSpacing: '-0.3px' }}>
          {userProfile.displayName} 👋
        </h2>
        <p style={{ margin: '6px 0 0', fontSize: 'var(--font-sm)', opacity: 0.75 }}>You are protected. Stay safe.</p>
      </div>

      <div className="tab-content" style={{ padding: '0 var(--space-md) var(--space-xl)' }}>

        {/* ── SOS component ── */}
        <SosButton ref={sosRef} onAlertSent={() => console.log('[Dashboard] SOS dispatched')} />

      </div>
    </IonContent>
  );

  /* ══════════════════════════════════════════════════════════
     TAB 2 — SETTINGS
  ══════════════════════════════════════════════════════════ */
  const renderSettings = () => (
    <IonContent className="sn-page">
      <div className="sn-header-band">
        <h2 style={{ margin: 0, fontWeight: 900, fontSize: 'var(--font-xl)' }}>Settings</h2>
        <p style={{ margin: '4px 0 0', fontSize: 'var(--font-sm)', opacity: 0.8 }}>Alert preferences and sensor configuration</p>
      </div>

      <div className="tab-content" style={{ padding: '0 var(--space-md) var(--space-xl)' }}>

        {/* ── Alert Settings ── */}
        <p className="sn-section-label">Alert Settings</p>
        <div className="sn-card">
          <div style={{ padding: '0 var(--space-md)' }}>
            {([
              { key: 'smsAlerts' as const,       label: 'SMS Alerts',       desc: 'Send text message when SOS is triggered', iconBg: 'var(--clr-primary-tint)', iconColor: 'var(--clr-primary)',  icon: chatbubbleOutline },
              { key: 'locationSharing' as const,  label: 'Location Sharing', desc: 'Share your GPS location with contacts',    iconBg: 'var(--clr-alert-tint)',   iconColor: 'var(--clr-alert)',    icon: navigateOutline },
            ]).map(item => (
              <div key={item.key} className="sn-toggle-row">
                <div className="sn-icon-wrap" style={{ background: item.iconBg }}>
                  <IonIcon icon={item.icon} style={{ fontSize: '22px', color: item.iconColor }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 'var(--font-md)', color: 'var(--clr-text-primary)' }}>{item.label}</p>
                  <p style={{ margin: '2px 0 0', fontSize: 'var(--font-xs)', color: 'var(--clr-text-secondary)' }}>{item.desc}</p>
                </div>
                <IonToggle checked={settings[item.key]}
                  onIonChange={() => updateSetting(item.key, !settings[item.key])} color="success" />
              </div>
            ))}
          </div>
        </div>

        {/* ── Sensor Settings ── */}
        <p className="sn-section-label">Sensor Detection</p>
        <div className="sn-card">
          <div style={{ padding: '0 var(--space-md)' }}>

            {/* Fall Detection */}
            <div className="sn-toggle-row">
              <div className="sn-icon-wrap" style={{ background: 'var(--clr-alert-tint)' }}>
                <IonIcon icon={bodyOutline} style={{ fontSize: '22px', color: 'var(--clr-alert)' }} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 'var(--font-md)', color: 'var(--clr-text-primary)' }}>Fall Detection</p>
                <p style={{ margin: '2px 0 0', fontSize: 'var(--font-xs)', color: 'var(--clr-text-secondary)' }}>
                  Detects sudden fall via accelerometer
                </p>
                <p style={{ margin: '2px 0 0', fontSize: 'var(--font-xs)', color: settings.fallAlert ? 'var(--clr-primary)' : 'var(--clr-text-muted)' }}>
                  {settings.fallAlert ? '● Active' : '○ Off'}
                </p>
              </div>
              <IonToggle checked={settings.fallAlert}
                onIonChange={() => updateSetting('fallAlert', !settings.fallAlert)} color="success" />
            </div>

            {/* Shake Detection */}
            <div className="sn-toggle-row">
              <div className="sn-icon-wrap" style={{ background: 'var(--clr-warning-tint)' }}>
                <IonIcon icon={phonePortraitOutline} style={{ fontSize: '22px', color: 'var(--clr-warning)' }} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 'var(--font-md)', color: 'var(--clr-text-primary)' }}>Shake to Alert</p>
                <p style={{ margin: '2px 0 0', fontSize: 'var(--font-xs)', color: 'var(--clr-text-secondary)' }}>
                  Shake phone 3× in 1 second to trigger SOS
                </p>
                <p style={{ margin: '2px 0 0', fontSize: 'var(--font-xs)', color: settings.shakeAlert ? 'var(--clr-primary)' : 'var(--clr-text-muted)' }}>
                  {settings.shakeAlert ? '● Active' : '○ Off'}
                </p>
              </div>
              <IonToggle checked={settings.shakeAlert}
                onIonChange={() => updateSetting('shakeAlert', !settings.shakeAlert)} color="success" />
            </div>

            {/* Motion Detection */}
            <div className="sn-toggle-row">
              <div className="sn-icon-wrap" style={{ background: 'var(--clr-primary-tint)' }}>
                <IonIcon icon={timeOutline} style={{ fontSize: '22px', color: 'var(--clr-primary)' }} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 'var(--font-md)', color: 'var(--clr-text-primary)' }}>Motion Detection</p>
                <p style={{ margin: '2px 0 0', fontSize: 'var(--font-xs)', color: 'var(--clr-text-secondary)' }}>
                  Detects sudden sharp movement or struggle
                </p>
                <p style={{ margin: '2px 0 0', fontSize: 'var(--font-xs)', color: settings.noMovementAlert ? 'var(--clr-primary)' : 'var(--clr-text-muted)' }}>
                  {settings.noMovementAlert ? '● Active' : '○ Off'}
                </p>
              </div>
              <IonToggle checked={settings.noMovementAlert}
                onIonChange={() => updateSetting('noMovementAlert', !settings.noMovementAlert)} color="success" />
            </div>

            {/* Sensitivity */}
            <div className="sn-toggle-row">
              <div className="sn-icon-wrap" style={{ background: 'var(--clr-primary-tint)' }}>
                <IonIcon icon={wifiOutline} style={{ fontSize: '22px', color: 'var(--clr-primary)' }} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 'var(--font-md)', color: 'var(--clr-text-primary)' }}>Sensitivity</p>
                <p style={{ margin: '2px 0 0', fontSize: 'var(--font-xs)', color: 'var(--clr-text-secondary)' }}>
                  Low = fewer false alarms · High = more sensitive
                </p>
              </div>
              <IonSelect value={settings.sensitivity} interface="popover"
                onIonChange={e => updateSetting('sensitivity', e.detail.value as Sensitivity)}
                style={{ fontWeight: 700, color: 'var(--clr-primary)', fontSize: 'var(--font-sm)' }}>
                <IonSelectOption value="low">Low</IonSelectOption>
                <IonSelectOption value="medium">Medium</IonSelectOption>
                <IonSelectOption value="high">High</IonSelectOption>
              </IonSelect>
            </div>

          </div>
        </div>

        {/* ── SOS Behaviour ── */}
        <p className="sn-section-label">SOS Behaviour</p>
        <div className="sn-card">
          <div style={{ padding: '0 var(--space-md)' }}>

            {/* Auto SOS */}
            <div className="sn-toggle-row">
              <div className="sn-icon-wrap" style={{ background: 'var(--clr-alert-tint)' }}>
                <IonIcon icon={checkmarkCircleOutline} style={{ fontSize: '22px', color: 'var(--clr-alert)' }} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 'var(--font-md)', color: 'var(--clr-text-primary)' }}>Auto SOS on Detection</p>
                <p style={{ margin: '2px 0 0', fontSize: 'var(--font-xs)', color: 'var(--clr-text-secondary)' }}>
                  Start SOS countdown automatically when sensor fires
                </p>
              </div>
              <IonToggle checked={settings.autoSosOnDetect}
                onIonChange={() => updateSetting('autoSosOnDetect', !settings.autoSosOnDetect)} color="success" />
            </div>

            {/* SOS Countdown */}
            <div className="sn-toggle-row">
              <div className="sn-icon-wrap" style={{ background: 'var(--clr-primary-tint)' }}>
                <IonIcon icon={timeOutline} style={{ fontSize: '22px', color: 'var(--clr-primary)' }} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 'var(--font-md)', color: 'var(--clr-text-primary)' }}>SOS Countdown</p>
                <p style={{ margin: '2px 0 0', fontSize: 'var(--font-xs)', color: 'var(--clr-text-secondary)' }}>
                  Seconds to cancel before alert sends
                </p>
              </div>
              <IonSelect value={settings.sosDelay} interface="popover"
                onIonChange={e => updateSetting('sosDelay', Number(e.detail.value))}
                style={{ fontWeight: 700, color: 'var(--clr-primary)', fontSize: 'var(--font-sm)' }}>
                <IonSelectOption value={5}>5s</IonSelectOption>
                <IonSelectOption value={10}>10s</IonSelectOption>
                <IonSelectOption value={15}>15s</IonSelectOption>
                <IonSelectOption value={30}>30s</IonSelectOption>
              </IonSelect>
            </div>

          </div>
        </div>

        {/* Settings auto-save notice */}
        <p style={{ textAlign: 'center', fontSize: 'var(--font-xs)', color: 'var(--clr-text-muted)', marginTop: 'var(--space-sm)' }}>
          ✓ Settings are saved automatically
        </p>

      </div>
    </IonContent>
  );

  /* ══════════════════════════════════════════════════════════
     TAB 3 — PROFILE
  ══════════════════════════════════════════════════════════ */
  const renderProfile = () => (
    <IonContent className="sn-page">
      <div className="sn-header-band" style={{ textAlign: 'center', paddingBottom: 'var(--space-xl)' }}>
        <div className="sn-avatar">{userProfile.displayName.charAt(0).toUpperCase() || '?'}</div>
        {editingName ? (
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
            <input value={tempName} onChange={e => setTempName(e.target.value)} autoFocus
              onKeyDown={e => e.key === 'Enter' && saveDisplayName()}
              style={{ padding: '8px 14px', borderRadius: 'var(--radius-sm)', border: 'none', fontSize: 'var(--font-lg)', width: '170px', fontWeight: 700, background: '#ffffff', color: '#1b2e1c', outline: 'none', boxShadow: '0 0 0 2px rgba(255,255,255,0.6)' }} />
            <button onClick={saveDisplayName}
              style={{ background: 'rgba(255,255,255,0.25)', border: 'none', borderRadius: 'var(--radius-sm)', padding: '8px 14px', color: 'white', cursor: 'pointer', fontSize: '20px', fontWeight: 700 }}>✓</button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <h2 style={{ color: 'white', margin: 0, fontWeight: 900, fontSize: 'var(--font-xl)' }}>{userProfile.displayName}</h2>
            <button onClick={() => { setTempName(userProfile.displayName); setEditingName(true); }}
              style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 'var(--radius-sm)', padding: '5px 9px', cursor: 'pointer' }}>
              <IonIcon icon={pencilOutline} style={{ color: 'white', fontSize: '16px' }} />
            </button>
          </div>
        )}
        <p style={{ color: 'rgba(255,255,255,0.75)', margin: '6px 0 0', fontSize: 'var(--font-sm)' }}>SafeNode Member</p>
      </div>

      <div className="tab-content" style={{ padding: '0 var(--space-md) var(--space-xl)' }}>
        <p className="sn-section-label">Your Details</p>
        <div className="sn-card">
          <IonList lines="inset" style={{ background: 'transparent' }}>

            {/* ── Phone — editable ── */}
            <IonItem style={{ '--background': 'transparent' }}>
              <IonIcon icon={callOutline} slot="start" style={{ color: 'var(--clr-primary)', fontSize: '22px' }} />
              <IonLabel>
                <p style={{ fontSize: 'var(--font-xs)', color: 'var(--clr-text-secondary)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>Phone</p>
                {editingPhone ? (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input type="tel" value={tempPhone} onChange={e => setTempPhone(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && savePhone()} autoFocus className="sn-edit-input" />
                    <button onClick={savePhone} className="sn-edit-confirm">✓</button>
                    <button onClick={() => setEditingPhone(false)} className="sn-edit-cancel">✕</button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontSize: 'var(--font-md)', fontWeight: 800, color: 'var(--clr-text-primary)', margin: 0, flex: 1 }}>{userProfile.contact || 'Not set'}</h3>
                    <button onClick={() => { setTempPhone(userProfile.contact); setEditingPhone(true); }}
                      style={{ background: 'var(--clr-primary-tint)', border: 'none', borderRadius: 'var(--radius-sm)', padding: '4px 8px', cursor: 'pointer' }}>
                      <IonIcon icon={pencilOutline} style={{ color: 'var(--clr-primary)', fontSize: '14px' }} />
                    </button>
                  </div>
                )}
              </IonLabel>
            </IonItem>

            {/* ── Email — editable ── */}
            <IonItem style={{ '--background': 'transparent' }}>
              <IonIcon icon={mailOutline} slot="start" style={{ color: 'var(--clr-primary)', fontSize: '22px' }} />
              <IonLabel>
                <p style={{ fontSize: 'var(--font-xs)', color: 'var(--clr-text-secondary)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>Email</p>
                {editingEmail ? (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input type="email" value={tempEmail} onChange={e => setTempEmail(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && saveEmail()} autoFocus className="sn-edit-input" />
                    <button onClick={saveEmail} className="sn-edit-confirm">✓</button>
                    <button onClick={() => setEditingEmail(false)} className="sn-edit-cancel">✕</button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontSize: 'var(--font-md)', fontWeight: 800, color: 'var(--clr-text-primary)', margin: 0, flex: 1 }}>{userProfile.email || 'Not set'}</h3>
                    <button onClick={() => { setTempEmail(userProfile.email); setEditingEmail(true); }}
                      style={{ background: 'var(--clr-primary-tint)', border: 'none', borderRadius: 'var(--radius-sm)', padding: '4px 8px', cursor: 'pointer' }}>
                      <IonIcon icon={pencilOutline} style={{ color: 'var(--clr-primary)', fontSize: '14px' }} />
                    </button>
                  </div>
                )}
              </IonLabel>
            </IonItem>

            {/* ── Status — read only ── */}
            <IonItem lines="none" style={{ '--background': 'transparent' }}>
              <IonIcon icon={shieldCheckmarkOutline} slot="start" style={{ color: 'var(--clr-primary)', fontSize: '22px' }} />
              <IonLabel>
                <p style={{ fontSize: 'var(--font-xs)', color: 'var(--clr-text-secondary)', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>Status</p>
                <h3 style={{ fontSize: 'var(--font-md)', fontWeight: 800, color: 'var(--clr-primary)' }}>✓ Verified & Protected</h3>
              </IonLabel>
            </IonItem>

          </IonList>
        </div>

        <IonButton expand="block" color="danger" fill="outline"
          onClick={() => setShowLogoutAlert(true)}
          style={{ '--border-radius': 'var(--radius-md)', height: '54px', fontSize: 'var(--font-md)', fontWeight: 800, marginTop: 'var(--space-sm)' }}>
          <IonIcon icon={logOutOutline} slot="start" />
          Sign Out
        </IonButton>

        {/* ══ SOS IDENTITY SECTION ══════════════════════════════
            These details are sent with every SOS alert.
            Edit here to update what responders see.
        ══════════════════════════════════════════════════════ */}
        <p className="sn-section-label" style={{ marginTop: 'var(--space-lg)' }}>SOS Identity</p>

        <div style={{ background: 'var(--clr-primary-tint)', border: '1px solid var(--clr-primary-border)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: 'var(--space-sm)', display: 'flex', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>ℹ️</span>
          <p style={{ margin: 0, fontSize: 'var(--font-xs)', color: 'var(--clr-text-secondary)', lineHeight: 1.5 }}>
            Sent with every SOS alert so responders know who you are even if they don't have your number saved.
          </p>
        </div>

        {editingIdentity ? (
          /* ── Edit mode ── */
          <div className="sn-card" style={{ padding: 'var(--space-md)' }}>
            {([
              { label: 'Full Name',     key: 'fullName' as const, type: 'text',   placeholder: 'e.g. Rohan Singh' },
              { label: 'Age',           key: 'age'      as const, type: 'number', placeholder: 'e.g. 22' },
              { label: 'Address',       key: 'address'  as const, type: 'text',   placeholder: 'e.g. Sector 5, New Delhi' },
              { label: 'Medical Notes', key: 'note'     as const, type: 'text',   placeholder: 'e.g. Diabetic, allergic to penicillin' },
            ]).map(field => (
              <div key={field.key} style={{ marginBottom: 'var(--space-sm)' }}>
                <p style={{ margin: '0 0 4px', fontSize: 'var(--font-xs)', fontWeight: 800, color: 'var(--clr-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {field.label}
                </p>
                <input
                  type={field.type}
                  value={tempIdentity[field.key]}
                  placeholder={field.placeholder}
                  onChange={e => setTempIdentity(prev => ({ ...prev, [field.key]: e.target.value }))}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '2px solid var(--clr-primary-border)', fontSize: 'var(--font-md)', fontWeight: 600, outline: 'none', background: '#ffffff', color: '#1b2e1c', boxSizing: 'border-box' as const }}
                />
              </div>
            ))}

            {/* Blood group selector */}
            <p style={{ margin: '0 0 6px', fontSize: 'var(--font-xs)', fontWeight: 800, color: 'var(--clr-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Blood Group
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: 'var(--space-md)' }}>
              {['A+', 'A−', 'B+', 'B−', 'AB+', 'AB−', 'O+', 'O−'].map(bg => (
                <button key={bg}
                  onClick={() => setTempIdentity(prev => ({ ...prev, bloodGroup: bg }))}
                  style={{
                    padding: '10px 0', borderRadius: 'var(--radius-sm)', fontWeight: 800, fontSize: 'var(--font-sm)', cursor: 'pointer',
                    border: '2px solid var(--clr-primary-border)',
                    background: tempIdentity.bloodGroup === bg ? 'var(--clr-primary)' : '#ffffff',
                    color: tempIdentity.bloodGroup === bg ? 'white' : 'var(--clr-text-primary)',
                  }}>
                  {bg}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <IonButton fill="outline" onClick={() => setEditingIdentity(false)}
                style={{ '--border-radius': 'var(--radius-sm)', '--color': 'var(--clr-primary)', height: '48px', flex: '0 0 90px', fontWeight: 700 }}>
                Cancel
              </IonButton>
              <IonButton expand="block" onClick={saveIdentity}
                style={{ '--background': 'var(--clr-primary)', '--border-radius': 'var(--radius-sm)', height: '48px', fontWeight: 800, flex: 1 }}>
                <IonIcon icon={checkmarkCircleOutline} slot="start" />
                Save
              </IonButton>
            </div>
          </div>
        ) : (
          /* ── View mode ── */
          <div className="sn-card">
            <div style={{ padding: 'var(--space-md)' }}>
              {[
                { label: '👤 Name',          value: identity.fullName },
                { label: '🎂 Age',           value: identity.age },
                { label: '🩸 Blood Group',   value: identity.bloodGroup },
                { label: '🏠 Address',       value: identity.address },
                { label: '📋 Medical Notes', value: identity.note },
              ].filter(r => r.value).map((row, i, arr) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '8px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--clr-primary-tint)' : 'none' }}>
                  <span style={{ fontSize: 'var(--font-sm)', color: 'var(--clr-text-secondary)', fontWeight: 600, flexShrink: 0 }}>{row.label}</span>
                  <span style={{ fontSize: 'var(--font-sm)', fontWeight: 800, color: 'var(--clr-text-primary)', textAlign: 'right', maxWidth: '60%' }}>{row.value}</span>
                </div>
              ))}

              {!identity.fullName && !identity.age && (
                <p style={{ margin: 0, color: 'var(--clr-text-muted)', fontSize: 'var(--font-sm)', textAlign: 'center', padding: 'var(--space-sm) 0' }}>
                  No identity set yet. Tap Edit to add your details.
                </p>
              )}

              <IonButton expand="block" fill="outline"
                onClick={() => { setTempIdentity({ ...identity }); setEditingIdentity(true); }}
                style={{ '--border-radius': 'var(--radius-sm)', '--color': 'var(--clr-primary)', '--border-color': 'var(--clr-primary)', height: '46px', fontWeight: 700, marginTop: 'var(--space-sm)' }}>
                <IonIcon icon={pencilOutline} slot="start" />
                Edit SOS Identity
              </IonButton>
            </div>
          </div>
        )}

      </div>

      <IonAlert isOpen={showLogoutAlert} onDidDismiss={() => setShowLogoutAlert(false)}
        header="Sign Out?" message="Are you sure you want to sign out of SafeNode?"
        buttons={[
          { text: 'Stay', role: 'cancel' },
          { text: 'Sign Out', role: 'destructive', handler: handleLogout }
        ]} />
    </IonContent>
  );

  /* ── Shell ── */
  return (
    <IonPage>
      <style>{styles}</style>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle style={{ fontWeight: 900, fontSize: 'var(--font-lg)' }}>🛡️ SafeNode</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => setShowContactsModal(true)}
              style={{ '--color': 'white' }}>
              <IonIcon icon={peopleOutline} style={{ fontSize: '24px' }} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      {/* ── Contacts Modal ── */}
      <IonModal isOpen={showContactsModal} onDidDismiss={() => setShowContactsModal(false)}>
        <IonHeader>
          <IonToolbar color="primary">
            <IonTitle style={{ fontWeight: 800 }}>Emergency Contacts</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={() => setShowContactsModal(false)} style={{ '--color': 'white' }}>
                <IonIcon icon={closeOutline} style={{ fontSize: '26px' }} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent style={{ '--background': 'var(--clr-bg)' }}>
          <div style={{ padding: 'var(--space-md) var(--space-md) var(--space-xl)' }}>
            <ContactsManager />
          </div>
        </IonContent>
      </IonModal>

      {activeTab === 'home'     && renderHome()}
      {activeTab === 'settings' && renderSettings()}
      {activeTab === 'profile'  && renderProfile()}

      <IonTabBar slot="bottom">
        <IonTabButton tab="home" selected={activeTab === 'home'} onClick={() => setActiveTab('home')}>
          <IonIcon icon={homeOutline} />
          <IonLabel>Home</IonLabel>
        </IonTabButton>
        <IonTabButton tab="settings" selected={activeTab === 'settings'} onClick={() => setActiveTab('settings')}>
          <IonIcon icon={settingsOutline} />
          <IonLabel>Settings</IonLabel>
        </IonTabButton>
        <IonTabButton tab="profile" selected={activeTab === 'profile'} onClick={() => setActiveTab('profile')}>
          <IonIcon icon={personOutline} />
          <IonLabel>Profile</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonPage>
  );
};

export default Dashboard;
