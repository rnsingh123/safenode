/**
 * Register.tsx — User profile setup screen
 *
 * Shown ONCE on first launch before login.
 * Collects identity details so SOS receivers know who sent the alert
 * even if they don't have the number saved.
 *
 * Data stored in localStorage (persists across sessions).
 * When backend is connected → POST /api/auth/register with this data.
 *
 * Fields:
 *  - Full Name       (shown in SOS message)
 *  - Age             (shown in SOS message)
 *  - Blood Group     (critical for medical emergencies)
 *  - Address         (shown in SOS message)
 *  - Emergency note  (any extra info — medical conditions, etc.)
 */

import React, { useState } from 'react';
import { IonPage, IonContent, IonButton, IonText } from '@ionic/react';
import { useHistory } from 'react-router-dom';

const PROFILE_KEY = 'sn_user_profile';

export interface UserIdentity {
  fullName:    string;
  age:         string;
  bloodGroup:  string;
  address:     string;
  note:        string;
}

export const getUserIdentity = (): UserIdentity | null => {
  try {
    const stored = localStorage.getItem(PROFILE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch { return null; }
};

export const saveUserIdentity = (data: UserIdentity): void =>
  localStorage.setItem(PROFILE_KEY, JSON.stringify(data));

/* ── Styles ── */
const styles = `
  @keyframes heroFade {
    from { opacity: 0; transform: translateY(-10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes cardSlide {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fieldPop {
    from { opacity: 0; transform: translateX(-8px); }
    to   { opacity: 1; transform: translateX(0); }
  }

  .reg-page { min-height: 100%; background: var(--clr-bg); display: flex; flex-direction: column; }

  .reg-hero {
    background: linear-gradient(160deg, #1b5e20 0%, #2e7d32 50%, #43a047 100%);
    padding: 44px 24px 40px; text-align: center;
    position: relative; overflow: hidden;
    animation: heroFade 0.45s ease both;
  }
  .reg-hero::before {
    content: ''; position: absolute;
    width: 180px; height: 180px; border-radius: 50%;
    background: rgba(255,255,255,0.06); top: -50px; right: -40px;
  }
  .reg-hero::after {
    content: ''; position: absolute;
    width: 120px; height: 120px; border-radius: 50%;
    background: rgba(255,255,255,0.05); bottom: -30px; left: -20px;
  }
  .reg-shield {
    width: 76px; height: 76px; border-radius: 22px;
    background: rgba(255,255,255,0.15);
    border: 2px solid rgba(255,255,255,0.25);
    display: flex; align-items: center; justify-content: center;
    font-size: 36px; margin: 0 auto 14px;
    box-shadow: 0 6px 24px rgba(0,0,0,0.18);
    position: relative; z-index: 1;
  }
  .reg-step-pill {
    display: inline-flex; align-items: center; gap: 6px;
    background: rgba(255,255,255,0.15);
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: 20px; padding: 4px 12px;
    font-size: 12px; color: rgba(255,255,255,0.9); font-weight: 700;
    margin-top: 12px; position: relative; z-index: 1;
  }

  .reg-card {
    background: var(--clr-surface);
    border-radius: 28px 28px 0 0;
    margin-top: -20px; padding: 28px 20px 40px;
    flex: 1; box-shadow: 0 -4px 24px rgba(0,0,0,0.08);
    animation: cardSlide 0.45s ease 0.1s both;
    position: relative; z-index: 2;
    overflow-y: auto;
  }

  /* Field group */
  .reg-field {
    margin-bottom: 16px;
    animation: fieldPop 0.3s ease both;
  }
  .reg-field:nth-child(1) { animation-delay: 0.05s; }
  .reg-field:nth-child(2) { animation-delay: 0.10s; }
  .reg-field:nth-child(3) { animation-delay: 0.15s; }
  .reg-field:nth-child(4) { animation-delay: 0.20s; }
  .reg-field:nth-child(5) { animation-delay: 0.25s; }

  .reg-label {
    font-size: 11px; font-weight: 800;
    color: var(--clr-text-secondary);
    text-transform: uppercase; letter-spacing: 0.8px;
    margin: 0 0 6px; display: block;
  }
  .reg-input {
    width: 100%; padding: 13px 14px;
    border: 2px solid var(--clr-primary-border);
    border-radius: var(--radius-md);
    background: var(--clr-bg);
    color: var(--clr-text-primary);
    font-size: 16px; font-weight: 600;
    outline: none; box-sizing: border-box;
    transition: border-color 0.18s, box-shadow 0.18s;
    font-family: inherit;
  }
  .reg-input:focus {
    border-color: var(--clr-primary);
    box-shadow: 0 0 0 3px rgba(46,125,50,0.12);
  }
  .reg-input::placeholder { color: var(--clr-text-muted); font-weight: 400; }
  textarea.reg-input { resize: none; min-height: 80px; line-height: 1.5; }

  /* Blood group selector */
  .blood-grid {
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;
  }
  .blood-btn {
    padding: 10px 0; border-radius: var(--radius-sm);
    border: 2px solid var(--clr-primary-border);
    background: var(--clr-bg); color: var(--clr-text-primary);
    font-size: 14px; font-weight: 800; cursor: pointer;
    transition: all 0.15s; text-align: center;
  }
  .blood-btn.selected {
    background: var(--clr-primary); color: white;
    border-color: var(--clr-primary);
    box-shadow: 0 2px 8px rgba(46,125,50,0.3);
  }

  /* Info banner */
  .reg-info-banner {
    background: var(--clr-primary-tint);
    border: 1px solid var(--clr-primary-border);
    border-radius: var(--radius-sm);
    padding: 12px 14px; margin-bottom: 20px;
    display: flex; gap: 10px; align-items: flex-start;
  }

  /* Progress dots */
  .reg-progress {
    display: flex; gap: 6px; justify-content: center; margin-bottom: 20px;
  }
  .reg-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: var(--clr-primary-border);
    transition: background 0.2s, transform 0.2s;
  }
  .reg-dot.active { background: var(--clr-primary); transform: scale(1.3); }
  .reg-dot.done   { background: var(--clr-primary); }
`;

const BLOOD_GROUPS = ['A+', 'A−', 'B+', 'B−', 'AB+', 'AB−', 'O+', 'O−'];

const Register: React.FC = () => {
  const history = useHistory();

  const [step, setStep]           = useState<1 | 2>(1);
  const [fullName, setFullName]   = useState('');
  const [age, setAge]             = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [address, setAddress]     = useState('');
  const [note, setNote]           = useState('');
  const [error, setError]         = useState('');

  const validateStep1 = () => {
    if (!fullName.trim())  { setError('Please enter your full name'); return false; }
    if (!age.trim())       { setError('Please enter your age'); return false; }
    if (isNaN(Number(age)) || Number(age) < 1 || Number(age) > 120) {
      setError('Enter a valid age'); return false;
    }
    setError(''); return true;
  };

  const handleNext = () => {
    if (!validateStep1()) return;
    setStep(2);
  };

  const handleSave = () => {
    if (!address.trim()) { setError('Please enter your address'); return; }
    setError('');

    const identity: UserIdentity = {
      fullName: fullName.trim(),
      age:      age.trim(),
      bloodGroup: bloodGroup || 'Unknown',
      address:  address.trim(),
      note:     note.trim(),
    };

    saveUserIdentity(identity);

    // Also pre-fill sessionStorage displayName for dashboard greeting
    const existing = sessionStorage.getItem('user');
    if (existing) {
      const parsed = JSON.parse(existing);
      sessionStorage.setItem('user', JSON.stringify({ ...parsed, displayName: fullName.trim() }));
    }

    history.push('/login');
  };

  return (
    <IonPage>
      <style>{styles}</style>
      <IonContent scrollY={false}>
        <div className="reg-page">

          {/* ── Hero ── */}
          <div className="reg-hero">
            <div className="reg-shield">🛡️</div>
            <h1 style={{ margin: 0, fontWeight: 900, fontSize: 'var(--font-xl)', color: 'white', position: 'relative', zIndex: 1 }}>
              Set Up Your Profile
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.8)', margin: '6px 0 0', fontSize: 'var(--font-sm)', position: 'relative', zIndex: 1 }}>
              This info is sent with every SOS alert
            </p>
            <div className="reg-step-pill">
              Step {step} of 2 — {step === 1 ? 'Personal Info' : 'Location & Notes'}
            </div>
          </div>

          {/* ── Card ── */}
          <div className="reg-card">

            {/* Progress */}
            <div className="reg-progress">
              <div className={`reg-dot ${step >= 1 ? 'done' : ''}`} />
              <div className={`reg-dot ${step >= 2 ? 'active' : ''}`} />
            </div>

            {/* Info banner */}
            <div className="reg-info-banner">
              <span style={{ fontSize: 'var(--font-md)', flexShrink: 0 }}>ℹ️</span>
              <p style={{ margin: 0, fontSize: 'var(--font-xs)', color: 'var(--clr-text-secondary)', lineHeight: 1.5 }}>
                {step === 1
                  ? 'Your name, age and blood group will be included in the SOS alert so responders can identify and help you faster.'
                  : 'Your address helps responders locate you even if GPS is unavailable.'}
              </p>
            </div>

            {step === 1 ? (
              /* ── Step 1: Personal info ── */
              <>
                <div className="reg-field">
                  <label className="reg-label">Full Name *</label>
                  <input
                    className="reg-input"
                    type="text"
                    placeholder="e.g. Rohan Singh"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    autoFocus
                  />
                </div>

                <div className="reg-field">
                  <label className="reg-label">Age *</label>
                  <input
                    className="reg-input"
                    type="number"
                    placeholder="e.g. 22"
                    value={age}
                    onChange={e => setAge(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>

                <div className="reg-field">
                  <label className="reg-label">Blood Group</label>
                  <div className="blood-grid">
                    {BLOOD_GROUPS.map(bg => (
                      <button
                        key={bg}
                        className={`blood-btn ${bloodGroup === bg ? 'selected' : ''}`}
                        onClick={() => setBloodGroup(bg)}
                      >
                        {bg}
                      </button>
                    ))}
                  </div>
                  <p style={{ margin: '6px 0 0', fontSize: 'var(--font-xs)', color: 'var(--clr-text-muted)' }}>
                    Critical for medical emergencies
                  </p>
                </div>
              </>
            ) : (
              /* ── Step 2: Location & notes ── */
              <>
                <div className="reg-field">
                  <label className="reg-label">Home Address *</label>
                  <textarea
                    className="reg-input"
                    placeholder="e.g. 12, Sector 5, New Delhi - 110001"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    autoFocus
                  />
                  <p style={{ margin: '4px 0 0', fontSize: 'var(--font-xs)', color: 'var(--clr-text-muted)' }}>
                    Sent in SOS if GPS is unavailable
                  </p>
                </div>

                <div className="reg-field">
                  <label className="reg-label">Medical Notes <span style={{ fontWeight: 400, textTransform: 'none' }}>(optional)</span></label>
                  <textarea
                    className="reg-input"
                    placeholder="e.g. Diabetic, allergic to penicillin, wears glasses"
                    value={note}
                    onChange={e => setNote(e.target.value)}
                  />
                  <p style={{ margin: '4px 0 0', fontSize: 'var(--font-xs)', color: 'var(--clr-text-muted)' }}>
                    Helps emergency responders treat you correctly
                  </p>
                </div>
              </>
            )}

            {/* Error */}
            {error && (
              <div style={{
                background: '#fce4ec', border: '1px solid #ef9a9a',
                borderRadius: 'var(--radius-sm)', padding: '10px 14px',
                marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px'
              }}>
                <span>⚠</span>
                <IonText color="danger">
                  <p style={{ margin: 0, fontSize: 'var(--font-sm)', fontWeight: 600 }}>{error}</p>
                </IonText>
              </div>
            )}

            {/* Buttons */}
            {step === 1 ? (
              <IonButton expand="block" onClick={handleNext}
                style={{ '--background': 'var(--clr-primary)', '--border-radius': 'var(--radius-md)', '--box-shadow': '0 6px 20px rgba(46,125,50,0.3)', height: '54px', fontSize: 'var(--font-lg)', fontWeight: 800 }}>
                Next →
              </IonButton>
            ) : (
              <div style={{ display: 'flex', gap: '10px' }}>
                <IonButton fill="outline" onClick={() => { setStep(1); setError(''); }}
                  style={{ '--border-radius': 'var(--radius-md)', '--color': 'var(--clr-primary)', '--border-color': 'var(--clr-primary)', height: '54px', flex: '0 0 80px', fontWeight: 700 }}>
                  ← Back
                </IonButton>
                <IonButton expand="block" onClick={handleSave}
                  style={{ '--background': 'var(--clr-primary)', '--border-radius': 'var(--radius-md)', '--box-shadow': '0 6px 20px rgba(46,125,50,0.3)', height: '54px', fontSize: 'var(--font-lg)', fontWeight: 800, flex: 1 }}>
                  Save & Continue →
                </IonButton>
              </div>
            )}

            <p style={{ textAlign: 'center', color: 'var(--clr-text-muted)', fontSize: 'var(--font-xs)', marginTop: 'var(--space-md)' }}>
              You can update these details anytime from your Profile tab.
            </p>

          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Register;
