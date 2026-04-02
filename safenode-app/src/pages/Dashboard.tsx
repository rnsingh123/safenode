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

import React, { useState, useEffect } from 'react';
import {
  IonPage, IonContent, IonHeader, IonToolbar, IonTitle,
  IonTabBar, IonTabButton, IonIcon, IonLabel, IonCard, IonCardContent,
  IonToggle, IonList, IonItem, IonAlert, IonButton, IonText, IonBadge
} from '@ionic/react';
import {
  homeOutline, personOutline, settingsOutline,
  shieldCheckmarkOutline, locationOutline, pencilOutline,
  logOutOutline, callOutline, mailOutline,
  bodyOutline, phonePortraitOutline, timeOutline,
  checkmarkCircleOutline, wifiOutline, navigateOutline
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import SosButton from '../components/sos/SosButton';
import ContactsManager from '../components/contacts/ContactsManager';
import { getSettings, saveSettings, AppSettings } from '../utils/storage';

/* ── [STYLE AREA] ── */
const styles = `
  /* Page background — [COLOR] change --clr-bg in variables.css */
  .sn-page { background: var(--clr-bg); }

  /* Card — used for every section block */
  .sn-card {
    background: var(--clr-surface);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
    border: 1px solid var(--clr-primary-border);
    margin: 0 0 var(--space-md);
    overflow: hidden;
  }

  /* Header gradient band at top of each tab */
  .sn-header-band {
    background: linear-gradient(135deg, var(--clr-primary) 0%, var(--clr-primary-light) 100%);
    padding: var(--space-xl) var(--space-md) var(--space-lg);
    color: white;
  }

  /* Section label above cards */
  .sn-section-label {
    font-size: var(--font-xs); font-weight: 800;
    color: var(--clr-primary-muted);
    text-transform: uppercase; letter-spacing: 1.2px;
    padding: var(--space-lg) 0 var(--space-sm);
  }

  /* Toggle row inside cards */
  .sn-toggle-row {
    display: flex; align-items: center;
    padding: var(--space-md) 0;
    border-bottom: 1px solid var(--clr-primary-tint);
    transition: background 0.15s;
  }
  .sn-toggle-row:last-child { border-bottom: none; }

  /* Icon badge left of toggle label */
  .sn-icon-wrap {
    width: 44px; height: 44px; border-radius: var(--radius-sm);
    display: flex; align-items: center; justify-content: center;
    margin-right: var(--space-md); flex-shrink: 0;
  }

  /* Profile avatar circle */
  .sn-avatar {
    width: 80px; height: 80px; border-radius: 50%;
    background: rgba(255,255,255,0.22);
    border: 3px solid rgba(255,255,255,0.5);
    display: flex; align-items: center; justify-content: center;
    font-size: 32px; font-weight: 900; color: white;
    margin: 0 auto var(--space-sm);
    box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  }

  /* Location info box */
  .location-box {
    background: var(--clr-primary-tint);
    border-radius: var(--radius-md);
    padding: var(--space-md); margin-top: var(--space-md);
    border: 1px solid var(--clr-primary-border);
  }

  /* Signal strength bars */
  .signal-bar {
    display: inline-block; width: 5px; border-radius: 3px;
    background: var(--clr-primary-border); margin-right: 3px;
    vertical-align: bottom; transition: background 0.2s;
  }
  .signal-bar.active { background: var(--clr-primary); }

  /* Tab bar */
  ion-tab-button { --color: var(--clr-text-muted); --color-selected: var(--clr-primary); }

  /* Fade-in for tab content */
  @keyframes tabFade {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .tab-content { animation: tabFade 0.25s ease both; }
`;

interface UserProfile { username: string; contact: string; email: string; displayName: string; }

const Dashboard: React.FC = () => {
  const history = useHistory();
  const [activeTab, setActiveTab]         = useState<'home' | 'settings' | 'profile'>('home');
  const [userProfile, setUserProfile]     = useState<UserProfile>({ username: '', contact: '', email: '', displayName: '' });
  const [editingName, setEditingName]     = useState(false);
  const [tempName, setTempName]           = useState('');
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [settings, setSettings]           = useState<AppSettings>(getSettings());
  const [locationShared, setLocationShared] = useState(false);
  const [locationTime, setLocationTime]   = useState('');
  const [saveMsg, setSaveMsg]             = useState('');

  /* ── [AUTH GUARD] ── */
  useEffect(() => {
    const stored = sessionStorage.getItem('user');
    if (!stored) { history.replace('/login'); return; }
    setUserProfile(JSON.parse(stored));
  }, [history]);

  const updateSetting = (key: keyof AppSettings, value: boolean) => {
    const updated = { ...settings, [key]: value };
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

  const handleLogout = () => { sessionStorage.removeItem('user'); history.replace('/login'); };

  const handleShareLocation = () => {
    setLocationShared(true);
    const now = new Date();
    setLocationTime(
      now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' +
      now.toLocaleDateString([], { day: 'numeric', month: 'short' })
    );
    console.log('[Location] simulated share at', now.toISOString());
  };

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
        <SosButton onAlertSent={() => console.log('[Dashboard] SOS dispatched')} />

        {/* ── Safety Features ── */}
        <p className="sn-section-label">Safety Features</p>
        <div className="sn-card">
          <div style={{ padding: '0 var(--space-md)' }}>
            {([
              { key: 'fallAlert' as const,       label: 'Fall Alert',         desc: 'Alerts if you fall suddenly',          icon: bodyOutline,          iconBg: 'var(--clr-alert-tint)',    iconColor: 'var(--clr-alert)' },
              { key: 'shakeAlert' as const,      label: 'Shake to Alert',     desc: 'Shake your phone to call for help',    icon: phonePortraitOutline, iconBg: 'var(--clr-warning-tint)',  iconColor: 'var(--clr-warning)' },
              { key: 'noMovementAlert' as const, label: 'No Movement Alert',  desc: 'Alerts if no movement for a while',    icon: timeOutline,          iconBg: 'var(--clr-primary-tint)',  iconColor: 'var(--clr-primary)' },
            ]).map(item => (
              <div key={item.key} className="sn-toggle-row">
                <div className="sn-icon-wrap" style={{ background: item.iconBg }}>
                  <IonIcon icon={item.icon} style={{ fontSize: '22px', color: item.iconColor }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 'var(--font-md)', color: 'var(--clr-text-primary)' }}>{item.label}</p>
                  <p style={{ margin: '2px 0 0', fontSize: 'var(--font-xs)', color: 'var(--clr-text-secondary)' }}>{item.desc}</p>
                  <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'var(--clr-text-muted)' }}>Sensor integration coming soon</p>
                </div>
                <IonToggle checked={settings[item.key]}
                  onIonChange={() => updateSetting(item.key, !settings[item.key])} color="success" />
              </div>
            ))}
          </div>
        </div>

        {/* ── Location ── */}
        <p className="sn-section-label">My Location</p>
        <div className="sn-card">
          <div style={{ padding: 'var(--space-md)' }}>
            <IonButton expand="block" onClick={handleShareLocation}
              style={{
                '--background': locationShared ? 'var(--clr-primary-light)' : 'var(--clr-primary)',
                '--border-radius': 'var(--radius-sm)',
                '--box-shadow': 'var(--shadow-sm)',
                height: '52px', fontSize: 'var(--font-md)', fontWeight: 700
              }}>
              <IonIcon icon={navigateOutline} slot="start" />
              {locationShared ? 'Location Shared ✓' : 'Share My Location'}
            </IonButton>
            {locationShared && (
              <div className="location-box">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <IonIcon icon={checkmarkCircleOutline} style={{ color: 'var(--clr-primary)', fontSize: '20px' }} />
                  <span style={{ fontWeight: 800, fontSize: 'var(--font-md)', color: 'var(--clr-text-primary)' }}>Location Shared</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: 'var(--font-sm)', color: 'var(--clr-text-secondary)' }}>Last updated</span>
                  <span style={{ fontSize: 'var(--font-sm)', fontWeight: 700, color: 'var(--clr-text-primary)' }}>{locationTime}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 'var(--font-sm)', color: 'var(--clr-text-secondary)' }}>Signal</span>
                  <div>
                    {[12, 18, 24, 30].map((h, i) => (
                      <span key={i} className={`signal-bar ${i < 3 ? 'active' : ''}`} style={{ height: `${h}px` }} />
                    ))}
                    <span style={{ fontSize: 'var(--font-xs)', color: 'var(--clr-primary)', marginLeft: '4px', fontWeight: 700 }}>Good</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

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
        <p style={{ margin: '4px 0 0', fontSize: 'var(--font-sm)', opacity: 0.8 }}>Manage contacts and alert preferences</p>
      </div>

      <div className="tab-content" style={{ padding: '0 var(--space-md) var(--space-xl)' }}>

        <p className="sn-section-label">Emergency Contacts</p>
        <ContactsManager />

        <p className="sn-section-label">Alert Settings</p>
        <div className="sn-card">
          <div style={{ padding: '0 var(--space-md)' }}>
            {([
              { key: 'smsAlerts' as const,      label: 'SMS Alerts',       desc: 'Send text message when SOS is triggered', iconBg: 'var(--clr-primary-tint)', iconColor: 'var(--clr-primary)' },
              { key: 'locationSharing' as const, label: 'Location Sharing', desc: 'Share your location with contacts',        iconBg: 'var(--clr-alert-tint)',   iconColor: 'var(--clr-alert)' },
            ]).map(item => (
              <div key={item.key} className="sn-toggle-row">
                <div className="sn-icon-wrap" style={{ background: item.iconBg }}>
                  <IonIcon icon={locationOutline} style={{ fontSize: '22px', color: item.iconColor }} />
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

        <p className="sn-section-label">Sensor Settings</p>
        <div className="sn-card">
          <div style={{ padding: '0 var(--space-md)' }}>
            {([
              { key: 'fallAlert' as const,       label: 'Fall Alert Sensor', desc: 'Detects sudden falls via accelerometer' },
              { key: 'shakeAlert' as const,      label: 'Shake Sensor',      desc: 'Detects rapid shaking to trigger SOS' },
              { key: 'noMovementAlert' as const, label: 'Motion Sensor',     desc: 'Monitors for extended inactivity' },
            ]).map(item => (
              <div key={item.key} className="sn-toggle-row">
                <div className="sn-icon-wrap" style={{ background: 'var(--clr-primary-tint)' }}>
                  <IonIcon icon={wifiOutline} style={{ fontSize: '22px', color: 'var(--clr-primary)' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 'var(--font-md)', color: 'var(--clr-text-primary)' }}>{item.label}</p>
                  <p style={{ margin: '2px 0 0', fontSize: 'var(--font-xs)', color: 'var(--clr-text-secondary)' }}>{item.desc}</p>
                  <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'var(--clr-warning)' }}>Sensor not available on this device</p>
                </div>
                <IonToggle checked={settings[item.key]}
                  onIonChange={() => updateSetting(item.key, !settings[item.key])} color="success" />
              </div>
            ))}
          </div>
        </div>

        <IonButton expand="block"
          onClick={() => { setSaveMsg('Settings saved!'); setTimeout(() => setSaveMsg(''), 2500); }}
          style={{ '--background': 'var(--clr-primary)', '--border-radius': 'var(--radius-md)', '--box-shadow': 'var(--shadow-md)', height: '54px', fontSize: 'var(--font-md)', fontWeight: 800 }}>
          <IonIcon icon={checkmarkCircleOutline} slot="start" />
          Save Settings
        </IonButton>
        {saveMsg && (
          <IonText color="success">
            <p style={{ textAlign: 'center', marginTop: 'var(--space-sm)', fontWeight: 700, fontSize: 'var(--font-md)' }}>
              ✓ {saveMsg}
            </p>
          </IonText>
        )}
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
              style={{ padding: '8px 14px', borderRadius: 'var(--radius-sm)', border: 'none', fontSize: 'var(--font-lg)', width: '170px', fontWeight: 700 }} />
            <button onClick={saveDisplayName}
              style={{ background: 'rgba(255,255,255,0.25)', border: 'none', borderRadius: 'var(--radius-sm)', padding: '8px 14px', color: 'white', cursor: 'pointer', fontSize: '20px' }}>✓</button>
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
            <IonItem style={{ '--background': 'transparent' }}>
              <IonIcon icon={callOutline} slot="start" style={{ color: 'var(--clr-primary)', fontSize: '22px' }} />
              <IonLabel>
                <p style={{ fontSize: 'var(--font-xs)', color: 'var(--clr-text-secondary)', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>Phone</p>
                <h3 style={{ fontSize: 'var(--font-md)', fontWeight: 800, color: 'var(--clr-text-primary)' }}>{userProfile.contact}</h3>
              </IonLabel>
            </IonItem>
            <IonItem style={{ '--background': 'transparent' }}>
              <IonIcon icon={mailOutline} slot="start" style={{ color: 'var(--clr-primary)', fontSize: '22px' }} />
              <IonLabel>
                <p style={{ fontSize: 'var(--font-xs)', color: 'var(--clr-text-secondary)', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>Email</p>
                <h3 style={{ fontSize: 'var(--font-md)', fontWeight: 800, color: 'var(--clr-text-primary)' }}>{userProfile.email}</h3>
              </IonLabel>
            </IonItem>
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
        </IonToolbar>
      </IonHeader>

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
