/**
 * Dashboard.tsx — Main app shell with 3 tabs.
 * Existing login/session logic is untouched.
 * Tab structure: Home | Settings | Profile
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

// ── Shared styles ─────────────────────────────────────────────
const styles = `
  .sn-page { background: var(--app-bg); }
  .sn-card {
    border-radius: 18px; margin: 0 0 16px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.07);
    border: 1px solid var(--border-green);
  }
  .sn-header-band {
    background: linear-gradient(135deg, var(--primary-green), var(--mid-green));
    padding: 28px 20px 24px; color: white;
  }
  .sn-section-label {
    font-size: 13px; font-weight: 800; color: var(--soft-green);
    text-transform: uppercase; letter-spacing: 1px;
    padding: 18px 4px 8px;
  }
  .sn-toggle-row {
    display: flex; align-items: center;
    padding: 16px 0; border-bottom: 1px solid var(--light-green);
  }
  .sn-toggle-row:last-child { border-bottom: none; }
  .sn-icon-wrap {
    width: 42px; height: 42px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    margin-right: 14px; flex-shrink: 0;
  }
  .sn-avatar {
    width: 76px; height: 76px; border-radius: 50%;
    background: rgba(255,255,255,0.25);
    display: flex; align-items: center; justify-content: center;
    font-size: 30px; font-weight: 800; color: white;
    margin: 0 auto 12px; border: 3px solid rgba(255,255,255,0.5);
  }
  ion-tab-button { --color: #888; --color-selected: var(--primary-green); }
  .location-box {
    background: var(--light-green); border-radius: 14px;
    padding: 16px; margin-top: 14px;
    border: 1px solid var(--border-green);
  }
  .signal-bar {
    display: inline-block; width: 6px; border-radius: 3px;
    background: var(--border-green); margin-right: 3px;
    vertical-align: bottom;
  }
  .signal-bar.active { background: var(--primary-green); }
`;

interface UserProfile { username: string; contact: string; email: string; displayName: string; }

const Dashboard: React.FC = () => {
  const history = useHistory();
  const [activeTab, setActiveTab] = useState<'home' | 'settings' | 'profile'>('home');

  // User profile — loaded from sessionStorage (set by Login.tsx)
  const [userProfile, setUserProfile] = useState<UserProfile>({
    username: '', contact: '', email: '', displayName: ''
  });

  // Profile editing
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);

  // App-wide settings — persisted in localStorage via storage.ts
  const [settings, setSettings] = useState<AppSettings>(getSettings());

  // Location state
  const [locationShared, setLocationShared] = useState(false);
  const [locationTime, setLocationTime] = useState('');

  // Settings save feedback
  const [saveMsg, setSaveMsg] = useState('');

  // Load user from session — redirect to login if missing
  useEffect(() => {
    const stored = sessionStorage.getItem('user');
    if (!stored) { history.replace('/login'); return; }
    setUserProfile(JSON.parse(stored));
  }, [history]);

  const updateSetting = (key: keyof AppSettings, value: boolean) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    saveSettings(updated); // persist immediately
  };

  const saveDisplayName = () => {
    if (tempName.trim()) {
      const updated = { ...userProfile, displayName: tempName.trim() };
      setUserProfile(updated);
      sessionStorage.setItem('user', JSON.stringify(updated));
    }
    setEditingName(false);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('user');
    history.replace('/login');
  };

  const handleShareLocation = () => {
    setLocationShared(true);
    const now = new Date();
    setLocationTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) +
      ', ' + now.toLocaleDateString([], { day: 'numeric', month: 'short' }));
    // TODO: Replace with real geolocation API + backend call
    console.log('[Location] Simulated location share at', now.toISOString());
  };

  // ── TAB 1: HOME ───────────────────────────────────────────────
  const renderHome = () => (
    <IonContent className="sn-page">
      <div className="sn-header-band">
        <p style={{ margin: 0, fontSize: '15px', opacity: 0.85 }}>Hello,</p>
        <h2 style={{ margin: '2px 0 0', fontSize: '24px', fontWeight: 800 }}>{userProfile.displayName} 👋</h2>
        <p style={{ margin: '6px 0 0', fontSize: '14px', opacity: 0.75 }}>You are protected. Stay safe.</p>
      </div>

      <div style={{ padding: '0 16px 32px' }}>

        {/* SOS — extracted component handles countdown + contacts */}
        <SosButton onAlertSent={() => console.log('[Dashboard] SOS alert dispatched')} />

        {/* Safety Features */}
        <p className="sn-section-label">Safety Features</p>
        <IonCard className="sn-card">
          <IonCardContent style={{ padding: '4px 16px' }}>
            {([
              { key: 'fallAlert' as const, label: 'Fall Alert', desc: 'Alerts if you fall suddenly', icon: bodyOutline, iconBg: '#fce4ec', iconColor: '#c62828' },
              { key: 'shakeAlert' as const, label: 'Shake to Alert', desc: 'Shake your phone to call for help', icon: phonePortraitOutline, iconBg: '#fff8e1', iconColor: '#f57f17' },
              { key: 'noMovementAlert' as const, label: 'No Movement Alert', desc: 'Alerts if no movement for a while', icon: timeOutline, iconBg: 'var(--light-green)', iconColor: 'var(--primary-green)' },
            ]).map(item => (
              <div key={item.key} className="sn-toggle-row">
                <div className="sn-icon-wrap" style={{ background: item.iconBg }}>
                  <IonIcon icon={item.icon} style={{ fontSize: '22px', color: item.iconColor }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: '16px', color: 'var(--dark-green)' }}>{item.label}</p>
                  <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--soft-green)' }}>{item.desc}</p>
                  {/* Sensor unavailable notice — future: check device capability */}
                  <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#aaa' }}>Sensor integration coming soon</p>
                </div>
                <IonToggle
                  checked={settings[item.key]}
                  onIonChange={() => updateSetting(item.key, !settings[item.key])}
                  color="success"
                />
              </div>
            ))}
          </IonCardContent>
        </IonCard>

        {/* Location */}
        <p className="sn-section-label">My Location</p>
        <IonCard className="sn-card">
          <IonCardContent>
            <IonButton
              expand="block"
              onClick={handleShareLocation}
              style={{
                '--background': locationShared ? 'var(--mid-green)' : 'var(--primary-green)',
                '--border-radius': '12px', height: '50px', fontSize: '16px', fontWeight: 700
              }}
            >
              <IonIcon icon={navigateOutline} slot="start" />
              {locationShared ? 'Location Shared ✓' : 'Share My Location'}
            </IonButton>

            {locationShared && (
              <div className="location-box">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <IonIcon icon={checkmarkCircleOutline} style={{ color: 'var(--primary-green)', fontSize: '20px' }} />
                  <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--dark-green)' }}>Location Shared</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '14px', color: 'var(--soft-green)' }}>Last updated</span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--dark-green)' }}>{locationTime}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', color: 'var(--soft-green)' }}>Signal</span>
                  <div>
                    {/* Signal strength bars — UI only */}
                    {[12, 18, 24, 30].map((h, i) => (
                      <span key={i} className={`signal-bar ${i < 3 ? 'active' : ''}`}
                        style={{ height: `${h}px` }} />
                    ))}
                    <span style={{ fontSize: '12px', color: 'var(--primary-green)', marginLeft: '4px' }}>Good</span>
                  </div>
                </div>
              </div>
            )}
          </IonCardContent>
        </IonCard>

      </div>
    </IonContent>
  );

  // ── TAB 2: SETTINGS ───────────────────────────────────────────
  const renderSettings = () => (
    <IonContent className="sn-page">
      <div className="sn-header-band">
        <h2 style={{ margin: 0, fontWeight: 800, fontSize: '22px' }}>Settings</h2>
        <p style={{ margin: '4px 0 0', fontSize: '14px', opacity: 0.8 }}>Manage contacts and alert preferences</p>
      </div>

      <div style={{ padding: '0 16px 32px' }}>

        {/* Emergency Contacts */}
        <p className="sn-section-label">Emergency Contacts</p>
        <ContactsManager />

        {/* Alert Settings */}
        <p className="sn-section-label">Alert Settings</p>
        <IonCard className="sn-card">
          <IonCardContent style={{ padding: '4px 16px' }}>
            {([
              { key: 'smsAlerts' as const, label: 'SMS Alerts', desc: 'Send text message when SOS is triggered', iconBg: 'var(--light-green)', iconColor: 'var(--primary-green)' },
              { key: 'locationSharing' as const, label: 'Location Sharing', desc: 'Share your location with contacts', iconBg: '#fce4ec', iconColor: '#c62828' },
            ]).map(item => (
              <div key={item.key} className="sn-toggle-row">
                <div className="sn-icon-wrap" style={{ background: item.iconBg }}>
                  <IonIcon icon={locationOutline} style={{ fontSize: '22px', color: item.iconColor }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: '16px', color: 'var(--dark-green)' }}>{item.label}</p>
                  <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--soft-green)' }}>{item.desc}</p>
                </div>
                <IonToggle
                  checked={settings[item.key]}
                  onIonChange={() => updateSetting(item.key, !settings[item.key])}
                  color="success"
                />
              </div>
            ))}
          </IonCardContent>
        </IonCard>

        {/* Sensor Settings */}
        <p className="sn-section-label">Sensor Settings</p>
        <IonCard className="sn-card">
          <IonCardContent style={{ padding: '4px 16px' }}>
            {([
              { key: 'fallAlert' as const, label: 'Fall Alert Sensor', desc: 'Detects sudden falls via accelerometer' },
              { key: 'shakeAlert' as const, label: 'Shake Sensor', desc: 'Detects rapid shaking to trigger SOS' },
              { key: 'noMovementAlert' as const, label: 'Motion Sensor', desc: 'Monitors for extended inactivity' },
            ]).map(item => (
              <div key={item.key} className="sn-toggle-row">
                <div className="sn-icon-wrap" style={{ background: 'var(--light-green)' }}>
                  <IonIcon icon={wifiOutline} style={{ fontSize: '22px', color: 'var(--primary-green)' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: '16px', color: 'var(--dark-green)' }}>{item.label}</p>
                  <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--soft-green)' }}>{item.desc}</p>
                  {/* TODO: Check device.sensors availability and show real status */}
                  <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#f57c00' }}>⚠ Sensor not available on this device</p>
                </div>
                <IonToggle
                  checked={settings[item.key]}
                  onIonChange={() => updateSetting(item.key, !settings[item.key])}
                  color="success"
                />
              </div>
            ))}
          </IonCardContent>
        </IonCard>

        <IonButton
          expand="block"
          onClick={() => { setSaveMsg('Settings saved!'); setTimeout(() => setSaveMsg(''), 2500); }}
          style={{ '--background': 'var(--primary-green)', '--border-radius': '14px', height: '52px', fontSize: '17px', fontWeight: 700 }}
        >
          <IonIcon icon={checkmarkCircleOutline} slot="start" />
          Save Settings
        </IonButton>
        {saveMsg && (
          <IonText color="success">
            <p style={{ textAlign: 'center', marginTop: '10px', fontWeight: 700, fontSize: '16px' }}>✓ {saveMsg}</p>
          </IonText>
        )}
      </div>
    </IonContent>
  );

  // ── TAB 3: PROFILE ────────────────────────────────────────────
  const renderProfile = () => (
    <IonContent className="sn-page">
      <div className="sn-header-band" style={{ textAlign: 'center', paddingBottom: '32px' }}>
        <div className="sn-avatar">{userProfile.displayName.charAt(0).toUpperCase() || '?'}</div>
        {editingName ? (
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
            <input value={tempName} onChange={e => setTempName(e.target.value)} autoFocus
              onKeyDown={e => e.key === 'Enter' && saveDisplayName()}
              style={{ padding: '8px 14px', borderRadius: '10px', border: 'none', fontSize: '17px', width: '170px' }} />
            <button onClick={saveDisplayName}
              style={{ background: 'rgba(255,255,255,0.3)', border: 'none', borderRadius: '8px', padding: '8px 12px', color: 'white', cursor: 'pointer', fontSize: '18px' }}>✓</button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <h2 style={{ color: 'white', margin: 0, fontWeight: 800, fontSize: '22px' }}>{userProfile.displayName}</h2>
            <button onClick={() => { setTempName(userProfile.displayName); setEditingName(true); }}
              style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '8px', padding: '5px 9px', cursor: 'pointer' }}>
              <IonIcon icon={pencilOutline} style={{ color: 'white', fontSize: '16px' }} />
            </button>
          </div>
        )}
        <p style={{ color: 'rgba(255,255,255,0.75)', margin: '6px 0 0', fontSize: '14px' }}>SafeNode Member</p>
      </div>

      <div style={{ padding: '0 16px 32px' }}>
        <p className="sn-section-label">Your Details</p>
        <IonCard className="sn-card">
          <IonCardContent style={{ padding: '4px 0' }}>
            <IonList lines="inset">
              <IonItem style={{ '--background': 'transparent' }}>
                <IonIcon icon={callOutline} slot="start" style={{ color: 'var(--primary-green)', fontSize: '22px' }} />
                <IonLabel>
                  <p style={{ fontSize: '13px', color: 'var(--soft-green)', margin: '0 0 2px' }}>Phone Number</p>
                  <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--dark-green)' }}>{userProfile.contact}</h3>
                </IonLabel>
              </IonItem>
              <IonItem style={{ '--background': 'transparent' }}>
                <IonIcon icon={mailOutline} slot="start" style={{ color: 'var(--primary-green)', fontSize: '22px' }} />
                <IonLabel>
                  <p style={{ fontSize: '13px', color: 'var(--soft-green)', margin: '0 0 2px' }}>Email</p>
                  <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--dark-green)' }}>{userProfile.email}</h3>
                </IonLabel>
              </IonItem>
              <IonItem lines="none" style={{ '--background': 'transparent' }}>
                <IonIcon icon={shieldCheckmarkOutline} slot="start" style={{ color: 'var(--primary-green)', fontSize: '22px' }} />
                <IonLabel>
                  <p style={{ fontSize: '13px', color: 'var(--soft-green)', margin: '0 0 2px' }}>Account Status</p>
                  <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--primary-green)' }}>✓ Verified & Protected</h3>
                </IonLabel>
              </IonItem>
            </IonList>
          </IonCardContent>
        </IonCard>

        <IonButton
          expand="block"
          color="danger"
          fill="outline"
          onClick={() => setShowLogoutAlert(true)}
          style={{ '--border-radius': '14px', height: '52px', fontSize: '17px', fontWeight: 700, marginTop: '12px' }}
        >
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

  return (
    <IonPage>
      <style>{styles}</style>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle style={{ fontWeight: 800, fontSize: '20px' }}>🛡️ SafeNode</IonTitle>
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
