import React, { useState } from 'react';
import {
  IonPage, IonContent, IonInput, IonItem, IonLabel,
  IonButton, IonText
} from '@ionic/react';
import { useHistory } from 'react-router-dom';

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
`;

const Login: React.FC = () => {
  const history = useHistory();
  const [contact, setContact] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'otp' | 'password'>('otp');

  const handleOtpInput = (index: number, value: string) => {
    if (value.length > 1 || !/^\d*$/.test(value)) return;
    const n = [...otp]; n[index] = value; setOtp(n);
    if (value && index < 5)
      (document.getElementById(`otp-${index + 1}`) as HTMLInputElement)?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const n = [...otp];
      if (otp[index]) { n[index] = ''; setOtp(n); }
      else if (index > 0) {
        n[index - 1] = ''; setOtp(n);
        (document.getElementById(`otp-${index - 1}`) as HTMLInputElement)?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0)
      (document.getElementById(`otp-${index - 1}`) as HTMLInputElement)?.focus();
    else if (e.key === 'ArrowRight' && index < 5)
      (document.getElementById(`otp-${index + 1}`) as HTMLInputElement)?.focus();
  };

  const handleLogin = () => {
    if (!contact) { setError('Contact number is required'); return; }
    if (contact.length < 10) { setError('Enter a valid contact number'); return; }
    if (loginMethod === 'otp' && otp.join('').length !== 6) {
      setError('Please enter all 6 OTP digits'); return;
    }
    if (loginMethod === 'password' && !password) {
      setError('Please enter your password'); return;
    }
    setError(''); setLoading(true);

    setTimeout(() => {
      setLoading(false);
      // Store user info and navigate to dashboard
      sessionStorage.setItem('user', JSON.stringify({
        username: `user_${contact.slice(-4)}`,
        displayName: `User ${contact.slice(-4)}`,
        contact,
        email: `user${contact.slice(-4)}@safenode.app`
      }));
      history.push('/dashboard');
    }, 1500);
  };

  return (
    <IonPage>
      <style>{styles}</style>
      <IonContent className="ion-padding">
        <div style={{ textAlign: 'center', marginTop: '60px', marginBottom: '40px' }}>
          <div style={{ fontSize: '52px', marginBottom: '8px' }}>🛡️</div>
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
                  style={{
                    width: '46px', height: '52px', fontSize: '22px', fontWeight: 'bold',
                    textAlign: 'center', border: '2px solid #ddd', borderRadius: '10px', outline: 'none'
                  }} placeholder="·" />
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
};

export default Login;
