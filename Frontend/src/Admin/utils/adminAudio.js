/**
 * Web Audio API Tone Synthesizer for Real-Time Admin Alerts
 * Generates melodic chimes natively in-browser without external sound assets.
 */

class AdminAudioService {
  constructor() {
    this.audioCtx = null;
    this.enabled = typeof window !== "undefined"
      ? localStorage.getItem("admin_sound_enabled") !== "false"
      : true;
  }

  /* Lazily initialize Web Audio Context on first user gesture */
  getAudioContext() {
    if (typeof window === "undefined") return null;
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  /* Toggle sound notifications on or off */
  setSoundEnabled(enabled) {
    this.enabled = !!enabled;
    if (typeof window !== "undefined") {
      localStorage.setItem("admin_sound_enabled", this.enabled ? "true" : "false");
    }
    return this.enabled;
  }

  isSoundEnabled() {
    return this.enabled;
  }

  /* Internal helper to play a pure synthesized note with smooth attack & decay */
  playTone(frequency, startTime, duration, type = "sine", gainLevel = 0.15) {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, startTime);

    // Exponential fade-in and smooth release envelope
    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.exponentialRampToValueAtTime(gainLevel, startTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  /**
   * Melodic 2-tone chime when a customer adds an item or updates their cart
   * C5 (523.25Hz) -> E5 (659.25Hz)
   */
  playCartChime() {
    if (!this.enabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      this.playTone(523.25, now, 0.22, "sine", 0.12);
      this.playTone(659.25, now + 0.14, 0.32, "triangle", 0.15);
    } catch (err) {
      console.warn("Audio chime play error:", err);
    }
  }

  /**
   * Harmonious 3-tone chime for a confirmed Paid Order
   * C5 (523.25Hz) -> E5 (659.25Hz) -> G5 (783.99Hz)
   */
  playPaidOrderChime() {
    if (!this.enabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      this.playTone(523.25, now, 0.18, "sine", 0.15);
      this.playTone(659.25, now + 0.14, 0.20, "sine", 0.18);
      this.playTone(783.99, now + 0.28, 0.45, "triangle", 0.22);
    } catch (err) {
      console.warn("Audio chime play error:", err);
    }
  }

  /**
   * Warm 2-tone chime for Cash-on-Delivery (COD) Orders
   * A4 (440Hz) -> C#5 (554.37Hz)
   */
  playCodOrderChime() {
    if (!this.enabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      this.playTone(440.00, now, 0.25, "sine", 0.14);
      this.playTone(554.37, now + 0.18, 0.38, "triangle", 0.18);
    } catch (err) {
      console.warn("Audio chime play error:", err);
    }
  }

  /**
   * Subtle alert chime for order status transitions or cancellations
   * A5 (880Hz) -> E5 (659.25Hz)
   */
  playAlertChime() {
    if (!this.enabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      this.playTone(880.00, now, 0.15, "triangle", 0.12);
      this.playTone(659.25, now + 0.12, 0.30, "sine", 0.15);
    } catch (err) {
      console.warn("Audio chime play error:", err);
    }
  }
}

export const adminAudio = new AdminAudioService();
export default adminAudio;
