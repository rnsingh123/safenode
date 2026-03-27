import React, { useState, useEffect } from 'react';
import {
  IonPage, IonContent, IonHeader, IonToolbar, IonTitle,
  IonTabBar, IonTabButton, IonIcon, IonLabel, IonCard, IonCardContent,
  IonCardHeader, IonCardTitle, IonToggle, IonList, IonItem, IonNote,
  IonBadge, IonChip, IonSelect, IonSelectOption, IonAlert, IonButton, IonText,
  IonToast
} from '@ionic/react';
import {
  homeOutline, personOutline, notificationsOutline, shieldCheckmarkOutline,
  locationOutline, chatbubbleOutline, mailOutline, pencilOutline,
  checkmarkCircle, alertCircleOutline, wifiOutline, logOutOutline,
  keyOutline, personCircleOutline, callOutline, warningOutline,
  navigateOutline, bodyOutline, phonePortraitOutline, timeOutline
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';

const styles = `
  .grad-blue  { background: linear-gradient(135deg,#4facfe,#00f2fe); }
  .grad-green { background: linear-gradient(135deg,#11998e,#38ef7d); }
  .grad-red   { background: linear-gradient(135deg,#f093fb,#f5576c); }
  .grad-purple{ background: linear-gradient(135deg,#667eea,#764ba2); }
  .stat-card  { border-radius:16px; padding:20px; color:white; margin-bottom:12px; }
  .avatar-circle {
    width:80px; height:80px; border-radius:50%;
    background:linear-gradient(135deg,#667eea,#764ba2);
    display:flex; align-items:center; justify-content:center;
    font-size:32px; color:white; margin:0 auto 12px;
  }
  .section-title {
    font-size:13px; font-weight:700; color:#888;
    text-transform:uppercase; letter-spacing:1px; padding:16px 16px 8px;
  }
  .notif-row {
    display:flex; align-items:center; justify-content:space-between;
    padding:14px 16px; border-bottom:1px solid #f0f0f0;
  }
  .activity-item {
    display:flex; align-items:center; gap:12px;
    padding:12px 0; border-bottom:1px solid #f5f5f5;
  }
  .activity-dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; }
  .tab-btn-active ion-icon, .tab-btn-active ion-label { color: var(--ion-color-primary) !important; }
`;

interface UserProfile { username: string; contact: string; email: string; displayName: string; }
interface NotifSettings { sms: boolean; location: boolean; push: boolean; email: boolean; alerts: boolean; marketing: boolean; }

const Dashboard: React.FC = () => {
  const history = useHistory();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'profile' | 'notifications'>('dashboard');
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [userProfile, setUserProfile] = useState<UserProfile>({
    username: '', contact: '', email: '', displayName: ''
  });
  const [notif, setNotif] = useState<NotifSettings>({
    sms: true, location: false, push: true, email: true, alerts: true, marketing: false
  });

  // SOS state
  const [showSosAlert, setShowSosAlert] = useState(false);
  const [showSosToast, setShowSosToast] = useState(false);

  // Safety features state
  const [fallDetection, setFallDetection] = useState(false);
  const [shakeDetection, setShakeDetection] = useState(true);
  const [inactivityMonitor, setInactivityMonitor] = useState(false);

  // Location state
  const [locationShared, setLocationShared] = useState(false);
  const dummyCoords = { lat: '28.6139° N', lng: '77.2090° E', accuracy: '±5m', updated: 'Just now' };

  // Load user from session on mount
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

  // ── DASHBOARD TAB ──────────────────────────────────────────────
  const renderDashboard = () => (
    <IonContent className="ion-padding">

      {/* ── SOS BUTTON ── */}
      <div style={{ textAlign: 'center', margin: '8px 0 24px' }}>
        <button
          onClick={() => setShowSosAlert(true)}
          style={{
            width: '130px', height: '130px', borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 35%, #ff6b6b, #c0392b)',
            border: '6px solid #ff4444',
            boxShadow: '0 0 0 6px rgba(255,68,68,0.2), 0 8px 24px rgba(192,57,43,0.5)',
            color: 'white', fontSize: '28px', fontWeight: 900,
            cursor: 'pointer', letterSpacing: '2px',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', margin: '0 auto'
          }}
        >
          <IonIcon icon={warningOutline} style={{ fontSize: '32px', marginBottom: '4px' }} />
          SOS
        </button>
        <p style={{ color: '#888', fontSize: '12px', marginTop: '10px' }}>Tap to send emergency alert</p>
      </div>

      {/* SOS Confirmation Alert */}
      <IonAlert
        isOpen={showSosAlert}
        onDidDismiss={() => setShowSosAlert(false)}
        header="🚨 Emergency SOS"
        message="This will immediately alert your emergency contacts with your location. Continue?"
        buttons={[
          { text: 'Cancel', role: 'cancel' },
          {
            text: 'Send Alert', cssClass: 'alert-button-danger',
            handler: () => {
              console.log('[SafeNode] SOS triggered by:', userProfile.contact, '| Time:', new Date().toISOString());
              setShowSosToast(true);
            }
          }
        ]}
      />

      {/* SOS Success Toast */}
      <IonToast
        isOpen={showSosToast}
        onDidDismiss={() => setShowSosToast(false)}
        message="🚨 Emergency alert sent to your contacts!"
        duration={3000}
        color="danger"
        position="top"
      />

      {/* ── NODE STATUS ── */}
      <div className="stat-card grad-blue">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ margin: 0, opacity: 0.8, fontSize: '13px' }}>Good day, {userProfile.displayName} 👋</p>
            <h3 style={{ margin: '4px 0 0', fontSize: '20px' }}>Node Active</h3>
          </div>
          <IonIcon icon={wifiOutline} style={{ fontSize: '36px', opacity: 0.8 }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
        <div className="stat-card grad-green" style={{ marginBottom: 0 }}>
          <p style={{ margin: 0, opacity: 0.8, fontSize: '12px' }}>Alerts Today</p>
          <h3 style={{ margin: '4px 0 0', fontSize: '26px' }}>3</h3>
        </div>
        <div className="stat-card grad-red" style={{ marginBottom: 0 }}>
          <p style={{ margin: 0, opacity: 0.8, fontSize: '12px' }}>Incidents</p>
          <h3 style={{ margin: '4px 0 0', fontSize: '26px' }}>1</h3>
        </div>
      </div>

      {/* ── SAFETY FEATURES ── */}
      <IonCard style={{ borderRadius: '16px', marginTop: '4px' }}>
        <IonCardHeader><IonCardTitle style={{ fontSize: '16px' }}>🛡️ Safety Features</IonCardTitle></IonCardHeader>
        <IonCardContent style={{ padding: 0 }}>
          <IonList lines="inset">
            <IonItem>
              <IonIcon icon={bodyOutline} slot="start" color="danger" />
              <IonLabel>
                <h3>Fall Detection</h3>
                <p style={{ fontSize: '12px', color: '#888' }}>Auto-alert on sudden fall</p>
              </IonLabel>
              <IonToggle
                checked={fallDetection}
                onIonChange={() => setFallDetection(p => !p)}
                color="danger"
                slot="end"
              />
            </IonItem>
            <IonItem>
              <IonIcon icon={phonePortraitOutline} slot="start" color="warning" />
              <IonLabel>
                <h3>Shake Detection</h3>
                <p style={{ fontSize: '12px', color: '#888' }}>Trigger SOS by shaking device</p>
              </IonLabel>
              <IonToggle
                checked={shakeDetection}
                onIonChange={() => setShakeDetection(p => !p)}
                color="warning"
                slot="end"
              />
            </IonItem>
            <IonItem lines="none">
              <IonIcon icon={timeOutline} slot="start" color="primary" />
              <IonLabel>
                <h3>Inactivity Monitoring</h3>
                <p style={{ fontSize: '12px', color: '#888' }}>Alert if no activity detected</p>
              </IonLabel>
              <IonToggle
                checked={inactivityMonitor}
                onIonChange={() => setInactivityMonitor(p => !p)}
                color="primary"
                slot="end"
              />
            </IonItem>
          </IonList>
        </IonCardContent>
      </IonCard>

      {/* ── LOCATION ── */}
      <IonCard style={{ borderRadius: '16px' }}>
        <IonCardHeader><IonCardTitle style={{ fontSize: '16px' }}>📍 My Location</IonCardTitle></IonCardHeader>
        <IonCardContent>
          <IonButton
            expand="block"
            color={locationShared ? 'success' : 'primary'}
            onClick={() => setLocationShared(true)}
          >
            <IonIcon icon={navigateOutline} slot="start" />
            {locationShared ? 'Location Shared ✓' : 'Send My Location'}
          </IonButton>

          {locationShared && (
            <div style={{
              marginTop: '14px', background: '#f8f9fa', borderRadius: '12px',
              padding: '14px', fontSize: '13px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#888' }}>Latitude</span>
                <span style={{ fontWeight: 600 }}>{dummyCoords.lat}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#888' }}>Longitude</span>
                <span style={{ fontWeight: 600 }}>{dummyCoords.lng}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#888' }}>Accuracy</span>
                <span style={{ fontWeight: 600 }}>{dummyCoords.accuracy}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#888' }}>Updated</span>
                <IonText color="success"><span style={{ fontWeight: 600 }}>{dummyCoords.updated}</span></IonText>
              </div>
            </div>
          )}
        </IonCardContent>
      </IonCard>

      {/* ── RECENT ACTIVITY ── */}
      <IonCard style={{ borderRadius: '16px' }}>
        <IonCardHeader><IonCardTitle style={{ fontSize: '16px' }}>Recent Activity</IonCardTitle></IonCardHeader>
        <IonCardContent>
          {[
            { color: '#22c55e', text: 'Node connected successfully', time: '2m ago' },
            { color: '#f59e0b', text: 'Location ping received', time: '15m ago' },
            { color: '#3b82f6', text: 'SMS alert sent', time: '1h ago' },
            { color: '#ef4444', text: 'Unauthorized access attempt', time: '3h ago' },
          ].map((item, i) => (
            <div key={i} className="activity-item">
              <div className="activity-dot" style={{ backgroundColor: item.color }} />
              <div style={{ flex: 1 }}><p style={{ margin: 0, fontSize: '14px' }}>{item.text}</p></div>
              <span style={{ fontSize: '12px', color: '#aaa' }}>{item.time}</span>
            </div>
          ))}
        </IonCardContent>
      </IonCard>

    </IonContent>
  );

  // ── PROFILE TAB ────────────────────────────────────────────────
  const renderProfile = () => (
    <IonContent>
      <div className="grad-purple" style={{ padding: '40px 20px 30px', textAlign: 'center' }}>
        <div className="avatar-circle">{userProfile.displayName.charAt(0).toUpperCase() || '?'}</div>
        {editingName ? (
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
            <input value={tempName} onChange={e => setTempName(e.target.value)} autoFocus
              onKeyDown={e => e.key === 'Enter' && saveDisplayName()}
              style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', fontSize: '16px', width: '160px' }} />
            <button onClick={saveDisplayName}
              style={{ background: 'rgba(255,255,255,0.3)', border: 'none', borderRadius: '8px', padding: '6px 10px', color: 'white', cursor: 'pointer' }}>✓</button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <h2 style={{ color: 'white', margin: 0, fontWeight: 700 }}>{userProfile.displayName}</h2>
            <button onClick={() => { setTempName(userProfile.displayName); setEditingName(true); }}
              style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer' }}>
              <IonIcon icon={pencilOutline} style={{ color: 'white', fontSize: '14px' }} />
            </button>
          </div>
        )}
        <p style={{ color: 'rgba(255,255,255,0.7)', margin: '4px 0 0', fontSize: '14px' }}>@{userProfile.username}</p>
      </div>

      <div className="section-title">Account Info</div>
      <IonList>
        <IonItem>
          <IonIcon icon={callOutline} slot="start" color="primary" />
          <IonLabel>
            <p style={{ fontSize: '12px', color: '#888' }}>Contact Number</p>
            <h3>{userProfile.contact}</h3>
          </IonLabel>
          <IonBadge color="success" slot="end">Verified</IonBadge>
        </IonItem>
        <IonItem>
          <IonIcon icon={mailOutline} slot="start" color="primary" />
          <IonLabel>
            <p style={{ fontSize: '12px', color: '#888' }}>Email</p>
            <h3>{userProfile.email}</h3>
          </IonLabel>
        </IonItem>
        <IonItem>
          <IonIcon icon={personCircleOutline} slot="start" color="primary" />
          <IonLabel>
            <p style={{ fontSize: '12px', color: '#888' }}>Username</p>
            <h3>@{userProfile.username}</h3>
          </IonLabel>
        </IonItem>
      </IonList>

      <div className="section-title">Security</div>
      <IonList>
        <IonItem button detail>
          <IonIcon icon={keyOutline} slot="start" color="warning" />
          <IonLabel>Change Password</IonLabel>
        </IonItem>
        <IonItem button detail>
          <IonIcon icon={shieldCheckmarkOutline} slot="start" color="success" />
          <IonLabel>Two-Factor Authentication</IonLabel>
          <IonNote slot="end" color="success">Enabled</IonNote>
        </IonItem>
      </IonList>

      <div style={{ padding: '20px 16px' }}>
        <IonButton expand="block" color="danger" fill="outline" onClick={() => setShowLogoutAlert(true)}>
          <IonIcon icon={logOutOutline} slot="start" />
          Logout
        </IonButton>
      </div>

      <IonAlert isOpen={showLogoutAlert} onDidDismiss={() => setShowLogoutAlert(false)}
        header="Logout" message="Are you sure you want to logout?"
        buttons={[
          { text: 'Cancel', role: 'cancel' },
          { text: 'Logout', role: 'destructive', handler: handleLogout }
        ]} />
    </IonContent>
  );

  // ── NOTIFICATIONS TAB ──────────────────────────────────────────
  const renderNotifications = () => (
    <IonContent>
      <div style={{ padding: '20px 16px 8px' }}>
        <h2 style={{ margin: 0, fontWeight: 700 }}>Notification Settings</h2>
        <p style={{ color: '#888', fontSize: '14px', margin: '4px 0 0' }}>Control how SafeNode reaches you</p>
      </div>

      <div className="section-title">Channels</div>
      <IonCard style={{ borderRadius: '16px', margin: '0 16px 16px' }}>
        <IonCardContent style={{ padding: 0 }}>
          {([
            { key: 'sms' as const, icon: chatbubbleOutline, color: '#22c55e', label: 'SMS Alerts', desc: 'Receive alerts via text message' },
            { key: 'push' as const, icon: notificationsOutline, color: '#3b82f6', label: 'Push Notifications', desc: 'In-app and device notifications' },
            { key: 'email' as const, icon: mailOutline, color: '#f59e0b', label: 'Email Notifications', desc: 'Alerts sent to your email' },
          ]).map(item => (
            <div key={item.key} className="notif-row">
              <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <IonIcon icon={item.icon} style={{ fontSize: '22px', marginRight: '12px', color: item.color }} />
                <div>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: '15px' }}>{item.label}</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>{item.desc}</p>
                </div>
              </div>
              <IonToggle checked={notif[item.key]} onIonChange={() => toggleNotif(item.key)} color="primary" />
            </div>
          ))}
        </IonCardContent>
      </IonCard>

      <div className="section-title">Location & Safety</div>
      <IonCard style={{ borderRadius: '16px', margin: '0 16px 16px' }}>
        <IonCardContent style={{ padding: 0 }}>
          <div className="notif-row">
            <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <IonIcon icon={locationOutline} style={{ fontSize: '22px', marginRight: '12px', color: '#ef4444' }} />
              <div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '15px' }}>Location Tracking</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>Share your location for safety alerts</p>
              </div>
            </div>
            <IonToggle checked={notif.location} onIonChange={() => toggleNotif('location')} color="danger" />
          </div>
          <div className="notif-row">
            <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <IonIcon icon={alertCircleOutline} style={{ fontSize: '22px', marginRight: '12px', color: '#f97316' }} />
              <div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '15px' }}>Emergency Alerts</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>Critical safety notifications</p>
              </div>
            </div>
            <IonToggle checked={notif.alerts} onIonChange={() => toggleNotif('alerts')} color="warning" />
          </div>
        </IonCardContent>
      </IonCard>

      <div className="section-title">Preferences</div>
      <IonCard style={{ borderRadius: '16px', margin: '0 16px 16px' }}>
        <IonCardContent style={{ padding: 0 }}>
          <div className="notif-row">
            <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <IonIcon icon={mailOutline} style={{ fontSize: '22px', marginRight: '12px', color: '#8b5cf6' }} />
              <div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '15px' }}>Marketing & Updates</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>Product news and feature updates</p>
              </div>
            </div>
            <IonToggle checked={notif.marketing} onIonChange={() => toggleNotif('marketing')} color="secondary" />
          </div>
          <IonItem lines="none">
            <IonIcon icon={notificationsOutline} slot="start" color="medium" />
            <IonLabel>
              <p style={{ fontSize: '12px', color: '#888', margin: '0 0 4px' }}>Alert Frequency</p>
              <IonSelect value="realtime" interface="popover">
                <IonSelectOption value="realtime">Real-time</IonSelectOption>
                <IonSelectOption value="hourly">Hourly digest</IonSelectOption>
                <IonSelectOption value="daily">Daily digest</IonSelectOption>
              </IonSelect>
            </IonLabel>
          </IonItem>
        </IonCardContent>
      </IonCard>

      <div style={{ padding: '0 16px 16px' }}>
        <IonButton expand="block" onClick={() => { setSaveMsg('Settings saved!'); setTimeout(() => setSaveMsg(''), 2000); }}>
          <IonIcon icon={checkmarkCircle} slot="start" />
          Save Settings
        </IonButton>
        {saveMsg && (
          <IonText color="success">
            <p style={{ textAlign: 'center', marginTop: '8px', fontWeight: 'bold' }}>✓ {saveMsg}</p>
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
          <IonTitle>🛡️ SafeNode</IonTitle>
        </IonToolbar>
      </IonHeader>

      {activeTab === 'dashboard' && renderDashboard()}
      {activeTab === 'profile' && renderProfile()}
      {activeTab === 'notifications' && renderNotifications()}

      <IonTabBar slot="bottom">
        <IonTabButton tab="dashboard" selected={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')}>
          <IonIcon icon={homeOutline} />
          <IonLabel>Dashboard</IonLabel>
        </IonTabButton>
        <IonTabButton tab="notifications" selected={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')}>
          <IonIcon icon={notificationsOutline} />
          <IonLabel>Notifications</IonLabel>
          {(notif.sms || notif.push) && <IonBadge color="danger">3</IonBadge>}
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
