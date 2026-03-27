/**
 * ============================================================================
 * LOGIN.TSX - User Authentication Page
 * ============================================================================
 * Purpose: Handles user authentication via OTP or Password methods
 * 
 * Features:
 * - Dual authentication methods (OTP and Password)
 * - OTP input with auto-focus and backspace navigation
 * - Form validation with error messages
 * - Loading state with animated indicator
 * - Session storage integration
 * 
 * State Variables:
 * - contact: Phone number input
 * - otp: 6-digit OTP array
 * - password: Password field
 * - error: Error message display
 * - loading: Loading animation state
 * - loginMethod: 'otp' or 'password' toggle
 * 
 * Debug Tips:
 * - Check sessionStorage in DevTools to verify user data storage
 * - OTP navigation handled via keyboard events (ArrowLeft, ArrowRight, Backspace)
 * - Loading delay is 1500ms - adjust in handleLogin() if needed
 * ============================================================================
 */

import React, { useState } from 'react';
import {
  IonPage, IonContent, IonInput, IonItem,
  IonButton, IonText
} from '@ionic/react';
import { useHistory } from 'react-router-dom';

const styles = `
  @keyframes dotPulse {
    0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
    40% { transform: scale(1); opacity: 1; }
  }
  .loading-dot {
    display: inline-block; width: 10px; height: 10px; border-radius: 50%;
    background-color: var(--primary-green); margin: 0 5px;
    animation: dotPulse 1.2s infinite ease-in-out;
  }
  .loading-dot:nth-child(2) { animation-delay: 0.2s; }
  .loading-dot:nth-child(3) { animation-delay: 0.4s; }
  .login-page { background: var(--app-bg); min-height: 100%; }
  .method-btn {
    padding: 12px 28px; border: 2px solid var(--primary-green); border-radius: 10px;
    cursor: pointer; font-size: 16px; font-weight: 700; transition: all 0.2s;
  }
  .method-btn.active  { background: var(--primary-green); color: white; }
  .method-btn.inactive { background: white; color: var(--primary-green); }
  .otp-box {
    width: 48px; height: 56px; font-size: 24px; font-weight: 700;
    text-align: center; border: 2px solid var(--border-green); border-radius: 12px;
    outline: none; background: white; color: var(--dark-green); transition: border-color 0.2s;
  }
  .otp-box:focus { border-color: var(--primary-green); box-shadow: 0 0 0 3px rgba(61,139,55,0.15); }
  ion-item { --background: white; --border-radius: 12px; margin-bottom: 12px; }
  ion-input { font-size: 17px; }
`;

/**
 * Login Component
 * 
 * Flow:
 * 1. User enters phone number
 * 2. User selects authentication method (OTP or Password)
 * 3. User enters credentials
 * 4. Form validation
 * 5. Simulated API call (1.5s delay)
 * 6. Store user data in sessionStorage
 * 7. Navigate to /dashboard
 */
const Login: React.FC = () => {
  // ===== ROUTER =====
  const history = useHistory();
  
  // ===== STATE MANAGEMENT =====
  const [contact, setContact] = useState('');                      // Phone number input
  const [otp, setOtp] = useState(['', '', '', '', '', '']);         // 6-digit OTP array
  const [password, setPassword] = useState('');                    // Password input
  const [error, setError] = useState('');                          // Error message
  const [loading, setLoading] = useState(false);                   // Loading state
  const [loginMethod, setLoginMethod] = useState<'otp' | 'password'>('otp'); // Auth method toggle

  /**
   * Handle OTP digit input with validation and auto-focus
   * 
   * @param index - Position in OTP array (0-5)
   * @param value - Input value from user
   */
  const handleOtpInput = (index: number, value: string) => {
    // Allow only single digit
    if (value.length > 1 || !/^\d*$/.test(value)) return;
    
    // Update OTP array with new digit
    const n = [...otp];
    n[index] = value;
    setOtp(n);
    
    // Auto-focus to next OTP box when digit is entered
    if (value && index < 5)
      (document.getElementById(`otp-${index + 1}`) as HTMLInputElement)?.focus();
  };

  /**
   * Handle special keys (Backspace, Arrow keys) for OTP navigation
   * 
   * @param index - Current OTP box position
   * @param e - Keyboard event
   */
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Backspace: Clear current or previous box
    if (e.key === 'Backspace') {
      e.preventDefault();
      const n = [...otp];
      if (otp[index]) {
        // Clear current box
        n[index] = '';
        setOtp(n);
      } else if (index > 0) {
        // If empty, clear previous and move focus
        n[index - 1] = '';
        setOtp(n);
        (document.getElementById(`otp-${index - 1}`) as HTMLInputElement)?.focus();
      }
    }
    // Arrow Left: Move focus to previous box
    else if (e.key === 'ArrowLeft' && index > 0)
      (document.getElementById(`otp-${index - 1}`) as HTMLInputElement)?.focus();
    // Arrow Right: Move focus to next box
    else if (e.key === 'ArrowRight' && index < 5)
      (document.getElementById(`otp-${index + 1}`) as HTMLInputElement)?.focus();
  };

  /**
   * Main login handler - validates input and authenticates user
   */
  const handleLogin = () => {
    // ===== VALIDATION CHECKS =====
    
    // Check 1: Phone number is required
    if (!contact) {
      setError('Please enter your phone number');
      return;
    }
    
    // Check 2: Phone number must be at least 10 digits
    if (contact.length < 10) {
      setError('Enter a valid 10-digit number');
      return;
    }
    
    // Check 3: Validate OTP method
    if (loginMethod === 'otp' && otp.join('').length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }
    
    // Check 4: Validate password method
    if (loginMethod === 'password' && !password) {
      setError('Please enter your password');
      return;
    }
    
    // ===== AUTHENTICATION FLOW =====
    setError('');
    setLoading(true);
    
    // Simulate API call with 1.5 second delay
    // Replace this with actual API endpoint in production
    setTimeout(() => {
      setLoading(false);
      
      // Store user profile in sessionStorage
      // This persists across page navigation until session ends
      sessionStorage.setItem('user', JSON.stringify({
        username: `user_${contact.slice(-4)}`,    // Username from last 4 digits
        displayName: `User ${contact.slice(-4)}`, // Display name
        contact,                                   // Phone number
        email: `user${contact.slice(-4)}@safenode.app` // Generated email
      }));
      
      // Debug log
      console.log('[LOGIN] User authenticated | Method:', loginMethod, '| Contact:', contact);
      
      // Navigate to dashboard
      history.push('/dashboard');
    }, 1500);
  };

  return (
    <IonPage>
      {/* Inject animation styles */}
      <style>{styles}</style>
      <IonContent>
        <div className="login-page" style={{ padding: '0 24px 40px' }}>

          {/* ===== HEADER SECTION ===== */}
          <div style={{ textAlign: 'center', paddingTop: '70px', paddingBottom: '36px' }}>
            {/* Logo with gradient background */}
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--mid-green), var(--dark-green))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px', fontSize: '36px',
              boxShadow: '0 4px 16px rgba(61,139,55,0.3)'
            }}>🛡️</div>
            
            {/* App title */}
            <h1 style={{ margin: 0, fontWeight: 800, fontSize: '30px', color: 'var(--dark-green)' }}>SafeNode</h1>
            
            {/* Tagline */}
            <p style={{ color: 'var(--soft-green)', margin: '6px 0 0', fontSize: '16px' }}>Your personal safety companion</p>
          </div>

          {/* ===== PHONE NUMBER INPUT ===== */}
          <p style={{ fontWeight: 700, fontSize: '16px', color: 'var(--primary-green)', margin: '0 0 8px' }}>Phone Number</p>
          <IonItem style={{ '--background': 'white', '--border-radius': '12px', '--border-color': 'var(--border-green)', marginBottom: '20px' }}>
            <IonInput
              type="tel"
              value={contact}
              onIonChange={e => setContact(e.detail.value!)}
              placeholder="Enter your phone number"
              style={{ fontSize: '17px' }}
            />
          </IonItem>

          {/* ===== AUTHENTICATION METHOD SELECTOR ===== */}
          <p style={{ fontWeight: 700, fontSize: '16px', color: 'var(--primary-green)', margin: '0 0 10px', textAlign: 'center' }}>
            How do you want to sign in?
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '24px' }}>
            {/* OTP Method Button */}
            <button
              className={`method-btn ${loginMethod === 'otp' ? 'active' : 'inactive'}`}
              onClick={() => setLoginMethod('otp')}
            >
              One-Time Code
            </button>
            
            {/* Password Method Button */}
            <button
              className={`method-btn ${loginMethod === 'password' ? 'active' : 'inactive'}`}
              onClick={() => setLoginMethod('password')}
            >
              Password
            </button>
          </div>

          {/* ===== OTP INPUT SECTION ===== */}
          {loginMethod === 'otp' ? (
            <div style={{ marginBottom: '20px' }}>
              <p style={{ textAlign: 'center', color: 'var(--soft-green)', marginBottom: '14px', fontSize: '15px' }}>
                Enter the 6-digit code sent to you
              </p>
              {/* OTP Input Boxes */}
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}           // ID for DOM reference and focus
                    type="text"              // Text type for styling control
                    inputMode="numeric"      // Mobile keyboard: show numbers only
                    maxLength={1}             // Restrict to single character
                    value={digit}
                    onChange={e => handleOtpInput(i, e.currentTarget.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    autoFocus={i === 0}       // Focus first box on load
                    className="otp-box"
                    placeholder="·"
                  />
                ))}
              </div>
            </div>
          ) : (
            // ===== PASSWORD INPUT SECTION =====
            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontWeight: 700, fontSize: '16px', color: 'var(--primary-green)', margin: '0 0 8px' }}>Password</p>
              <IonItem style={{ '--background': 'white', '--border-radius': '12px', '--border-color': 'var(--border-green)' }}>
                <IonInput
                  type="password"
                  value={password}
                  onIonChange={e => setPassword(e.detail.value!)}
                  placeholder="Enter your password"
                  style={{ fontSize: '17px' }}
                />
              </IonItem>
            </div>
          )}

          {/* ===== ERROR MESSAGE DISPLAY ===== */}
          {error && (
            <IonText color="danger">
              <p style={{ textAlign: 'center', fontSize: '15px', margin: '0 0 12px', fontWeight: 600 }}>⚠ {error}</p>
            </IonText>
          )}

          {/* ===== LOADING INDICATOR ===== */}
          {loading && (
            <div style={{ textAlign: 'center', margin: '16px 0' }}>
              <div className="loading-dot" />
              <div className="loading-dot" />
              <div className="loading-dot" />
            </div>
          )}

          {/* ===== LOGIN BUTTON ===== */}
          <IonButton
            expand="block"
            onClick={handleLogin}
            disabled={loading}
            style={{
              '--background': 'var(--primary-green)',
              '--background-hover': 'var(--dark-green)',
              '--background-focused': 'var(--dark-green)',
              '--border-radius': '14px',
              height: '54px',
              fontSize: '18px',
              fontWeight: 700,
              marginTop: '8px'
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </IonButton>

          {/* ===== DISCLAIMER ===== */}
          <p style={{ textAlign: 'center', color: '#888', fontSize: '13px', marginTop: '20px' }}>
            By signing in, you agree to SafeNode's safety terms.
          </p>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;
