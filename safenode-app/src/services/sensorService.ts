/**
 * sensorService.ts — Accelerometer-based safety sensor detection
 *
 * Uses the Web DeviceMotion API (works in Capacitor Android WebView).
 * For production, replace with @capacitor/motion plugin for background support.
 *
 * ── Detection Logic ──────────────────────────────────────────
 *
 * FALL DETECTION:
 *   Phase 1 — Freefall: total acceleration drops below 3 m/s² (weightlessness)
 *   Phase 2 — Impact:   total acceleration spikes above threshold (e.g. 20 m/s²)
 *   Phase 3 — Stillness: acceleration stays near 0 for 1.5s after impact
 *   All 3 phases must occur within 2 seconds.
 *
 * SHAKE DETECTION:
 *   Rapid acceleration changes above threshold, minimum 3 times within 1 second.
 *
 * MOTION DETECTION:
 *   Single sharp acceleration spike above threshold.
 *   No stillness required (distinguishes from fall).
 *
 * ── Edit thresholds ──────────────────────────────────────────
 *   SENSITIVITY_THRESHOLDS in storage.ts
 * ────────────────────────────────────────────────────────────
 */

import { getSettings, SENSITIVITY_THRESHOLDS } from '../utils/storage';

export type SensorEvent = 'fall' | 'shake' | 'motion';

type SensorCallback = (event: SensorEvent) => void;

class SensorService {
  private listener: ((e: DeviceMotionEvent) => void) | null = null;
  private callback: SensorCallback | null = null;
  private running = false;

  // ── Fall detection state ──────────────────────────────────
  private freefallDetected = false;
  private impactDetected   = false;
  private freefallTime     = 0;
  private impactTime       = 0;

  // ── Shake detection state ─────────────────────────────────
  private shakeCount     = 0;
  private shakeWindowStart = 0;
  private lastShakeAccel = 0;

  // ── Motion detection state ────────────────────────────────
  private lastMotionTime = 0;
  private MOTION_COOLDOWN = 3000; // ms between motion alerts

  // ── Cooldown to prevent duplicate triggers ────────────────
  private lastTriggerTime = 0;
  private TRIGGER_COOLDOWN = 5000; // 5 seconds between any triggers

  /**
   * Start listening to device motion events.
   * @param cb — called with 'fall' | 'shake' | 'motion' when detected
   */
  start(cb: SensorCallback): void {
    if (this.running) return;

    if (!window.DeviceMotionEvent) {
      console.warn('[Sensor] DeviceMotionEvent not supported on this device');
      return;
    }

    this.callback  = cb;
    this.running   = true;
    this.resetFallState();

    this.listener = (e: DeviceMotionEvent) => this.handleMotion(e);
    window.addEventListener('devicemotion', this.listener);
    console.log('[Sensor] Started monitoring');
  }

  /** Stop all sensor monitoring */
  stop(): void {
    if (!this.running || !this.listener) return;
    window.removeEventListener('devicemotion', this.listener);
    this.listener = null;
    this.running  = false;
    console.log('[Sensor] Stopped');
  }

  isRunning(): boolean { return this.running; }

  // ── Core motion handler ───────────────────────────────────
  private handleMotion(e: DeviceMotionEvent): void {
    const acc = e.accelerationIncludingGravity;
    if (!acc || acc.x == null || acc.y == null || acc.z == null) return;

    const settings = getSettings();
    const sens     = settings.sensitivity;
    const now      = Date.now();

    // Total acceleration magnitude
    const total = Math.sqrt(acc.x ** 2 + acc.y ** 2 + acc.z ** 2);

    // ── Fall Detection ──────────────────────────────────────
    if (settings.fallAlert) {
      const impactThreshold = SENSITIVITY_THRESHOLDS.fall[sens];
      this.detectFall(total, impactThreshold, now);
    }

    // ── Shake Detection ─────────────────────────────────────
    if (settings.shakeAlert) {
      const shakeThreshold = SENSITIVITY_THRESHOLDS.shake[sens];
      this.detectShake(total, shakeThreshold, now);
    }

    // ── Motion Detection ────────────────────────────────────
    if (settings.noMovementAlert) {
      const motionThreshold = SENSITIVITY_THRESHOLDS.motion[sens];
      this.detectMotion(total, motionThreshold, now);
    }
  }

  // ── Fall detection algorithm ──────────────────────────────
  private detectFall(total: number, impactThreshold: number, now: number): void {
    const FREEFALL_THRESHOLD = 3;    // m/s² — near weightlessness
    const STILLNESS_THRESHOLD = 4;   // m/s² — near stillness after impact
    const STILLNESS_DURATION  = 1500; // ms — must be still for this long
    const FALL_WINDOW         = 2000; // ms — all phases within this window

    // Phase 1: Freefall (low acceleration)
    if (!this.freefallDetected && total < FREEFALL_THRESHOLD) {
      this.freefallDetected = true;
      this.freefallTime     = now;
      return;
    }

    // Phase 2: Impact (high acceleration spike after freefall)
    if (this.freefallDetected && !this.impactDetected) {
      if (now - this.freefallTime > FALL_WINDOW) {
        // Too slow — reset
        this.resetFallState();
        return;
      }
      if (total > impactThreshold) {
        this.impactDetected = true;
        this.impactTime     = now;
      }
      return;
    }

    // Phase 3: Stillness after impact
    if (this.freefallDetected && this.impactDetected) {
      if (now - this.freefallTime > FALL_WINDOW * 2) {
        this.resetFallState();
        return;
      }
      if (total < STILLNESS_THRESHOLD) {
        if (now - this.impactTime >= STILLNESS_DURATION) {
          // All 3 phases confirmed — fall detected
          this.resetFallState();
          this.trigger('fall', now);
        }
      } else {
        // Movement resumed — not a fall
        this.resetFallState();
      }
    }
  }

  private resetFallState(): void {
    this.freefallDetected = false;
    this.impactDetected   = false;
    this.freefallTime     = 0;
    this.impactTime       = 0;
  }

  // ── Shake detection algorithm ─────────────────────────────
  private detectShake(total: number, threshold: number, now: number): void {
    const SHAKE_WINDOW   = 1000; // ms — 3 shakes must happen within 1 second
    const MIN_SHAKES     = 3;

    const delta = Math.abs(total - this.lastShakeAccel);
    this.lastShakeAccel = total;

    if (delta > threshold) {
      // Start new shake window
      if (this.shakeCount === 0) {
        this.shakeWindowStart = now;
      }

      // Check if still within window
      if (now - this.shakeWindowStart <= SHAKE_WINDOW) {
        this.shakeCount++;
        if (this.shakeCount >= MIN_SHAKES) {
          this.shakeCount = 0;
          this.trigger('shake', now);
        }
      } else {
        // Window expired — restart count
        this.shakeCount       = 1;
        this.shakeWindowStart = now;
      }
    }
  }

  // ── Motion detection algorithm ────────────────────────────
  private detectMotion(total: number, threshold: number, now: number): void {
    if (now - this.lastMotionTime < this.MOTION_COOLDOWN) return;

    if (total > threshold) {
      this.lastMotionTime = now;
      this.trigger('motion', now);
    }
  }

  // ── Trigger with cooldown ─────────────────────────────────
  private trigger(event: SensorEvent, now: number): void {
    if (now - this.lastTriggerTime < this.TRIGGER_COOLDOWN) return;
    this.lastTriggerTime = now;
    console.log(`[Sensor] ${event.toUpperCase()} detected`);
    this.callback?.(event);
  }
}

// Export singleton — one instance shared across the app
export const sensorService = new SensorService();
