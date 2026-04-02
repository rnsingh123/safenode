/**
 * SosButton.tsx — SOS hero button + contact status cards
 * Logic: unchanged. UI: redesigned.
 * ── EDIT GUIDE ──────────────────────────────────────────────
 *  SOS button size/color → .sos-ring, .sos-core below
 *  Pulse animation       → @keyframes sosPulse
 *  Status card colors    → .card-pending / .card-responded
 *  Status text           → JSX labels at bottom of return
 * ────────────────────────────────────────────────────────────
 * TODO (live):
 *  triggerSos()  → POST /api/alerts
 *  pollRef       → WebSocket / SSE  GET /api/alerts/:id/pending|responded
 */

import React, { useState, useEffect, useRef } from 'react';
import { IonIcon, IonToast } from '@ionic/react';
import { warningOutline, peopleOutline, checkmarkDoneOutline } from 'ionicons/icons';
import { getContacts } from '../../utils/storage';

/* ── [ANIMATION AREA] ── */
const styles = `
  /* Outer ring pulse — edit rgba color to change glow tint */
  @keyframes sosPulse {
    0%   { transform: scale(1);    opacity: 0.6; }
    50%  { transform: scale(1.18); opacity: 0; }
    100% { transform: scale(1);    opacity: 0; }
  }
  /* Countdown number pop */
  @keyframes countPop {
    0%   { transform: scale(0.7); opacity: 0; }
    60%  { transform: scale(1.1); }
    100% { transform: scale(1);   opacity: 1; }
  }
  /* Status cards fade in */
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ── SOS ring (animated halo) ── */
  .sos-ring {
    position: absolute; inset: -14px; border-radius: 50%;
    border: 3px solid rgba(198,40,40,0.45);
    animation: sosPulse 2s ease-out infinite;
    pointer-events: none;
  }
  /* ── SOS core button ── */
  /* [COLOR] change background gradient here */
  .sos-core {
    position: relative;
    width: 168px; height: 168px; border-radius: 50%;
    background: radial-gradient(circle at 38% 32%, #ef5350, #b71c1c);
    border: 4px solid rgba(255,255,255,0.18);
    box-shadow: 0 8px 32px rgba(183,28,28,0.45), inset 0 2px 4px rgba(255,255,255,0.15);
    color: white; cursor: pointer;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center; gap: 4px;
    transition: transform 0.12s, box-shadow 0.12s;
    /* [ANIMATION] press scale */
  }
  .sos-core:active {
    transform: scale(0.94);
    box-shadow: 0 4px 16px rgba(183,28,28,0.5);
  }
  .sos-core.counting {
    background: radial-gradient(circle at 38% 32%, #ff7043, #bf360c);
  }

  /* ── Cancel button ── */
  .sos-cancel {
    margin-top: 18px; padding: 13px 40px;
    background: white; border: 2px solid var(--clr-alert);
    border-radius: var(--radius-md); color: var(--clr-alert);
    font-size: var(--font-md); font-weight: 700; cursor: pointer;
    box-shadow: var(--shadow-sm);
    transition: background 0.15s, color 0.15s;
  }
  .sos-cancel:active { background: var(--clr-alert-tint); }

  /* ── Status cards ── */
  /* [COLOR] pending = orange, responded = green */
  .status-card {
    flex: 1; border-radius: var(--radius-md); padding: 18px 12px;
    display: flex; flex-direction: column; align-items: center; gap: 5px;
    cursor: pointer; border: none;
    transition: transform 0.12s, opacity 0.12s;
    animation: fadeIn 0.35s ease both;
  }
  .status-card:active { transform: scale(0.96); opacity: 0.85; }
  .card-pending   { background: var(--clr-warning); }
  .card-responded { background: var(--clr-primary); }
  .card-idle      { background: #d0d0d0; cursor: default; }
`;

interface Props { onAlertSent: () => void; }

const SosButton: React.FC<Props> = ({ onAlertSent }) => {
  const [counting, setCounting]         = useState(false);
  const [countdown, setCountdown]       = useState(3);
  const [showToast, setShowToast]       = useState(false);
  const [toastMsg, setToastMsg]         = useState('');
  const [alertSent, setAlertSent]       = useState(false);
  /* Live hook: GET /api/alerts/:id/pending  */
  const [activeCount, setActiveCount]   = useState(0);
  /* Live hook: GET /api/alerts/:id/responded */
  const [respondedCount, setRespondedCount] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCountdown = () => { setCounting(true); setCountdown(3); };
  const cancelSos = () => {
    setCounting(false); setCountdown(3);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  useEffect(() => {
    if (!counting) return;
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(timerRef.current!); triggerSos(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [counting]);

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  const triggerSos = () => {
    setCounting(false); setCountdown(3);
    const verified = getContacts().filter(c => c.verified);
    const total    = verified.length || 2;
    /* TODO: POST /api/alerts { userId, contacts: verified, location } */
    console.log('[SOS] alert →', total, 'contacts');
    setActiveCount(total); setRespondedCount(0); setAlertSent(true);
    setToastMsg(`🚨 Alert sent to ${total} contact${total !== 1 ? 's' : ''}! Help is on the way.`);
    setShowToast(true);
    onAlertSent();
    /* TODO: replace with WebSocket / SSE */
    let responded = 0;
    pollRef.current = setInterval(() => {
      if (responded < total) {
        responded++;
        setRespondedCount(responded);
        setActiveCount(total - responded);
      } else clearInterval(pollRef.current!);
    }, 5000);
  };

  const isIdle = !alertSent;

  return (
    <>
      <style>{styles}</style>

      {/* ── [SOS HERO AREA] ── */}
      <div style={{ textAlign: 'center', padding: 'var(--space-xl) 0 var(--space-sm)' }}>
        {counting ? (
          /* ── [COUNTDOWN STATE] ── */
          <>
            <p style={{ fontSize: '72px', fontWeight: 900, color: 'var(--clr-alert)', lineHeight: 1, margin: 0, animation: 'countPop 0.3s ease' }}>
              {countdown}
            </p>
            <p style={{ color: 'var(--clr-alert)', fontSize: 'var(--font-md)', margin: '8px 0 0', fontWeight: 600 }}>
              Sending alert in {countdown}s…
            </p>
            <button className="sos-cancel" onClick={cancelSos}>✕  Cancel</button>
          </>
        ) : (
          /* ── [SOS BUTTON STATE] ── */
          <>
            {/* Outer halo wrapper — positions the pulse ring */}
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <div className="sos-ring" />
              <button className="sos-core" onClick={startCountdown}>
                <IonIcon icon={warningOutline} style={{ fontSize: '42px' }} />
                <span style={{ fontSize: '28px', fontWeight: 900, letterSpacing: '3px' }}>SOS</span>
              </button>
            </div>
            {/* ── [LABEL] change text here ── */}
            <p style={{ color: 'var(--clr-text-secondary)', fontSize: 'var(--font-sm)', marginTop: 'var(--space-md)', fontWeight: 600 }}>
              Tap for Emergency
            </p>

            {/* ── [STATUS INDICATOR] Safe / Monitoring / Alert Sent ── */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '6px',
              background: alertSent ? 'var(--clr-alert-tint)' : 'var(--clr-primary-tint)',
              borderRadius: '20px', padding: '5px 14px' }}>
              {/* [COLOR] dot: green=safe, yellow=monitoring, red=alert */}
              <span style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: alertSent ? 'var(--clr-alert)' : 'var(--clr-primary)',
                display: 'inline-block'
              }} />
              <span style={{ fontSize: 'var(--font-xs)', fontWeight: 700,
                color: alertSent ? 'var(--clr-alert)' : 'var(--clr-primary)' }}>
                {alertSent ? 'Alert Sent' : 'Safe'}
              </span>
            </div>
          </>
        )}
      </div>

      {/* ── [STATUS BUTTONS] always visible below SOS ── */}
      <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>

        {/* Button 1: Active — sent, not yet responded */}
        {/* TODO: onClick → open pending contacts modal */}
        <button className={`status-card ${isIdle ? 'card-idle' : 'card-pending'}`} disabled={isIdle}>
          <IonIcon icon={peopleOutline} style={{ fontSize: '26px', color: 'white' }} />
          <span style={{ fontSize: '34px', fontWeight: 900, color: 'white', lineHeight: 1 }}>{activeCount}</span>
          <span style={{ fontSize: 'var(--font-xs)', fontWeight: 800, color: 'rgba(255,255,255,0.9)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Active
          </span>
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)' }}>
            {isIdle ? 'No alert sent' : 'Waiting for reply'}
          </span>
        </button>

        {/* Button 2: Responded — acknowledged the alert */}
        {/* TODO: onClick → open responded contacts modal */}
        <button className={`status-card ${isIdle ? 'card-idle' : 'card-responded'}`} disabled={isIdle}>
          <IonIcon icon={checkmarkDoneOutline} style={{ fontSize: '26px', color: 'white' }} />
          <span style={{ fontSize: '34px', fontWeight: 900, color: 'white', lineHeight: 1 }}>{respondedCount}</span>
          <span style={{ fontSize: 'var(--font-xs)', fontWeight: 800, color: 'rgba(255,255,255,0.9)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Responded
          </span>
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)' }}>
            {isIdle ? 'No alert sent' : 'Acknowledged'}
          </span>
        </button>

      </div>

      <IonToast isOpen={showToast} onDidDismiss={() => setShowToast(false)}
        message={toastMsg} duration={4000} color="danger" position="top" />
    </>
  );
};

export default SosButton;
