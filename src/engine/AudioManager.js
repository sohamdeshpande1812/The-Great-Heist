// Procedural Web Audio API Sound Synthesizer for THE GREAT HEIST

class AudioManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.sfxGain = null;
    this.musicGain = null;

    this.masterVolume = 0.8;
    this.sfxVolume = 0.9;
    this.musicVolume = 0.65;

    this.isMusicPlaying = false;
    this.musicInterval = null;
    this.alarmOsc = null;
    this.alarmGain = null;
    this.isAlarmActive = false;

    this.detectionOsc = null;
    this.detectionGain = null;
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);
    } catch (err) {
      console.warn('Web Audio API not supported or blocked:', err);
    }
  }

  ensureContext() {
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMasterVolume(val) {
    this.masterVolume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
    }
  }

  setSfxVolume(val) {
    this.sfxVolume = Math.max(0, Math.min(1, val));
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
    }
  }

  setMusicVolume(val) {
    this.musicVolume = Math.max(0, Math.min(1, val));
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
    }
  }

  // --- SOUND EFFECTS ---

  playFootstep() {
    this.ensureContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.08);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, t);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.09);
  }

  playJump() {
    this.ensureContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(350, t + 0.15);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.linearRampToValueAtTime(0.01, t + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.16);
  }

  playPickupLoot(value = 1000) {
    this.ensureContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Scale pitch by loot value
    const baseFreq = value >= 15000 ? 650 : value >= 8000 ? 520 : 440;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.setValueAtTime(baseFreq * 1.25, t + 0.06);
    osc.frequency.setValueAtTime(baseFreq * 1.5, t + 0.12);
    osc.frequency.setValueAtTime(baseFreq * 2.0, t + 0.18);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.36);
  }

  playTooHeavy() {
    this.ensureContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.setValueAtTime(100, t + 0.1);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.26);
  }

  playKeycardChime() {
    this.ensureContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    [587.33, 880, 1174.66].forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, t + i * 0.07);
      gain.gain.setValueAtTime(0.2, t + i * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.07 + 0.25);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t + i * 0.07);
      osc.stop(t + i * 0.07 + 0.26);
    });
  }

  playDoorOpen() {
    this.ensureContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.linearRampToValueAtTime(450, t + 0.3);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(350, t);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.42);
  }

  playAccessDenied() {
    this.ensureContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    // Two sharp descending harsh beeps — "ACCESS DENIED" feel
    [0, 0.22].forEach(delay => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(520, t + delay);
      osc.frequency.exponentialRampToValueAtTime(180, t + delay + 0.18);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(900, t + delay);
      gain.gain.setValueAtTime(0.35, t + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.2);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t + delay);
      osc.stop(t + delay + 0.22);
    });
  }

  playSwitchClick() {
    this.ensureContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(200, t + 0.08);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.11);
  }

  playVaultOpenRumble() {
    this.ensureContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(60, t);
    osc.frequency.linearRampToValueAtTime(90, t + 1.2);
    osc.frequency.linearRampToValueAtTime(40, t + 2.5);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.linearRampToValueAtTime(0.3, t + 1.5);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 3.0);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 3.1);
  }

  playLaserZap() {
    this.ensureContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    // Electric arc / zap sound
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1400, t);
    osc.frequency.exponentialRampToValueAtTime(120, t + 0.35);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2000, t);
    filter.frequency.exponentialRampToValueAtTime(400, t + 0.35);
    filter.Q.setValueAtTime(4.0, t);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.36);
  }

  playLaserDeactivated() {
    this.ensureContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    // High-tech sci-fi power-down sound
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.exponentialRampToValueAtTime(110, t + 0.6);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.62);
  }

  playSafeCrack() {
    this.ensureContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    // Rapid dial ratcheting clicks
    for (let i = 0; i < 4; i++) {
      const clickOsc = this.ctx.createOscillator();
      const clickGain = this.ctx.createGain();
      clickOsc.type = 'triangle';
      clickOsc.frequency.setValueAtTime(600 + i * 80, t + i * 0.07);
      clickGain.gain.setValueAtTime(0.15, t + i * 0.07);
      clickGain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.07 + 0.04);
      clickOsc.connect(clickGain);
      clickGain.connect(this.sfxGain);
      clickOsc.start(t + i * 0.07);
      clickOsc.stop(t + i * 0.07 + 0.05);
    }

    // Heavy vault tumbler clunk & latch thud
    const clunkOsc = this.ctx.createOscillator();
    const clunkGain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    clunkOsc.type = 'square';
    clunkOsc.frequency.setValueAtTime(160, t + 0.32);
    clunkOsc.frequency.exponentialRampToValueAtTime(45, t + 0.65);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, t + 0.32);
    clunkGain.gain.setValueAtTime(0.35, t + 0.32);
    clunkGain.gain.exponentialRampToValueAtTime(0.001, t + 0.65);
    clunkOsc.connect(filter);
    filter.connect(clunkGain);
    clunkGain.connect(this.sfxGain);
    clunkOsc.start(t + 0.32);
    clunkOsc.stop(t + 0.68);
  }

  playGlassCaseOpen() {
    this.ensureContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    // Pneumatic hiss / motorized release
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.35);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1800, t);
    filter.frequency.exponentialRampToValueAtTime(600, t + 0.35);
    filter.Q.setValueAtTime(3.0, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    noise.start(t);

    // Subtle electronic unlock chime
    [523.25, 783.99].forEach((f, idx) => {
      const osc = this.ctx.createOscillator();
      const chGain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, t + idx * 0.08);
      chGain.gain.setValueAtTime(0.12, t + idx * 0.08);
      chGain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.08 + 0.22);
      osc.connect(chGain);
      chGain.connect(this.sfxGain);
      osc.start(t + idx * 0.08);
      osc.stop(t + idx * 0.08 + 0.24);
    });
  }

  stopDetectionHum() {
    if (this.detectionOsc) {
      try {
        this.detectionOsc.stop();
        this.detectionOsc.disconnect();
      } catch (e) {}
      this.detectionOsc = null;
      this.detectionGain = null;
    }
  }

  // Camera Detection Continuous Hum
  updateDetectionHum(detectionRatio) {
    this.ensureContext();
    if (!this.ctx) return;

    if (detectionRatio > 0.08) {
      if (!this.detectionOsc) {
        this.detectionOsc = this.ctx.createOscillator();
        this.detectionGain = this.ctx.createGain();

        this.detectionOsc.type = 'sawtooth';
        this.detectionOsc.frequency.setValueAtTime(300, this.ctx.currentTime);
        this.detectionGain.gain.setValueAtTime(0.01, this.ctx.currentTime);

        this.detectionOsc.connect(this.detectionGain);
        this.detectionGain.connect(this.sfxGain);
        this.detectionOsc.start();
      }

      const freq = 300 + detectionRatio * 500;
      const vol = 0.04 + detectionRatio * 0.2;
      this.detectionOsc.frequency.setTargetAtTime(freq, this.ctx.currentTime, 0.05);
      this.detectionGain.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.05);
    } else {
      this.stopDetectionHum();
    }
  }

  // Facility Alarm Siren (Toggling Dual Tone)
  startAlarm() {
    if (this.isAlarmActive) return;
    this.ensureContext();
    if (!this.ctx) return;
    this.isAlarmActive = true;

    this.alarmOsc = this.ctx.createOscillator();
    this.alarmGain = this.ctx.createGain();

    this.alarmOsc.type = 'sawtooth';
    this.alarmGain.gain.setValueAtTime(0.3, this.ctx.currentTime);

    this.alarmOsc.connect(this.alarmGain);
    this.alarmGain.connect(this.sfxGain);
    this.alarmOsc.start();

    let toggle = false;
    this.alarmInterval = setInterval(() => {
      if (!this.isAlarmActive || !this.ctx || !this.alarmOsc) return;
      const f = toggle ? 700 : 950;
      toggle = !toggle;
      this.alarmOsc.frequency.setTargetAtTime(f, this.ctx.currentTime, 0.08);
    }, 280);
  }

  stopAlarm() {
    this.isAlarmActive = false;
    if (this.alarmInterval) {
      clearInterval(this.alarmInterval);
      this.alarmInterval = null;
    }
    if (this.alarmOsc) {
      try {
        this.alarmOsc.stop();
        this.alarmOsc.disconnect();
      } catch (e) {}
      this.alarmOsc = null;
      this.alarmGain = null;
    }
  }

  playVictoryFanfare() {
    this.ensureContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880, 1108.73];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.12);
      gain.gain.setValueAtTime(0.3, t + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.12 + 0.6);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t + idx * 0.12);
      osc.stop(t + idx * 0.12 + 0.65);
    });
  }

  playBustedSound() {
    this.ensureContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const notes = [300, 260, 220, 170];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t + idx * 0.18);
      gain.gain.setValueAtTime(0.3, t + idx * 0.18);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.18 + 0.35);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t + idx * 0.18);
      osc.stop(t + idx * 0.18 + 0.4);
    });
  }

  // --- BACKGROUND SYNTH MUSIC ---
  startMusic() {
    if (this.isMusicPlaying) return;
    this.ensureContext();
    this.isMusicPlaying = true;

    // Cyberpunk arpeggio sequencer
    const scale = [110, 130.81, 146.83, 164.81, 196.00, 220.00];
    let step = 0;

    this.musicInterval = setInterval(() => {
      if (!this.isMusicPlaying || !this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      const freq = scale[step % scale.length];
      step++;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, t);
      filter.frequency.exponentialRampToValueAtTime(150, t + 0.2);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);

      osc.start(t);
      osc.stop(t + 0.25);
    }, 180);
  }

  stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

export const audioManager = new AudioManager();
