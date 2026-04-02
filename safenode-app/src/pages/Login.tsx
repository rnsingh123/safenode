/**
 * Login.tsx — Authentication screen
 * Logic: unchanged. UI: redesigned with new token system.
 * ── EDIT GUIDE ──────────────────────────────────────────────
 *  Colors  → src/theme/variables.css
 *  Layout  → .login-wrap padding / .login-card styles below
 *  Animations → @keyframes dotPulse / fadeSlideUp
 * ────────────────────────────────────────────────────────────
 */

import React, { useState } from 'react';
import { IonPage, IonContent, IonInput, IonItem, IonButton, IonText } from '@ionic/react';
import { useHistory } from 'react-router-dom';

/* ── [ANIMATION AREA] ── keep lightweight, CSS only ── */
const styles = `
  /* Fade + slide up — page entry */
  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  /* Loading dots */
  @keyframes dotPulse {
    0%, 80%, 100% { transform: scale(0.55); opacity: 0.35; }
    40%           { transform: scale(1);    opacity: 1; }
  }

  /* ── Page ── */
  .login-wrap {
    background: var(--clr-bg);
    min-height: 100%;
    padding: 0 var(--space-lg) 48px;
    animation: fadeSlideUp 0.4s ease both;
  }

  /* ── Logo circle ── */
  .login-logo {
    width: 88px; height: 88px; border-radius: 50%;
    background: linear-gradient(145deg, var(--clr-primary-light), var(--clr-primary));
    display: flex; align-items: center; justify-content: center;
    font-size: 40px; margin: 0 auto var(--space-md);
    box-shadow: 0 6px 24px rgba(46,125,50,0.30);
  }

  /* ── Method toggle buttons ── */
  .method-btn {
    flex: 1; padding: 13px 0;
    border: 2px solid var(--clr-primary-border);
    border-radius: var(--radius-sm);
    font-size: var(--font-md); font-weight: 700;
    cursor: pointer; transition: background 0.18s, color 0.18s, border-color 0.18s;
    background: var(--clr-surface);
    color: var(--clr-primary);
  }
  .method-btn.active {
    background: var(--clr-primary);
    color: #fff;
    border-color: var(--clr-primary);
  }

  /* ── OTP boxes ── */
  .otp-box {
    width: 48px; height: 58px; font-size: 26px; font-weight: 800;
    text-align: center;
    border: 2px solid var(--clr-primary-border);
    border-radius: var(--radius-sm);
    background: var(--clr-surface);
    color: var(--clr-text-primary);
    outline: none; transition: border-color 0.18s, box-shadow 0.18s;
  }
  .otp-box:focus {
    border-color: var(--clr-primary);
    box-shadow: 0 0 0 3px rgba(46,125,50,0.15);
  }

  /* ── Loading dots ── */
  .loading-dot {
    display: inline-block; width: 10px; height: 10px; border-radius: 50%;
    background: var(--clr-primary); margin: 0 5px;
    animation: dotPulse 1.2s infinite ease-in-out;
  }
  .loading-dot:nth-child(2) { animation-delay: 0.2s; }
  .loading-dot:nth-child(3) { animation-delay: 0.4s; }

  /* ── Input item overrides ── */
  .login-wrap ion-item {
    --background: var(--clr-surface);
    --border-radius: var(--radius-sm);
    --border-color: var(--clr-primary-border);
    --highlight-color-focused: var(--clr-primary);
    border-radius: var(--radius-sm);
    box-shadow: var(--shadow-sm);
    margin-bottom: var(--space-sm);
  }
`;

const Login: React.FC = () => {
  const history = useHistory();
  const [contact, setContact]         = useState('');
  const [otp, setOtp]                 = useState(['', '', '', '', '', '']);
  const [password, setPassword]       = useState('');
  const [error, setError]             = useState('');
  const [loading, setLoading]         = useState(false);
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

  /* ── [AUTH LOGIC — do not edit] ── */
  const handleLogin = () => {
    if (!contact)                                          { setError('Please enter your phone number'); return; }
    if (contact.length < 10)                               { setError('Enter a valid 10-digit number'); return; }
    if (loginMethod === 'otp' && otp.join('').length !== 6){ setError('Please enter all 6 digits'); return; }
    if (loginMethod === 'password' && !password)           { setError('Please enter your password'); return; }
    setError(''); setLoading(true);
    setTimeout(() => {
      setLoading(false);
      sessionStorage.setItem('user', JSON.stringify({
        username:    `user_${contact.slice(-4)}`,
        displayName: `User ${contact.slice(-4)}`,
        contact,
        email:       `user${contact.slice(-4)}@safenode.app`
      }));
      console.log('[LOGIN] authenticated | method:', loginMethod);
      history.push('/dashboard');
    }, 1500);
  };

  return (
    <IonPage>
      <style>{styles}</style>
      <IonContent>
        <div className="login-wrap">

          {/* ── [HEADER] ── logo + title ── */}
          <div style={{ textAlign: 'center', paddingTop: '64px', paddingBottom: '36px' }}>
            <div className="login-logo">🛡️</div>
            <h1 style={{ margin: 0, fontWeight: 800, fontSize: 'var(--font-hero)', color: 'var(--clr-text-primary)', letterSpacing: '-0.5px' }}>
              SafeNode
            </h1>
            <p style={{ color: 'var(--clr-text-secondary)', margin: '6px 0 0', fontSize: 'var(--font-md)' }}>
              Your personal safety companion
            </p>
          </div>

          {/* ── [INPUT] phone number ── */}
          <p style={{ fontWeight: 700, fontSize: 'var(--font-sm)', color: 'var(--clr-text-secondary)', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Phone Number
          </p>
          <IonItem>
            <IonInput
              type="tel"
              value={contact}
              onIonChange={e => setContact(e.detail.value!)}
              placeholder="Enter your phone number"
              style={{ fontSize: 'var(--font-lg)', fontWeight: 600 }}
            />
          </IonItem>

          {/* ── [METHOD TOGGLE] ── */}
          <p style={{ fontWeight: 700, fontSize: 'var(--font-sm)', color: 'var(--clr-text-secondary)', margin: 'var(--space-lg) 0 var(--space-sm)', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Sign in with
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)' }}>
            <button className={`method-btn ${loginMethod === 'otp' ? 'active' : ''}`}
              onClick={() => setLoginMethod('otp')}>One-Time Code</button>
            <button className={`method-btn ${loginMethod === 'password' ? 'active' : ''}`}
              onClick={() => setLoginMethod('password')}>Password</button>
          </div>

          {/* ── [OTP INPUT] ── */}
          {loginMethod === 'otp' ? (
            <div style={{ marginBottom: 'var(--space-lg)' }}>
              <p style={{ textAlign: 'center', color: 'var(--clr-text-secondary)', marginBottom: 'var(--space-md)', fontSize: 'var(--font-sm)' }}>
                Enter the 6-digit code sent to you
              </p>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                {otp.map((digit, i) => (
                  <input key={i} id={`otp-${i}`} type="text" inputMode="numeric"
                    maxLength={1} value={digit} className="otp-box" placeholder="·"
                    autoFocus={i === 0}
                    onChange={e => handleOtpInput(i, e.currentTarget.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)} />
                ))}
              </div>
            </div>
          ) : (
            /* ── [PASSWORD INPUT] ── */
            <div style={{ marginBottom: 'var(--space-lg)' }}>
              <p style={{ fontWeight: 700, fontSize: 'var(--font-sm)', color: 'var(--clr-text-secondary)', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Password
              </p>
              <IonItem>
                <IonInput type="password" value={password}
                  onIonChange={e => setPassword(e.detail.value!)}
                  placeholder="Enter your password"
                  style={{ fontSize: 'var(--font-lg)', fontWeight: 600 }} />
              </IonItem>
            </div>
          )}

          {/* ── [ERROR] ── */}
          {error && (
            <IonText color="danger">
              <p style={{ textAlign: 'center', fontSize: 'var(--font-sm)', margin: '0 0 var(--space-sm)', fontWeight: 600 }}>
                ⚠ {error}
              </p>
            </IonText>
          )}

          {/* ── [LOADING] ── */}
          {loading && (
            <div style={{ textAlign: 'center', margin: 'var(--space-md) 0' }}>
              <div className="loading-dot" /><div className="loading-dot" /><div className="loading-dot" />
            </div>
          )}

          {/* ── [SIGN IN BUTTON] ── */}
          <IonButton expand="block" onClick={handleLogin} disabled={loading}
            style={{
              '--background':        'var(--clr-primary)',
              '--background-hover':  'var(--clr-primary-light)',
              '--border-radius':     'var(--radius-md)',
              '--box-shadow':        'var(--shadow-md)',
              height: '56px', fontSize: 'var(--font-lg)', fontWeight: 800,
              marginTop: 'var(--space-sm)', letterSpacing: '0.3px'
            }}>
            {loading ? 'Signing in…' : 'Sign In'}
          </IonButton>

          <p style={{ textAlign: 'center', color: 'var(--clr-text-muted)', fontSize: 'var(--font-xs)', marginTop: 'var(--space-lg)' }}>
            By signing in you agree to SafeNode's safety terms.
          </p>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;
