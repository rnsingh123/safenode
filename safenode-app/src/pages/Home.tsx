import React, { useState } from 'react';
import {
  IonPage, IonContent, IonInput, IonItem, IonLabel, IonButton, IonText,
  IonTabBar, IonTabButton, IonIcon, IonHeader, IonToolbar, IonTitle,
  IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonToggle,
  IonList, IonNote, IonBadge, IonChip, IonSelect, IonSelectOption, IonAlert
} from '@ionic/react';
import {
  homeOutline, personOutline, notificationsOutline, shieldCheckmarkOutline,
  locationOutline, chatbubbleOutline, mailOutline, pencilOutline,
  checkmarkCircle, alertCircleOutline, wifiOutline, logOutOutline,
  keyOutline, personCircleOutline, callOutline
} from 'ionicons/icons';

const styles = `
  @keyframes dotRun {
    0%, 20% { transform: translateX(-10px); opacity: 0; }
    50% { opacity: 1; }
    80%, 100% { transform: translateX(20px); opacity: 0; }
  }
  .loading-dot {
    display: inline-block; width: 8px; height: 8px; border-radius: 50%;
    background-color: #3b82f6; margin: 0 4px; animation: dotRun 1.4s infinite;
  }
  .loading-dot:nth-child(1) { animation-delay: 0s; }
  .loading-dot:nth-child(2) { animation-delay: 0.2s; }
  .loading-dot:nth-child(3) { animation-delay: 0.4s; }
  .grad-blue { background: linear-gradient(135deg,#4facfe,#00f2fe); }
  .grad-green { background: linear-gradient(135deg,#11998e,#38ef7d); }
  .grad-red { background: linear-gradient(135deg,#f093fb,#f5576c); }
  .grad-purple { background: linear-gradient(135deg,#667eea,#764ba2); }
  .stat-card { border-radius:16px; padding:20px; color:white; margin-bottom:12px; }
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
`;

interface UserProfile { username: string; contact: string; email: string; displayName: string; }
interface NotifSettings { sms: boolean; location: boolean; push: boolean; email: boolean; alerts: boolean; marketing: boolean; }

const Home: React.FC = () => {
  const [contact, setContact] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'otp' | 'password'>('otp');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'profile' | 'notifications'>('dashboard');
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [userProfile, setUserProfile] = useState<UserProfile>({ username: '', contact: '', email: '', displayName: '' });
  const [notif, setNotif] = useState<NotifSettings>({ sms: true, location: false, push: true, email: true, alerts: true, marketing: false });

  const handleOtpInput = (index: number, value: string) => {
    if (value.length > 1 || !/^\d*$/.test(value)) return;
    const n = [...otp]; n[index] = value; setOtp(n);
    if (value && index < 5) (document.getElementById(`otp-${index + 1}`) as HTMLInputElement)?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const n = [...otp];
      if (otp[index]) { n[index] = ''; setOtp(n); }
      else if (index > 0) { n[index - 1] = ''; setOtp(n); (document.getElementById(`otp-${index - 1}`) as HTMLInputElement)?.focus(); }
    } else if (e.key === 'ArrowLeft' && index > 0) (document.getElementById(`otp-${index - 1}`) as HTMLInputElement)?.focus();
    else if (e.key === 'ArrowRight' && index < 5) (document.getElementById(`otp-${index + 1}`) as HTMLInputElement)?.focus();
  };

  const handleLogin = () => {
    if (!contact) { setError('Contact number is required'); return; }
    if (contact.length < 10) { setError('Enter a valid contact number'); return; }
    if (loginMethod === 'otp' && otp.join('').length !== 6) { setError('Please enter all 6 OTP digits'); return; }
    if (loginMethod === 'password' && !password) { setError('Please enter your password'); return; }
    setError(''); setLoading(true);
    setTimeout(() => {
      setLoading(false); setIsLoggedIn(true);
      setUserProfile({ username: `user_${contact.slice(-4)}`, displayName: `User ${contact.slice(-4)}`, contact, email: `user${contact.slice(-4)}@safenode.app` });
    }, 1500);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserProfile({ username: '', contact: '', email: '', displayName: '' });
    setContact(''); setPassword(''); setOtp(['', '', '', '', '', '']); setActiveTab('dashboard');
  };

  const toggleNotif = (key: keyof NotifSettings) => setNotif(prev => ({ ...prev, [key]: !prev[key] }));

  const saveDisplayName = () => {
    if (tempName.trim()) setUserProfile(prev => ({ ...prev, displayName: tempName.trim() }));
    setEditingName(false);
  };

  // LOGIN SCREEN
  if (!isLoggedIn) {
    return (
      <IonPage>
        <style>{styles}</style>
        <IonContent className="ion-padding">
          <div style={{ textAlign: 'center', marginTop: '60px', marginBottom: '40px' }}>
            <div style={{ fontSize: '48px', marginBottom: '8px' }}>🛡️</div>
            <h1 style={{ margin: 0, fontWeight: 800, fontSize: '28px' }}>SafeNode</h1>
            <p style={{ color: '#888', margin: '4px 0 0' }}>Secure Login</p>
          </div>

          <IonItem>
            <IonLabel position="floating">Contact Number</IonLabel>
            <IonInput type="tel" value={contact} onIonChange={e => setContact(e.detail.value!)} />
          </IonItem>

          <div style={{ marginTop: '20px', marginBottom: '20px', textAlign: 'center' }}>
            <p style={{ color: '#666', marginBottom: '10px', fontSize: '14px' }}>Login Method</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              {(['otp', 'password'] as const).map(m => (
                <button key={m} onClick={() => setLoginMethod(m)} style={{
                  padding: '8px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold',
                  backgroundColor: loginMethod === m ? '#3b82f6' : '#e5e7eb',
                  color: loginMethod === m ? 'white' : '#333'
                }}>{m === 'otp' ? 'OTP' : 'Password'}</button>
              ))}
            </div>
          </div>

          {loginMethod === 'otp' ? (
            <div style={{ marginBottom: '10px' }}>
              <p style={{ textAlign: 'center', color: '#999', marginBottom: '15px', fontSize: '14px' }}>Enter 6-digit OTP</p>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                {otp.map((digit, i) => (
                  <input key={i} id={`otp-${i}`} type="text" inputMode="numeric" maxLength={1}
                    value={digit} onChange={e => handleOtpInput(i, e.currentTarget.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)} autoFocus={i === 0}
                    style={{ width: '46px', height: '52px', fontSize: '22px', fontWeight: 'bold', textAlign: 'center', border: '2px solid #ddd', borderRadius: '10px', outline: 'none' }}
                    placeholder="·" />
                ))}
              </div>
            </div>
          ) : (
            <IonItem style={{ marginTop: '10px' }}>
              <IonLabel position="floating">Password</IonLabel>
              <IonInput type="password" value={password} onIonChange={e => setPassword(e.detail.value!)} />
            </IonItem>
          )}

          {error && <IonText color="danger"><p style={{ textAlign: 'center', marginTop: '10px' }}>{error}</p></IonText>}
          {loading && (
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <div className="loading-dot" /><div className="loading-dot" /><div className="loading-dot" />
            </div>
          )}
          <IonButton expand="block" style={{ marginTop: '20px' }} onClick={handleLogin} disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </IonButton>
        </IonContent>
      </IonPage>
    );
  }

  // DASHBOARD TAB
  const renderDashboard = () => (
    <IonContent className="ion-padding">
      <div style={{ marginBottom: '20px' }}>
        <p style={{ color: '#888', margin: 0, fontSize: '14px' }}>Good day,</p>
        <h2 style={{ margin: '2px 0 0', fontWeight: 700 }}>{userProfile.displayName} 👋</h2>
      </div>

      <div className="stat-card grad-blue">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ margin: 0, opacity: 0.8, fontSize: '13px' }}>Node Status</p>
            <h3 style={{ margin: '4px 0 0', fontSize: '22px' }}>Active</h3>
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

      <IonCard style={{ borderRadius: '16px', marginTop: '16px' }}>
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

      <IonCard style={{ borderRadius: '16px' }}>
        <IonCardHeader><IonCardTitle style={{ fontSize: '16px' }}>Quick Status</IonCardTitle></IonCardHeader>
        <IonCardContent>
          {[
            { label: 'SMS Alerts', active: notif.sms, icon: chatbubbleOutline },
            { label: 'Location Tracking', active: notif.location, icon: locationOutline },
            { label: 'Push Notifications', active: notif.push, icon: notificationsOutline },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <IonIcon icon={item.icon} style={{ fontSize: '18px', color: '#666' }} />
              <span style={{ flex: 1, fontSize: '14px' }}>{item.label}</span>
              <IonChip color={item.active ? 'success' : 'medium'} style={{ fontSize: '11px', height: '22px' }}>
                {item.active ? 'ON' : 'OFF'}
              </IonChip>
            </div>
          ))}
        </IonCardContent>
      </IonCard>
    </IonContent>
  );


  // PROFILE TAB
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
        buttons={[{ text: 'Cancel', role: 'cancel' }, { text: 'Logout', role: 'destructive', handler: handleLogout }]} />
    </IonContent>
  );

  // NOTIFICATIONS TAB
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
        {saveMsg && <IonText color="success"><p style={{ textAlign: 'center', marginTop: '8px', fontWeight: 'bold' }}>✓ {saveMsg}</p></IonText>}
      </div>
    </IonContent>
  );

  // MAIN LAYOUT
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

export default Home;
