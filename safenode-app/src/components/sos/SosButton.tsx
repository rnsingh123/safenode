/**
 * SosButton.tsx
 * SOS button with 3-second countdown, cancel, and two persistent status buttons:
 *   1. Active Contacts  — alert sent but no response yet (pending)
 *   2. Responded        — contacts who acknowledged the alert
 *
 * Status buttons are always visible below SOS.
 * Counts are 0 at rest; populated after an alert is triggered.
 *
 * TODO (live implementation):
 *   - Replace triggerSos() simulation with real SMS API (e.g. Twilio)
 *   - Replace setInterval polling in pollContactResponses() with WebSocket / SSE
 *   - fetchActiveCount()   → GET /api/alerts/:id/pending
 *   - fetchRespondedCount() → GET /api/alerts/:id/responded
 */

import React, { useState, useEffect, useRef } from 'react';
import { IonIcon, IonToast } from '@ionic/react';
import { warningOutline, peopleOutline, checkmarkDoneOutline } from 'ionicons/icons';
import { getContacts } from '../../utils/storage';

const sosStyles = `
  @keyframes sosPulse {
    0%   { box-shadow: 0 0 0 0 rgba(229,57,53,0.5), 0 0 24px rgba(183,28,28,0.35); }
    70%  { box-shadow: 0 0 0 20px rgba(229,57,53,0), 0 0 24px rgba(183,28,28,0.35); }
    100% { box-shadow: 0 0 0 0 rgba(229,57,53,0), 0 0 24px rgba(183,28,28,0.35); }
  }
  .sos-btn {
    width: 160px; height: 160px; border-radius: 50%;
    background: radial-gradient(circle at 35% 35%, #ef5350, #b71c1c);
    border: 5px solid #e53935;
    box-shadow: 0 0 0 8px rgba(229,57,53,0.15), 0 0 24px rgba(183,28,28,0.35);
    color: white; font-size: 32px; font-weight: 900;
    cursor: pointer; letter-spacing: 3px;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    margin: 0 auto; transition: transform 0.1s;
    animation: sosPulse 2s infinite;
  }
  .sos-btn:active { transform: scale(0.95); }
  .sos-countdown {
    font-size: 56px; font-weight: 900; color: #e53935; line-height: 1; margin: 0;
  }
  .sos-cancel-btn {
    margin-top: 14px; padding: 12px 36px;
    background: white; border: 2px solid #e53935;
    border-radius: 12px; color: #e53935;
    font-size: 16px; font-weight: 700; cursor: pointer;
  }

  /* ── Status buttons ── */
  .sos-status-row {
    display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 20px;
  }
  .sos-status-btn {
    border: none; border-radius: 16px; padding: 16px 10px;
    cursor: pointer; text-align: center; transition: opacity 0.15s, transform 0.1s;
    display: flex; flex-direction: column; align-items: center; gap: 6px;
  }
  .sos-status-btn:active { transform: scale(0.97); opacity: 0.85; }
  .sos-status-btn .status-icon { font-size: 22px; }
  .sos-status-btn .status-count {
    font-size: 32px; font-weight: 900; line-height: 1; color: white;
  }
  .sos-status-btn .status-label {
    font-size: 12px; font-weight: 700; color: rgba(255,255,255,0.85);
    text-transform: uppercase; letter-spacing: 0.5px;
  }
  .sos-status-btn .status-sub {
    font-size: 11px; color: rgba(255,255,255,0.65); margin-top: 2px;
  }
  .btn-pending  { background: #e65100; }
  .btn-responded { background: var(--primary-green); }
  .btn-pending.idle  { background: #bdbdbd; }
  .btn-responded.idle { background: #9e9e9e; }
`;

interface Props {
  onAlertSent: () => void;
}

const SosButton: React.FC<Props> = ({ onAlertSent }) => {
  const [counting, setCounting]       = useState(false);
  const [countdown, setCountdown]     = useState(3);
  const [showToast, setShowToast]     = useState(false);
  const [toastMsg, setToastMsg]       = useState('');
  const [alertSent, setAlertSent]     = useState(false);

  /**
   * activeCount  — contacts who received the alert but have NOT responded yet.
   * respondedCount — contacts who acknowledged / responded to the alert.
   *
   * Live hook: replace simulation below with:
   *   fetchActiveCount(alertId)    → GET /api/alerts/:id/pending
   *   fetchRespondedCount(alertId) → GET /api/alerts/:id/responded
   */
  const [activeCount, setActiveCount]       = useState(0);
  const [respondedCount, setRespondedCount] = useState(0);

  const timerRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollRef    = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCountdown = () => { setCounting(true); setCountdown(3); };

  const cancelSos = () => {
    setCounting(false);
    setCountdown(3);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  // Countdown tick
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

  // Cleanup poll on unmount
  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  const triggerSos = () => {
    setCounting(false);
    setCountdown(3);

    const verified = getContacts().filter(c => c.verified);
    const total    = verified.length || 2; // demo fallback

    // TODO: POST /api/alerts  { userId, contacts: verified, location }
    console.log('[SOS] Triggering alert for', total, 'contacts:', verified.map(c => c.phone));
    console.log('[SOS] Simulating SMS send...');
    console.log('[SOS] Simulating location share...');

    setActiveCount(total);
    setRespondedCount(0);
    setAlertSent(true);

    setToastMsg(`🚨 Alert sent to ${total} contact${total !== 1 ? 's' : ''}! Help is on the way.`);
    setShowToast(true);
    onAlertSent();

    /**
     * Simulated response polling.
     * Live: replace with WebSocket listener or SSE stream.
     *   socket.on('contact_responded', ({ alertId, contactId }) => { ... })
     *   OR: setInterval(() => fetchRespondedCount(alertId), 5000)
     */
    let responded = 0;
    pollRef.current = setInterval(() => {
      if (responded < total) {
        responded += 1;
        setRespondedCount(responded);
        setActiveCount(total - responded);
      } else {
        clearInterval(pollRef.current!);
      }
    }, 5000); // simulate one response every 5s
  };

  const isIdle = !alertSent;

  return (
    <>
      <style>{sosStyles}</style>

      {/* SOS button / countdown */}
      <div style={{ textAlign: 'center', padding: '24px 0 8px' }}>
        {counting ? (
          <>
            <p className="sos-countdown">{countdown}</p>
            <p style={{ color: '#e53935', fontSize: '15px', margin: '6px 0 14px', fontWeight: 600 }}>
              Sending alert in {countdown} second{countdown !== 1 ? 's' : ''}...
            </p>
            <button className="sos-cancel-btn" onClick={cancelSos}>✕ Cancel</button>
          </>
        ) : (
          <>
            <button className="sos-btn" onClick={startCountdown}>
              <IonIcon icon={warningOutline} style={{ fontSize: '38px', marginBottom: '4px' }} />
              SOS
            </button>
            <p style={{ color: 'var(--soft-green)', fontSize: '14px', marginTop: '12px' }}>
              Press for emergency help
            </p>
          </>
        )}
      </div>

      {/* ── Status buttons — always visible ── */}
      <div className="sos-status-row">

        {/* Button 1: Active (sent but not responded) */}
        <button
          className={`sos-status-btn btn-pending${isIdle ? ' idle' : ''}`}
          disabled={isIdle}
          title="Contacts who received the alert but haven't responded yet"
          // TODO: onClick → open modal showing list of pending contacts
        >
          <IonIcon icon={peopleOutline} className="status-icon" style={{ color: 'white' }} />
          <span className="status-count">{activeCount}</span>
          <span className="status-label">Active</span>
          <span className="status-sub">
            {isIdle ? 'No alert sent yet' : 'Waiting for reply'}
          </span>
        </button>

        {/* Button 2: Responded */}
        <button
          className={`sos-status-btn btn-responded${isIdle ? ' idle' : ''}`}
          disabled={isIdle}
          title="Contacts who acknowledged your alert"
          // TODO: onClick → open modal showing list of responded contacts
        >
          <IonIcon icon={checkmarkDoneOutline} className="status-icon" style={{ color: 'white' }} />
          <span className="status-count">{respondedCount}</span>
          <span className="status-label">Responded</span>
          <span className="status-sub">
            {isIdle ? 'No alert sent yet' : 'Acknowledged'}
          </span>
        </button>

      </div>

      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMsg}
        duration={4000}
        color="danger"
        position="top"
      />
    </>
  );
};

export default SosButton;
