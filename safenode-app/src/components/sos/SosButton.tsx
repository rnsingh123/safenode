/**
 * SosButton.tsx — SOS hero button
 *
 * Triggered by:
 *  - Manual tap
 *  - Sensor detection (fall / shake / motion) via triggerRef prop
 *
 * Flow:
 *  1. Countdown (configurable via sosDelay setting)
 *  2. User can cancel during countdown
 *  3. Get GPS → POST /api/sos → WhatsApp sent
 *  4. Poll alert status every 5s
 *
 * ── EDIT GUIDE ──────────────────────────────────────────────
 *  Button size/color  → .sos-core
 *  Pulse animation    → @keyframes sosPulse
 *  Status card colors → .card-pending / .card-responded
 *  API URL            → src/services/api.ts → BASE_URL
 * ────────────────────────────────────────────────────────────
 */

import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { IonIcon, IonToast } from '@ionic/react';
import { warningOutline, peopleOutline, checkmarkDoneOutline, locationOutline } from 'ionicons/icons';
import { Geolocation } from '@capacitor/geolocation';
import { apiTriggerSos, apiGetAlertStatus } from '../../services/api';
import { getSettings } from '../../utils/storage';
import { getUserIdentity } from '../../pages/Register';
import { alarmService } from '../../services/alarmService';
import type { SensorEvent } from '../../services/sensorService';

/* ── [ANIMATION AREA] ── */
const styles = `
  @keyframes sosPulse {
    0%   { transform: scale(1);    opacity: 0.6; }
    50%  { transform: scale(1.18); opacity: 0; }
    100% { transform: scale(1);    opacity: 0; }
  }
  @keyframes countPop {
    0%   { transform: scale(0.7); opacity: 0; }
    60%  { transform: scale(1.1); }
    100% { transform: scale(1);   opacity: 1; }
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .sos-ring {
    position: absolute; inset: -14px; border-radius: 50%;
    border: 3px solid rgba(198,40,40,0.45);
    animation: sosPulse 2s ease-out infinite;
    pointer-events: none;
  }
  /* [COLOR] SOS button — change gradient here */
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
  }
  .sos-core:active   { transform: scale(0.94); box-shadow: 0 4px 16px rgba(183,28,28,0.5); }
  .sos-core:disabled { opacity: 0.6; cursor: not-allowed; }
  .sos-cancel {
    margin-top: 18px; padding: 13px 40px;
    background: white; border: 2px solid var(--clr-alert);
    border-radius: var(--radius-md); color: var(--clr-alert);
    font-size: var(--font-md); font-weight: 700; cursor: pointer;
    box-shadow: var(--shadow-sm); transition: background 0.15s;
  }
  .sos-cancel:active { background: var(--clr-alert-tint); }
  /* [COLOR] status cards */
  .status-card {
    flex: 1; border-radius: var(--radius-md);
    padding: clamp(12px, 4vw, 20px) clamp(8px, 3vw, 14px);
    display: flex; flex-direction: column; align-items: center; gap: 4px;
    cursor: pointer; border: none;
    transition: transform 0.12s, opacity 0.12s;
    animation: fadeIn 0.35s ease both;
    min-width: 0;
  }
  .status-card:active { transform: scale(0.96); opacity: 0.85; }
  .card-pending   { background: var(--clr-warning); }
  .card-responded { background: var(--clr-primary); }
  .card-idle      { background: var(--clr-primary-border); cursor: default; opacity: 0.7; }
  /* Sensor trigger banner */
  .sensor-banner {
    background: var(--clr-alert-tint);
    border: 1px solid var(--clr-alert);
    border-radius: var(--radius-sm);
    padding: 10px 14px; margin-bottom: 12px;
    display: flex; align-items: center; gap: 8px;
    animation: fadeIn 0.3s ease;
  }
`;

// ── Public API exposed to parent via ref ──────────────────────
export interface SosButtonHandle {
  triggerFromSensor: (event: SensorEvent) => void;
}

interface Props {
  onAlertSent: () => void;
}

const SosButton = forwardRef<SosButtonHandle, Props>(({ onAlertSent }, ref) => {
  const [counting, setCounting]             = useState(false);
  const [countdown, setCountdown]           = useState(10);
  const [sending, setSending]               = useState(false);
  const [alertSent, setAlertSent]           = useState(false);
  const [activeCount, setActiveCount]       = useState(0);
  const [respondedCount, setRespondedCount] = useState(0);
  const [showToast, setShowToast]           = useState(false);
  const [toastMsg, setToastMsg]             = useState('');
  const [toastColor, setToastColor]         = useState<'danger' | 'warning' | 'success'>('danger');
  const [sensorTrigger, setSensorTrigger]   = useState<SensorEvent | null>(null);
  const [alarmPlaying, setAlarmPlaying]     = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Expose triggerFromSensor to parent ────────────────────
  useImperativeHandle(ref, () => ({
    triggerFromSensor: (event: SensorEvent) => {
      const settings = getSettings();
      if (!settings.autoSosOnDetect) return;
      if (counting || sending) return; // already in progress
      setSensorTrigger(event);
      startCountdown(settings.sosDelay);
    },
  }));

  const startCountdown = (delay?: number) => {
    const settings = getSettings();
    const seconds  = delay ?? settings.sosDelay ?? 10;
    setCounting(true);
    setCountdown(seconds);
  };

  const cancelSos = () => {
    setCounting(false);
    setSensorTrigger(null);
    alarmService.stop();
    setAlarmPlaying(false);
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

  // Cleanup poll and alarm on unmount
  useEffect(() => () => {
    if (pollRef.current) clearInterval(pollRef.current);
    alarmService.stop();
  }, []);

  // Poll alert status
  const startPolling = (id: string) => {
    pollRef.current = setInterval(async () => {
      try {
        const data = await apiGetAlertStatus(id);
        setActiveCount(data.pending);
        setRespondedCount(data.responded);
        if (data.pending === 0) clearInterval(pollRef.current!);
      } catch { /* silent */ }
    }, 5000);
  };

  // ── Main SOS trigger ───────────────────────────────────────
  const triggerSos = async () => {
    setCounting(false);
    setSensorTrigger(null);
    setSending(true);

    // Start loud alarm immediately — works offline
    alarmService.start();
    setAlarmPlaying(true);

    // Auto-stop alarm after 30 seconds
    setTimeout(() => { alarmService.stop(); setAlarmPlaying(false); }, 30000);

    let lat = 0, lng = 0;

    try {
      // Try Capacitor Geolocation first (native APK)
      // Fall back to browser navigator.geolocation (web/laptop)
      const isNative = !!(window as any).Capacitor?.isNativePlatform?.();

      if (isNative) {
        const permission = await Geolocation.requestPermissions();
        if (permission.location === 'granted') {
          const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000 });
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
        } else {
          throw new Error('Location permission denied');
        }
      } else {
        // Browser geolocation — works on laptop/desktop
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
          });
        });
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
      }
    } catch (geoErr: any) {
      console.warn('[SOS] GPS failed:', geoErr.message);
      setToastMsg('⚠ Could not get exact location. Alert sent without GPS.');
      setToastColor('warning');
      setShowToast(true);
    }

    try {
      const identity = getUserIdentity();
      const response = await apiTriggerSos(lat, lng, identity);
      setActiveCount(response.contacted);
      setRespondedCount(0);
      setAlertSent(true);
      setToastMsg(`🚨 Alert sent to ${response.contacted} contact${response.contacted !== 1 ? 's' : ''}! Help is on the way.`);
      setToastColor('danger');
      setShowToast(true);
      onAlertSent();
      startPolling(response.alertId);
    } catch (err: any) {
      setToastMsg(`Failed to send alert: ${err.message}. Call emergency services directly.`);
      setToastColor('warning');
      setShowToast(true);
      console.error('[SOS] Trigger failed:', err.message);
    } finally {
      setSending(false);
    }
  };

  const isIdle = !alertSent;

  // Sensor event label
  const sensorLabel: Record<SensorEvent, string> = {
    fall:   '⚠ Fall detected',
    shake:  '⚠ Shake detected',
    motion: '⚠ Sudden motion detected',
  };

  return (
    <>
      <style>{styles}</style>

      {/* Sensor trigger banner */}
      {sensorTrigger && counting && (
        <div className="sensor-banner">
          <span style={{ fontSize: '18px' }}>🔴</span>
          <div>
            <p style={{ margin: 0, fontWeight: 800, fontSize: 'var(--font-sm)', color: 'var(--clr-alert)' }}>
              {sensorLabel[sensorTrigger]}
            </p>
            <p style={{ margin: 0, fontSize: 'var(--font-xs)', color: 'var(--clr-text-secondary)' }}>
              Auto SOS will send in {countdown}s
            </p>
          </div>
        </div>
      )}

      {/* ── SOS hero area ── */}
      <div style={{ textAlign: 'center', padding: 'var(--space-xl) 0 var(--space-sm)' }}>
        {counting ? (
          <>
            <p style={{ fontSize: '72px', fontWeight: 900, color: 'var(--clr-alert)', lineHeight: 1, margin: 0, animation: 'countPop 0.3s ease' }}>
              {countdown}
            </p>
            <p style={{ color: 'var(--clr-alert)', fontSize: 'var(--font-md)', margin: '8px 0 0', fontWeight: 600 }}>
              Sending alert in {countdown}s…
            </p>
            <button className="sos-cancel" onClick={cancelSos}>✕  Cancel</button>
          </>
        ) : sending ? (
          <>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <button className="sos-core" disabled>
                <IonIcon icon={locationOutline} style={{ fontSize: '42px' }} />
                <span style={{ fontSize: '14px', fontWeight: 700 }}>Getting location…</span>
              </button>
            </div>
            <p style={{ color: 'var(--clr-alert)', fontSize: 'var(--font-sm)', marginTop: 'var(--space-md)', fontWeight: 600 }}>
              Sending emergency alert…
            </p>
          </>
        ) : (
          <>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <div className="sos-ring" />
              <button className="sos-core" onClick={() => startCountdown()}>
                <IonIcon icon={warningOutline} style={{ fontSize: '42px' }} />
                <span style={{ fontSize: '28px', fontWeight: 900, letterSpacing: '3px' }}>SOS</span>
              </button>
            </div>
            <p style={{ color: 'var(--clr-text-secondary)', fontSize: 'var(--font-sm)', marginTop: 'var(--space-md)', fontWeight: 600 }}>
              Tap for Emergency
            </p>
            {/* Status pill */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '6px',
              background: alertSent ? 'var(--clr-alert-tint)' : 'var(--clr-primary-tint)',
              borderRadius: '20px', padding: '5px 14px'
            }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', display: 'inline-block',
                background: alertSent ? 'var(--clr-alert)' : 'var(--clr-primary)' }} />
              <span style={{ fontSize: 'var(--font-xs)', fontWeight: 700,
                color: alertSent ? 'var(--clr-alert)' : 'var(--clr-primary)' }}>
                {alertSent ? 'Alert Sent' : 'Safe'}
              </span>
            </div>
          </>
        )}
      </div>

      {/* ── Status buttons ── */}
      <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>
        <button className={`status-card ${isIdle ? 'card-idle' : 'card-pending'}`} disabled={isIdle}>
          <IonIcon icon={peopleOutline} style={{ fontSize: '26px', color: 'white' }} />
          <span style={{ fontSize: 'clamp(24px, 8vw, 36px)', fontWeight: 900, color: 'white', lineHeight: 1 }}>{activeCount}</span>
          <span style={{ fontSize: 'var(--font-xs)', fontWeight: 800, color: 'rgba(255,255,255,0.9)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active</span>
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)' }}>{isIdle ? 'No alert sent' : 'Waiting for reply'}</span>
        </button>
        <button className={`status-card ${isIdle ? 'card-idle' : 'card-responded'}`} disabled={isIdle}>
          <IonIcon icon={checkmarkDoneOutline} style={{ fontSize: '26px', color: 'white' }} />
          <span style={{ fontSize: 'clamp(24px, 8vw, 36px)', fontWeight: 900, color: 'white', lineHeight: 1 }}>{respondedCount}</span>
          <span style={{ fontSize: 'var(--font-xs)', fontWeight: 800, color: 'rgba(255,255,255,0.9)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Responded</span>
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)' }}>{isIdle ? 'No alert sent' : 'Acknowledged'}</span>
        </button>
      </div>

      {/* ── Stop Alarm button — shown while alarm is playing ── */}
      {alarmPlaying && (
        <button
          onClick={() => { alarmService.stop(); setAlarmPlaying(false); }}
          style={{
            width: '100%', marginTop: 'var(--space-md)',
            padding: '14px', border: '2px solid var(--clr-alert)',
            borderRadius: 'var(--radius-md)', background: 'white',
            color: 'var(--clr-alert)', fontSize: 'var(--font-md)',
            fontWeight: 800, cursor: 'pointer', letterSpacing: '0.5px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            animation: 'fadeIn 0.3s ease',
            boxShadow: '0 0 0 4px rgba(198,40,40,0.12)',
          }}
        >
          <span style={{ fontSize: '20px' }}>🔇</span>
          Stop Alarm
        </button>
      )}

      <IonToast isOpen={showToast} onDidDismiss={() => setShowToast(false)}
        message={toastMsg} duration={5000} color={toastColor} position="top" />
    </>
  );
});

export default SosButton;
