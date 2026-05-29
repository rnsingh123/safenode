/**
 * Login.tsx — Authentication screen
 * Logic: unchanged. UI: fully redesigned.
 * ── EDIT GUIDE ──────────────────────────────────────────────
 *  Colors      → src/theme/variables.css
 *  Hero bg     → .login-hero gradient
 *  Card style  → .login-card
 *  Animations  → @keyframes section at top
 * ────────────────────────────────────────────────────────────
 */

import React, { useState } from 'react';
import { IonPage, IonContent, IonInput, IonItem, IonButton, IonText } from '@ionic/react';
import { useHistory } from 'react-router-dom';

const styles = `
  /* ── Animations ── */
  @keyframes heroFade {
    from { opacity: 0; transform: translateY(-12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes cardSlide {
    from { opacity: 0; transform: translateY(32px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes dotPulse {
    0%, 80%, 100% { transform: scale(0.55); opacity: 0.35; }
    40%           { transform: scale(1);    opacity: 1; }
  }
  @keyframes otpPop {
    0%   { transform: scale(0.8); opacity: 0; }
    100% { transform: scale(1);   opacity: 1; }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }

  /* ── Page ── */
  .login-page {
    min-height: 100%;
    background: var(--clr-bg);
    display: flex;
    flex-direction: column;
  }

  /* ── Hero section ── */
  .login-hero {
    background: linear-gradient(160deg, #1b5e20 0%, #2e7d32 45%, #43a047 100%);
    padding: 56px 24px 48px;
    text-align: center;
    position: relative;
    overflow: hidden;
    animation: heroFade 0.5s ease both;
  }
  /* Decorative circles in hero */
  .login-hero::before {
    content: '';
    position: absolute;
    width: 220px; height: 220px;
    border-radius: 50%;
    background: rgba(255,255,255,0.05);
    top: -60px; right: -60px;
  }
  .login-hero::after {
    content: '';
    position: absolute;
    width: 140px; height: 140px;
    border-radius: 50%;
    background: rgba(255,255,255,0.06);
    bottom: -40px; left: -30px;
  }

  /* ── Shield logo ── */
  .login-shield {
    width: 90px; height: 90px; border-radius: 28px;
    background: rgba(255,255,255,0.15);
    backdrop-filter: blur(8px);
    border: 2px solid rgba(255,255,255,0.25);
    display: flex; align-items: center; justify-content: center;
    font-size: 44px; margin: 0 auto 18px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.2);
    position: relative; z-index: 1;
  }

  /* ── Card ── */
  .login-card {
    background: var(--clr-surface);
    border-radius: 28px 28px 0 0;
    margin-top: -24px;
    padding: 32px 24px 40px;
    flex: 1;
    box-shadow: 0 -4px 24px rgba(0,0,0,0.08);
    animation: cardSlide 0.45s ease 0.1s both;
    position: relative; z-index: 2;
  }

  /* ── Method toggle ── */
  .method-wrap {
    display: flex;
    background: var(--clr-primary-tint);
    border-radius: var(--radius-md);
    padding: 4px;
    margin-bottom: var(--space-lg);
  }
  .method-btn {
    flex: 1; padding: 11px 0;
    border: none; border-radius: var(--radius-sm);
    font-size: var(--font-sm); font-weight: 700;
    cursor: pointer;
    transition: background 0.2s, color 0.2s, box-shadow 0.2s;
    background: transparent;
    color: var(--clr-primary-muted);
  }
  .method-btn.active {
    background: var(--clr-surface);
    color: var(--clr-primary);
    box-shadow: 0 2px 8px rgba(46,125,50,0.15);
  }

  /* ── Input field ── */
  .login-input-wrap {
    background: var(--clr-bg);
    border-radius: var(--radius-md);
    border: 2px solid var(--clr-primary-border);
    overflow: hidden;
    transition: border-color 0.2s, box-shadow 0.2s;
    margin-bottom: var(--space-md);
  }
  .login-input-wrap:focus-within {
    border-color: var(--clr-primary);
    box-shadow: 0 0 0 3px rgba(46,125,50,0.12);
  }
  .login-input-wrap ion-item {
    --background: transparent;
    --border-style: none;
    --padding-start: 16px;
    --inner-padding-end: 16px;
  }

  /* ── OTP boxes ── */
  .otp-grid {
    display: flex; gap: 10px; justify-content: center;
    margin: var(--space-md) 0 var(--space-lg);
  }
  .otp-box {
    width: 46px; height: 56px;
    font-size: 24px; font-weight: 800;
    text-align: center;
    border: 2px solid var(--clr-primary-border);
    border-radius: var(--radius-md);
    background: var(--clr-bg);
    color: var(--clr-text-primary);
    outline: none;
    transition: border-color 0.18s, box-shadow 0.18s, transform 0.1s;
    animation: otpPop 0.25s ease both;
  }
  .otp-box:nth-child(1) { animation-delay: 0.00s; }
  .otp-box:nth-child(2) { animation-delay: 0.04s; }
  .otp-box:nth-child(3) { animation-delay: 0.08s; }
  .otp-box:nth-child(4) { animation-delay: 0.12s; }
  .otp-box:nth-child(5) { animation-delay: 0.16s; }
  .otp-box:nth-child(6) { animation-delay: 0.20s; }
  .otp-box:focus {
    border-color: var(--clr-primary);
    box-shadow: 0 0 0 3px rgba(46,125,50,0.15);
    transform: scale(1.06);
  }
  .otp-box:not(:placeholder-shown) {
    background: var(--clr-primary-tint);
    border-color: var(--clr-primary);
    color: var(--clr-primary);
  }

  /* ── Loading dots ── */
  .loading-dot {
    display: inline-block; width: 9px; height: 9px; border-radius: 50%;
    background: var(--clr-primary); margin: 0 4px;
    animation: dotPulse 1.2s infinite ease-in-out;
  }
  .loading-dot:nth-child(2) { animation-delay: 0.2s; }
  .loading-dot:nth-child(3) { animation-delay: 0.4s; }

  /* ── Sign in button ── */
  .signin-btn {
    --background: linear-gradient(135deg, var(--clr-primary), var(--clr-primary-light));
    --background-hover: var(--clr-primary);
    --border-radius: var(--radius-md);
    --box-shadow: 0 6px 20px rgba(46,125,50,0.35);
    height: 56px;
    font-size: var(--font-lg);
    font-weight: 800;
    letter-spacing: 0.3px;
    margin-top: var(--space-sm);
  }

  /* ── Feature pills ── */
  .feature-pills {
    display: flex; gap: 8px; justify-content: center;
    flex-wrap: wrap; margin-top: 16px;
  }
  .feature-pill {
    background: rgba(255,255,255,0.15);
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: 20px; padding: 5px 12px;
    font-size: 12px; color: rgba(255,255,255,0.9);
    font-weight: 600;
  }

  /* ── Divider ── */
  .login-divider {
    display: flex; align-items: center; gap: 12px;
    margin: var(--space-md) 0;
    color: var(--clr-text-muted); font-size: var(--font-xs);
  }
  .login-divider::before, .login-divider::after {
    content: ''; flex: 1; height: 1px;
    background: var(--clr-primary-border);
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

  // OTP flow state
  const [otpSent, setOtpSent]         = useState(false);   // true after "Send OTP" tapped
  const [sendingOtp, setSendingOtp]   = useState(false);   // loading while sending

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

  /* ── Send OTP to phone number ───────────────────────────────
     TODO: Replace the setTimeout simulation with real Firebase:

     import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
     const auth = getAuth();
     window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
     const confirmationResult = await signInWithPhoneNumber(auth, `+91${contact}`, window.recaptchaVerifier);
     window.confirmationResult = confirmationResult;

     Then in handleLogin replace the setTimeout with:
     const result = await window.confirmationResult.confirm(otp.join(''));
  ── */
  const handleSendOtp = () => {
    if (!contact)             { setError('Please enter your phone number'); return; }
    if (contact.length < 10)  { setError('Enter a valid 10-digit number'); return; }
    setError('');
    setSendingOtp(true);

    // TODO: Replace with real OTP send (Firebase / Twilio)
    setTimeout(() => {
      setSendingOtp(false);
      setOtpSent(true);
      setOtp(['', '', '', '', '', '']);
      console.log('[OTP] Simulated OTP sent to:', contact);
    }, 1200);
  };

  /* ── [AUTH LOGIC — unchanged] ── */
  const handleLogin = () => {
    if (!contact)                                           { setError('Please enter your phone number'); return; }
    if (contact.length < 10)                                { setError('Enter a valid 10-digit number'); return; }
    if (loginMethod === 'otp' && otp.join('').length !== 6) { setError('Please enter all 6 digits'); return; }
    if (loginMethod === 'password' && !password)            { setError('Please enter your password'); return; }
    setError(''); setLoading(true);
    setTimeout(() => {
      setLoading(false);
      sessionStorage.setItem('user', JSON.stringify({
        username:    `user_${contact.slice(-4)}`,
        displayName: `User ${contact.slice(-4)}`,
        contact,
        email:       `user${contact.slice(-4)}@safenode.app`
      }));
      history.push('/dashboard');
    }, 1500);
  };

  return (
    <IonPage>
      <style>{styles}</style>
      <IonContent scrollY={true}>
        <div className="login-page">

          {/* ── Hero ── */}
          <div className="login-hero">
            <div className="login-shield">🛡️</div>
            <h1 style={{ margin: 0, fontWeight: 900, fontSize: 'var(--font-hero)', color: 'white', letterSpacing: '-0.5px', position: 'relative', zIndex: 1 }}>
              SafeNode
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.8)', margin: '6px 0 20px', fontSize: 'var(--font-sm)', position: 'relative', zIndex: 1 }}>
              Your personal safety companion
            </p>
            <div className="feature-pills">
              <span className="feature-pill">🚨 SOS Alert</span>
              <span className="feature-pill">📍 Live Location</span>
              <span className="feature-pill">🛡️ Fall Detection</span>
            </div>
          </div>

          {/* ── Card ── */}
          <div className="login-card">

            <h2 style={{ margin: '0 0 4px', fontWeight: 800, fontSize: 'var(--font-xl)', color: 'var(--clr-text-primary)' }}>
              Welcome back
            </h2>
            <p style={{ margin: '0 0 24px', fontSize: 'var(--font-sm)', color: 'var(--clr-text-secondary)' }}>
              Sign in to access your safety dashboard
            </p>

            {/* Phone input */}
            <p style={{ fontWeight: 700, fontSize: 'var(--font-xs)', color: 'var(--clr-text-secondary)', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Phone Number
            </p>
            <div className="login-input-wrap">
              <IonItem>
                <IonInput
                  type="tel"
                  value={contact}
                  onIonChange={e => setContact(e.detail.value!)}
                  placeholder="Enter your phone number"
                  style={{ fontSize: 'var(--font-lg)', fontWeight: 600 }}
                />
              </IonItem>
            </div>

            {/* Method toggle */}
            <div className="method-wrap">
              <button className={`method-btn ${loginMethod === 'otp' ? 'active' : ''}`}
                onClick={() => setLoginMethod('otp')}>
                📱 One-Time Code
              </button>
              <button className={`method-btn ${loginMethod === 'password' ? 'active' : ''}`}
                onClick={() => setLoginMethod('password')}>
                🔑 Password
              </button>
            </div>

            {/* OTP input */}
            {loginMethod === 'otp' ? (
              <>
                {!otpSent ? (
                  /* ── Step 1: Confirm phone + Send OTP ── */
                  <>
                    <div style={{
                      background: 'var(--clr-primary-tint)',
                      border: '1px solid var(--clr-primary-border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '12px 14px',
                      marginBottom: 'var(--space-md)',
                      display: 'flex', alignItems: 'center', gap: '10px'
                    }}>
                      <span style={{ fontSize: '20px' }}>📱</span>
                      <div>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: 'var(--font-sm)', color: 'var(--clr-text-primary)' }}>
                          Send OTP to {contact || 'your number'}
                        </p>
                        <p style={{ margin: '2px 0 0', fontSize: 'var(--font-xs)', color: 'var(--clr-text-secondary)' }}>
                          A 6-digit code will be sent via SMS
                        </p>
                      </div>
                    </div>
                    <IonButton
                      expand="block"
                      onClick={handleSendOtp}
                      disabled={sendingOtp || contact.length < 10}
                      style={{
                        '--background':       'var(--clr-primary)',
                        '--border-radius':    'var(--radius-md)',
                        '--box-shadow':       '0 4px 14px rgba(46,125,50,0.3)',
                        height: '52px', fontSize: 'var(--font-md)', fontWeight: 800,
                        marginBottom: 'var(--space-md)'
                      }}
                    >
                      {sendingOtp ? 'Sending…' : 'Send OTP →'}
                    </IonButton>
                    {sendingOtp && (
                      <div style={{ textAlign: 'center', marginBottom: 'var(--space-md)' }}>
                        <div className="loading-dot" />
                        <div className="loading-dot" />
                        <div className="loading-dot" />
                      </div>
                    )}
                  </>
                ) : (
                  /* ── Step 2: Enter OTP ── */
                  <>
                    <div style={{
                      background: 'var(--clr-primary-tint)',
                      border: '1px solid var(--clr-primary-border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '10px 14px',
                      marginBottom: 'var(--space-sm)',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '16px' }}>✅</span>
                        <p style={{ margin: 0, fontSize: 'var(--font-sm)', color: 'var(--clr-primary)', fontWeight: 700 }}>
                          OTP sent to {contact}
                        </p>
                      </div>
                      <button
                        onClick={() => { setOtpSent(false); setOtp(['', '', '', '', '', '']); }}
                        style={{ background: 'none', border: 'none', color: 'var(--clr-primary-muted)', fontSize: 'var(--font-xs)', cursor: 'pointer', fontWeight: 700, textDecoration: 'underline' }}
                      >
                        Change
                      </button>
                    </div>
                    <p style={{ textAlign: 'center', color: 'var(--clr-text-secondary)', fontSize: 'var(--font-sm)', margin: '0 0 4px' }}>
                      Enter the 6-digit code
                    </p>
                    <div className="otp-grid">
                      {otp.map((digit, i) => (
                        <input
                          key={i} id={`otp-${i}`}
                          type="text" inputMode="numeric"
                          maxLength={1} value={digit}
                          className="otp-box" placeholder="·"
                          autoFocus={i === 0}
                          onChange={e => handleOtpInput(i, e.currentTarget.value)}
                          onKeyDown={e => handleOtpKeyDown(i, e)}
                        />
                      ))}
                    </div>
                    <p style={{ textAlign: 'center', fontSize: 'var(--font-xs)', color: 'var(--clr-text-muted)', marginBottom: 'var(--space-md)' }}>
                      Didn't receive it?{' '}
                      <button
                        onClick={handleSendOtp}
                        style={{ background: 'none', border: 'none', color: 'var(--clr-primary)', fontWeight: 700, cursor: 'pointer', fontSize: 'var(--font-xs)' }}
                      >
                        Resend OTP
                      </button>
                    </p>
                  </>
                )}
              </>
            ) : (
              <>
                <p style={{ fontWeight: 700, fontSize: 'var(--font-xs)', color: 'var(--clr-text-secondary)', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                  Password
                </p>
                <div className="login-input-wrap" style={{ marginBottom: 'var(--space-lg)' }}>
                  <IonItem>
                    <IonInput
                      type="password" value={password}
                      onIonChange={e => setPassword(e.detail.value!)}
                      placeholder="Enter your password"
                      style={{ fontSize: 'var(--font-lg)', fontWeight: 600 }}
                    />
                  </IonItem>
                </div>
              </>
            )}

            {/* Error */}
            {error && (
              <div style={{
                background: '#fce4ec', border: '1px solid #ef9a9a',
                borderRadius: 'var(--radius-sm)', padding: '10px 14px',
                marginBottom: 'var(--space-sm)', display: 'flex', alignItems: 'center', gap: '8px'
              }}>
                <span style={{ fontSize: '16px' }}>⚠</span>
                <IonText color="danger">
                  <p style={{ margin: 0, fontSize: 'var(--font-sm)', fontWeight: 600 }}>{error}</p>
                </IonText>
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div style={{ textAlign: 'center', margin: 'var(--space-md) 0' }}>
                <div className="loading-dot" />
                <div className="loading-dot" />
                <div className="loading-dot" />
              </div>
            )}

            {/* Sign in button — only shown after OTP is sent or in password mode */}
            {(loginMethod === 'password' || otpSent) && (
            <IonButton
              expand="block"
              className="signin-btn"
              onClick={handleLogin}
              disabled={loading}
              style={{
                '--background':       'var(--clr-primary)',
                '--background-hover': 'var(--clr-primary-light)',
                '--border-radius':    'var(--radius-md)',
                '--box-shadow':       '0 6px 20px rgba(46,125,50,0.35)',
                height: '56px', fontSize: 'var(--font-lg)', fontWeight: 800,
                marginTop: 'var(--space-sm)'
              }}
            >
              {loading ? 'Signing in…' : 'Sign In →'}
            </IonButton>
            )}

            <p style={{ textAlign: 'center', color: 'var(--clr-text-muted)', fontSize: 'var(--font-xs)', marginTop: '20px', lineHeight: 1.5 }}>
              By signing in you agree to SafeNode's safety terms.<br />
              Your data is encrypted and never shared.
            </p>

          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;
