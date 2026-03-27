import React, { useState, useEffect } from 'react';
import {
  IonPage, IonContent, IonHeader, IonToolbar, IonTitle,
  IonTabBar, IonTabButton, IonIcon, IonLabel, IonCard, IonCardContent,
  IonToggle, IonList, IonItem,
  IonAlert, IonButton, IonText, IonToast, IonBadge
} from '@ionic/react';
import {
  homeOutline, personOutline, notificationsOutline, shieldCheckmarkOutline,
  locationOutline, chatbubbleOutline, pencilOutline, logOutOutline,
  callOutline, mailOutline, warningOutline, navigateOutline,
  bodyOutline, phonePortraitOutline, timeOutline, checkmarkCircleOutline,
  alertCircleOutline
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';

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
  .sn-activity-row {
    display: flex; align-items: center; gap: 12px;
    padding: 13px 0; border-bottom: 1px solid var(--light-green);
  }
  .sn-activity-row:last-child { border-bottom: none; }
  .sn-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
  .sn-avatar {
    width: 76px; height: 76px; border-radius: 50%;
    background: rgba(255,255,255,0.25);
    display: flex; align-items: center; justify-content: center;
    font-size: 30px; font-weight: 800; color: white;
    margin: 0 auto 12px; border: 3px solid rgba(255,255,255,0.5);
  }
  ion-tab-button { --color: #888; --color-selected: var(--primary-green); }
  .sos-btn {
    width: 150px; height: 150px; border-radius: 50%;
    background: radial-gradient(circle at 35% 35%, #ef5350, #b71c1c);
    border: 5px solid #e53935;
    box-shadow: 0 0 0 8px rgba(229,57,53,0.15), 0 0 24px rgba(183,28,28,0.4);
    color: white; font-size: 30px; font-weight: 900;
    cursor: pointer; letter-spacing: 3px;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    margin: 0 auto; transition: transform 0.1s;
  }
  .sos-btn:active { transform: scale(0.96); }
  .location-box {
    background: var(--light-green); border-radius: 14px;
    padding: 16px; margin-top: 14px;
    border: 1px solid var(--border-green);
  }
`;

interface UserProfile { username: string; contact: string; email: string; displayName: string; }
interface NotifSettings { sms: boolean; location: boolean; alerts: boolean; }

const Dashboard: React.FC = () => {
  const history = useHistory();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'profile' | 'notifications'>('dashboard');
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [userProfile, setUserProfile] = useState<UserProfile>({ username: '', contact: '', email: '', displayName: '' });
  const [notif, setNotif] = useState<NotifSettings>({ sms: true, location: false, alerts: true });
  const [showSosAlert, setShowSosAlert] = useState(false);
  const [showSosToast, setShowSosToast] = useState(false);
  const [fallAlert, setFallAlert] = useState(false);
  const [shakeAlert, setShakeAlert] = useState(true);
  const [noMovementAlert, setNoMovementAlert] = useState(false);
  const [locationShared, setLocationShared] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('user');
    if (!stored) { history.replace('/login'); return; }
    setUserProfile(JSON.parse(stored));
  }, [history]);

  const toggleNotif = (key: keyof NotifSettings) =>
    setNotif(prev => ({ ...prev, [key]: !prev[key] }));

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

  // ── DASHBOARD ─────────────────────────────────────────────────
  const renderDashboard = () => (
    <IonContent className="sn-page">
      <div className="sn-header-band">
        <p style={{ margin: 0, fontSize: '15px', opacity: 0.85 }}>Hello,</p>
        <h2 style={{ margin: '2px 0 0', fontSize: '24px', fontWeight: 800 }}>{userProfile.displayName} 👋</h2>
        <p style={{ margin: '6px 0 0', fontSize: '14px', opacity: 0.75 }}>You are protected. Stay safe.</p>
      </div>

      <div style={{ padding: '0 16px 32px' }}>

        {/* SOS */}
        <div style={{ textAlign: 'center', padding: '28px 0 8px' }}>
          <button className="sos-btn" onClick={() => setShowSosAlert(true)}>
            <IonIcon icon={warningOutline} style={{ fontSize: '36px', marginBottom: '4px' }} />
            SOS
          </button>
          <p style={{ color: 'var(--soft-green)', fontSize: '14px', marginTop: '12px' }}>
            Press for emergency help
          </p>
        </div>

        <IonAlert
          isOpen={showSosAlert}
          onDidDismiss={() => setShowSosAlert(false)}
          header="Send Emergency Alert?"
          message="Your location will be shared with your emergency contacts right away."
          buttons={[
            { text: 'Cancel', role: 'cancel' },
            {
              text: 'Yes, Send Help',
              handler: () => {
                console.log('[SafeNode] SOS by:', userProfile.contact, new Date().toISOString());
                setShowSosToast(true);
              }
            }
          ]}
        />
        <IonToast
          isOpen={showSosToast}
          onDidDismiss={() => setShowSosToast(false)}
          message="✅ Help is on the way! Your contacts have been alerted."
          duration={3500}
          color="success"
          position="top"
        />

        {/* Status row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '20px' }}>
          {[
            { label: 'Alerts Today', value: '3', bg: 'var(--primary-green)' },
            { label: 'You are Safe', value: '✓', bg: 'var(--soft-green)' },
          ].map((s, i) => (
            <div key={i} style={{
              background: s.bg, borderRadius: '16px', padding: '18px 14px',
              color: 'white', textAlign: 'center'
            }}>
              <p style={{ margin: 0, fontSize: '13px', opacity: 0.85 }}>{s.label}</p>
              <h3 style={{ margin: '4px 0 0', fontSize: '28px', fontWeight: 800 }}>{s.value}</h3>
            </div>
          ))}
        </div>

        {/* Safety Features */}
        <p className="sn-section-label">Safety Features</p>
        <IonCard className="sn-card">
          <IonCardContent style={{ padding: '4px 16px' }}>
            {[
              { label: 'Fall Alert', desc: 'Alerts if you fall suddenly', icon: bodyOutline, iconBg: '#fce4ec', iconColor: '#c62828', checked: fallAlert, set: setFallAlert },
              { label: 'Shake to Alert', desc: 'Shake your phone to call for help', icon: phonePortraitOutline, iconBg: '#fff8e1', iconColor: '#f57f17', checked: shakeAlert, set: setShakeAlert },
              { label: 'No Movement Alert', desc: 'Alerts if no movement for a while', icon: timeOutline, iconBg: 'var(--light-green)', iconColor: 'var(--primary-green)', checked: noMovementAlert, set: setNoMovementAlert },
            ].map((item, i) => (
              <div key={i} className="sn-toggle-row">
                <div className="sn-icon-wrap" style={{ background: item.iconBg }}>
                  <IonIcon icon={item.icon} style={{ fontSize: '22px', color: item.iconColor }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: '16px', color: 'var(--dark-green)' }}>{item.label}</p>
                  <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--soft-green)' }}>{item.desc}</p>
                </div>
                <IonToggle checked={item.checked} onIonChange={() => item.set((p: boolean) => !p)} color="success" />
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
              onClick={() => setLocationShared(true)}
              style={{
                '--background': locationShared ? 'var(--mid-green)' : 'var(--primary-green)',
                '--border-radius': '12px',
                height: '50px', fontSize: '16px', fontWeight: 700
              }}
            >
              <IonIcon icon={navigateOutline} slot="start" />
              {locationShared ? 'Location Shared' : 'Share My Location'}
            </IonButton>
            {locationShared && (
              <div className="location-box">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <IonIcon icon={checkmarkCircleOutline} style={{ color: 'var(--primary-green)', fontSize: '20px' }} />
                  <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--dark-green)' }}>Location Shared</span>
                </div>
                <p style={{ margin: 0, fontSize: '14px', color: 'var(--soft-green)' }}>
                  Last updated: <strong>Just now</strong>
                </p>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--soft-green)' }}>
                  Your contacts can see your location
                </p>
              </div>
            )}
          </IonCardContent>
        </IonCard>

        {/* Recent Activity */}
        <p className="sn-section-label">Recent Activity</p>
        <IonCard className="sn-card">
          <IonCardContent style={{ padding: '4px 16px' }}>
            {[
              { color: 'var(--mid-green)', text: 'You are connected and safe', time: '2m ago' },
              { color: '#f59e0b', text: 'Location shared with contacts', time: '15m ago' },
              { color: '#3b82f6', text: 'SMS alert was sent', time: '1h ago' },
              { color: '#ef5350', text: 'Unknown access blocked', time: '3h ago' },
            ].map((item, i) => (
              <div key={i} className="sn-activity-row">
                <div className="sn-dot" style={{ backgroundColor: item.color }} />
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: '15px', color: 'var(--dark-green)' }}>{item.text}</p>
                </div>
                <span style={{ fontSize: '12px', color: '#aaa', whiteSpace: 'nowrap' }}>{item.time}</span>
              </div>
            ))}
          </IonCardContent>
        </IonCard>

      </div>
    </IonContent>
  );

  // ── PROFILE ───────────────────────────────────────────────────
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

  // ── NOTIFICATIONS ─────────────────────────────────────────────
  const renderNotifications = () => (
    <IonContent className="sn-page">
      <div className="sn-header-band">
        <h2 style={{ margin: 0, fontWeight: 800, fontSize: '22px' }}>Alert Settings</h2>
        <p style={{ margin: '4px 0 0', fontSize: '14px', opacity: 0.8 }}>Choose how SafeNode contacts you</p>
      </div>

      <div style={{ padding: '0 16px 32px' }}>
        <p className="sn-section-label">How to Reach You</p>
        <IonCard className="sn-card">
          <IonCardContent style={{ padding: '4px 16px' }}>
            {([
              { key: 'sms' as const, icon: chatbubbleOutline, iconBg: 'var(--light-green)', iconColor: 'var(--primary-green)', label: 'Text Message (SMS)', desc: 'Get alerts as a text on your phone' },
              { key: 'alerts' as const, icon: alertCircleOutline, iconBg: '#fff3e0', iconColor: '#e65100', label: 'Emergency Alerts', desc: 'Urgent safety notifications' },
              { key: 'location' as const, icon: locationOutline, iconBg: '#fce4ec', iconColor: '#c62828', label: 'Share My Location', desc: 'Let contacts know where you are' },
            ]).map(item => (
              <div key={item.key} className="sn-toggle-row">
                <div className="sn-icon-wrap" style={{ background: item.iconBg }}>
                  <IonIcon icon={item.icon} style={{ fontSize: '22px', color: item.iconColor }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: '16px', color: 'var(--dark-green)' }}>{item.label}</p>
                  <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--soft-green)' }}>{item.desc}</p>
                </div>
                <IonToggle checked={notif[item.key]} onIonChange={() => toggleNotif(item.key)} color="success" />
              </div>
            ))}
          </IonCardContent>
        </IonCard>

        <IonButton
          expand="block"
          onClick={() => { setSaveMsg('Settings saved!'); setTimeout(() => setSaveMsg(''), 2500); }}
          style={{ '--background': 'var(--primary-green)', '--border-radius': '14px', height: '52px', fontSize: '17px', fontWeight: 700, marginTop: '8px' }}
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

  return (
    <IonPage>
      <style>{styles}</style>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle style={{ fontWeight: 800, fontSize: '20px' }}>🛡️ SafeNode</IonTitle>
        </IonToolbar>
      </IonHeader>

      {activeTab === 'dashboard' && renderDashboard()}
      {activeTab === 'profile' && renderProfile()}
      {activeTab === 'notifications' && renderNotifications()}

      <IonTabBar slot="bottom">
        <IonTabButton tab="dashboard" selected={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')}>
          <IonIcon icon={homeOutline} />
          <IonLabel>Home</IonLabel>
        </IonTabButton>
        <IonTabButton tab="notifications" selected={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')}>
          <IonIcon icon={notificationsOutline} />
          <IonLabel>Alerts</IonLabel>
          {notif.sms && <IonBadge color="danger">3</IonBadge>}
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
