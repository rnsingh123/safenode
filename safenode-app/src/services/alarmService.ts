/**
 * alarmService.ts — Offline-capable loud alarm
 *
 * Uses the Web Audio API — works 100% offline, no internet needed.
 * Generates a loud, attention-grabbing siren sound using oscillators.
 *
 * The alarm:
 *  - Alternates between two high frequencies (like a real siren)
 *  - Runs at maximum volume
 *  - Loops until manually stopped
 *  - Works even if the backend is unreachable
 *
 * Usage:
 *   alarmService.start()  — start the alarm
 *   alarmService.stop()   — stop the alarm
 *   alarmService.isPlaying() — check if alarm is active
 */

class AlarmService {
  private audioCtx: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private lfoOscillator: OscillatorNode | null = null; // LFO for siren sweep effect
  private lfoGain: GainNode | null = null;
  private playing = false;

  /**
   * Start the alarm siren.
   * Creates a sweeping siren effect between 800Hz and 1200Hz.
   * Loops indefinitely until stop() is called.
   */
  start(): void {
    if (this.playing) return;

    try {
      // Create audio context (works offline — uses device hardware directly)
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

      // Main oscillator — generates the siren tone
      this.oscillator = this.audioCtx.createOscillator();
      this.oscillator.type = 'sawtooth'; // harsh, attention-grabbing waveform

      // Gain node — controls volume (set to max)
      this.gainNode = this.audioCtx.createGain();
      this.gainNode.gain.setValueAtTime(1.0, this.audioCtx.currentTime); // max volume

      // LFO (Low Frequency Oscillator) — sweeps the pitch up and down for siren effect
      this.lfoOscillator = this.audioCtx.createOscillator();
      this.lfoOscillator.type = 'sine';
      this.lfoOscillator.frequency.setValueAtTime(0.8, this.audioCtx.currentTime); // sweep speed

      this.lfoGain = this.audioCtx.createGain();
      this.lfoGain.gain.setValueAtTime(200, this.audioCtx.currentTime); // pitch sweep range ±200Hz

      // Base frequency — center of the siren sweep
      this.oscillator.frequency.setValueAtTime(1000, this.audioCtx.currentTime);

      // Connect: LFO → LFO gain → oscillator frequency (modulates pitch)
      this.lfoOscillator.connect(this.lfoGain);
      this.lfoGain.connect(this.oscillator.frequency);

      // Connect: oscillator → gain → output speakers
      this.oscillator.connect(this.gainNode);
      this.gainNode.connect(this.audioCtx.destination);

      // Start both oscillators
      this.oscillator.start();
      this.lfoOscillator.start();

      this.playing = true;
      console.log('[Alarm] Siren started');
    } catch (err) {
      console.error('[Alarm] Failed to start:', err);
    }
  }

  /**
   * Stop the alarm and clean up audio resources.
   */
  stop(): void {
    if (!this.playing) return;

    try {
      this.oscillator?.stop();
      this.lfoOscillator?.stop();
      this.oscillator?.disconnect();
      this.lfoOscillator?.disconnect();
      this.gainNode?.disconnect();
      this.lfoGain?.disconnect();
      this.audioCtx?.close();
    } catch (err) {
      // Ignore errors during cleanup
    } finally {
      this.oscillator    = null;
      this.lfoOscillator = null;
      this.gainNode      = null;
      this.lfoGain       = null;
      this.audioCtx      = null;
      this.playing       = false;
      console.log('[Alarm] Siren stopped');
    }
  }

  isPlaying(): boolean {
    return this.playing;
  }
}

// Singleton — one alarm instance shared across the app
export const alarmService = new AlarmService();
