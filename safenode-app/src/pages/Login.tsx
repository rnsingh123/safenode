import React, { useState } from 'react';
import {
  IonPage, IonContent, IonInput, IonItem, IonLabel,
  IonButton, IonText
} from '@ionic/react';
import { useHistory } from 'react-router-dom';

const styles = `
  :root {
    --sn-green: #3d8b37;
    --sn-green-light: #e8f5e9;
    --sn-green-mid: #66bb6a;
  }
  @keyframes dotPulse {
    0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
    40% { transform: scale(1); opacity: 1; }
  }
  .loading-dot {
    display: inline-block; width: 10px; height: 10px; border-radius: 50%;
    background-color: #3d8b37; margin: 0 5px;
    animation: dotPulse 1.2s infinite ease-in-out;
  }
  .loading-dot:nth-child(2) { animation-delay: 0.2s; }
  .loading-dot:nth-child(3) { animation-delay: 0.4s; }
  .login-page { background: #f1f8f1; min-height: 100%; }
  .method-btn {
    padding: 12px 28px; border: 2px solid #3d8b37; border-radius: 10px;
    cursor: pointer; font-size: 16px; font-weight: 700; transition: all 0.2s;
  }
  .method-btn.active { background: #3d8b37; color: white; }
  .method-btn.inactive { background: white; color: #3d8b37; }
  .otp-box {
    width: 48px; height: 56px; font-size: 24px; font-weight: 700;
    text-align: center; border: 2px solid #a5d6a7; border-radius: 12px;
    outline: none; background: white; color: #1b5e20;
    transition: border-color 0.2s;
  }
  .otp-box:focus { border-color: #3d8b37; box-shadow: 0 0 0 3px rgba(61,139,55,0.15); }
  ion-item { --background: white; --border-radius: 12px; margin-bottom: 12px; }
  ion-input { font-size: 17px; }
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
    if (!contact) { setError('Please enter your phone number'); return; }
    if (contact.length < 10) { setError('Enter a valid 10-digit number'); return; }
    if (loginMethod === 'otp' && otp.join('').length !== 6) {
      setError('Please enter all 6 digits'); return;
    }
    if (loginMethod === 'password' && !password) {
      setError('Please enter your password'); return;
    }
    setError(''); setLoading(true);
    setTimeout(() => {
      setLoading(false);
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
      <IonContent>
        <div className="login-page" style={{ padding: '0 24px 40px' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', paddingTop: '70px', paddingBottom: '36px' }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #43a047, #1b5e20)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px', fontSize: '36px',
              boxShadow: '0 4px 16px rgba(61,139,55,0.3)'
            }}>🛡️</div>
            <h1 style={{ margin: 0, fontWeight: 800, fontSize: '30px', color: '#1b5e20' }}>SafeNode</h1>
            <p style={{ color: '#558b2f', margin: '6px 0 0', fontSize: '16px' }}>Your personal safety companion</p>
          </div>

          {/* Phone input */}
          <p style={{ fontWeight: 700, fontSize: '16px', color: '#2e7d32', margin: '0 0 8px' }}>Phone Number</p>
          <IonItem style={{ '--background': 'white', '--border-radius': '12px', '--border-color': '#a5d6a7', marginBottom: '20px' }}>
            <IonInput
              type="tel"
              value={contact}
              onIonChange={e => setContact(e.detail.value!)}
              placeholder="Enter your phone number"
              style={{ fontSize: '17px' }}
            />
          </IonItem>

          {/* Method toggle */}
          <p style={{ fontWeight: 700, fontSize: '16px', color: '#2e7d32', margin: '0 0 10px', textAlign: 'center' }}>
            How do you want to sign in?
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '24px' }}>
            <button className={`method-btn ${loginMethod === 'otp' ? 'active' : 'inactive'}`}
              onClick={() => setLoginMethod('otp')}>One-Time Code</button>
            <button className={`method-btn ${loginMethod === 'password' ? 'active' : 'inactive'}`}
              onClick={() => setLoginMethod('password')}>Password</button>
          </div>

          {/* OTP boxes */}
          {loginMethod === 'otp' ? (
            <div style={{ marginBottom: '20px' }}>
              <p style={{ textAlign: 'center', color: '#558b2f', marginBottom: '14px', fontSize: '15px' }}>
                Enter the 6-digit code sent to you
              </p>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                {otp.map((digit, i) => (
                  <input key={i} id={`otp-${i}`} type="text" inputMode="numeric" maxLength={1}
                    value={digit} onChange={e => handleOtpInput(i, e.currentTarget.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)} autoFocus={i === 0}
                    className="otp-box" placeholder="·" />
                ))}
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontWeight: 700, fontSize: '16px', color: '#2e7d32', margin: '0 0 8px' }}>Password</p>
              <IonItem style={{ '--background': 'white', '--border-radius': '12px', '--border-color': '#a5d6a7' }}>
                <IonInput type="password" value={password}
                  onIonChange={e => setPassword(e.detail.value!)}
                  placeholder="Enter your password" style={{ fontSize: '17px' }} />
              </IonItem>
            </div>
          )}

          {/* Error */}
          {error && (
            <IonText color="danger">
              <p style={{ textAlign: 'center', fontSize: '15px', margin: '0 0 12px', fontWeight: 600 }}>⚠ {error}</p>
            </IonText>
          )}

          {/* Loading */}
          {loading && (
            <div style={{ textAlign: 'center', margin: '16px 0' }}>
              <div className="loading-dot" /><div className="loading-dot" /><div className="loading-dot" />
            </div>
          )}

          {/* Login button */}
          <IonButton
            expand="block"
            onClick={handleLogin}
            disabled={loading}
            style={{ '--background': '#3d8b37', '--background-activated': '#2e7d32', '--border-radius': '14px', height: '54px', fontSize: '18px', fontWeight: 700, marginTop: '8px' }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </IonButton>

          <p style={{ textAlign: 'center', color: '#888', fontSize: '13px', marginTop: '20px' }}>
            By signing in, you agree to SafeNode's safety terms.
          </p>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;
