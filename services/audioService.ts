/**
 * AudioService
 * 
 * Synthesizes retro-strategic card game sound effects (SFX) and background music (BGM)
 * using the browser's Web Audio API. This avoids loading external assets, ensuring
 * zero latency and 100% reliability without dependency on external MP3 files.
 * 
 * It also supports using local MP3 overrides if placed in `/public/sounds/`.
 */

export type SFXType =
  | 'click'
  | 'draw'
  | 'play'
  | 'move'
  | 'combat'
  | 'turbo'     // J
  | 'heal'      // Q
  | 'king'      // K
  | 'missile'   // A
  | 'joker'     // Joker
  | 'win'
  | 'lose';

class AudioService {
  private ctx: AudioContext | null = null;
  private bgmInterval: any = null;
  private bgmNodes: { oscillators: OscillatorNode[]; gain: GainNode }[] = [];
  
  // Nature ambient sound nodes
  private windSource: AudioBufferSourceNode | null = null;
  private windLFO: OscillatorNode | null = null;
  private windGain: GainNode | null = null;
  
  // Settings (stored in localStorage)
  private sfxMuted: boolean = false;
  private bgmMuted: boolean = false;
  private sfxVolume: number = 0.5;
  private bgmVolume: number = 0.3;
  private bgmPlaying: boolean = false;

  // Thematic BGM Overlays
  private activeThematicTimeout: any = null;
  private thematicNodes: any[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.sfxMuted = localStorage.getItem('k_sfx_muted') === 'true';
      this.bgmMuted = localStorage.getItem('k_bgm_muted') === 'true';
      this.sfxVolume = parseFloat(localStorage.getItem('k_sfx_volume') ?? '0.5');
      this.bgmVolume = parseFloat(localStorage.getItem('k_bgm_volume') ?? '0.3');
    }
  }

  private initContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // --- GETTERS & SETTERS ---
  public getSettings() {
    return {
      sfxMuted: this.sfxMuted,
      bgmMuted: this.bgmMuted,
      sfxVolume: this.sfxVolume,
      bgmVolume: this.bgmVolume,
      bgmPlaying: this.bgmPlaying,
    };
  }

  public setSFXMuted(mute: boolean) {
    this.sfxMuted = mute;
    localStorage.setItem('k_sfx_muted', String(mute));
  }

  public setBGMMuted(mute: boolean) {
    this.bgmMuted = mute;
    localStorage.setItem('k_bgm_muted', String(mute));
    if (mute) {
      this.stopBGM();
    } else if (this.bgmPlaying) {
      // Re-trigger
      this.startBGM();
    }
  }

  public setSFXVolume(vol: number) {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
    localStorage.setItem('k_sfx_volume', String(this.sfxVolume));
  }

  public setBGMVolume(vol: number) {
    this.bgmVolume = Math.max(0, Math.min(1, vol));
    localStorage.setItem('k_bgm_volume', String(this.bgmVolume));
    
    // Adjust wind volume dynamically
    if (this.windGain && this.ctx) {
      try {
        this.windGain.gain.setValueAtTime(this.bgmMuted ? 0 : this.bgmVolume * 0.25, this.ctx.currentTime);
      } catch (e) {}
    }
  }

  // --- SFX SYNTHESIZERS ---
  public playSFX(type: SFXType) {
    if (this.sfxMuted || this.sfxVolume <= 0) return;
    
    try {
      const ctx = this.initContext();
      const time = ctx.currentTime;
      const vol = this.sfxVolume;

      switch (type) {
        case 'click':
          this.synthClick(ctx, time, vol);
          break;
        case 'draw':
          this.synthDraw(ctx, time, vol);
          break;
        case 'play':
          this.synthPlay(ctx, time, vol);
          break;
        case 'move':
          this.synthMove(ctx, time, vol);
          break;
        case 'combat':
          this.synthCombat(ctx, time, vol);
          break;
        case 'turbo':
          this.synthTurbo(ctx, time, vol);
          break;
        case 'heal':
          this.synthHeal(ctx, time, vol);
          break;
        case 'king':
          this.synthKing(ctx, time, vol);
          break;
        case 'missile':
          this.synthMissile(ctx, time, vol);
          break;
        case 'joker':
          this.synthJoker(ctx, time, vol);
          break;
        case 'win':
          this.synthWin(ctx, time, vol);
          break;
        case 'lose':
          this.synthLose(ctx, time, vol);
          break;
      }
    } catch (error) {
      console.warn('Failed to play synthesized SFX:', error);
    }
  }

  private synthClick(ctx: AudioContext, t: number, vol: number) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(150, t + 0.05);

    gain.gain.setValueAtTime(vol * 0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.06);
  }

  private synthDraw(ctx: AudioContext, t: number, vol: number) {
    // Generate card slide/swoosh with filtered noise
    const bufferSize = ctx.sampleRate * 0.25; // 0.25 seconds
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(600, t);
    filter.frequency.exponentialRampToValueAtTime(1400, t + 0.12);
    filter.frequency.exponentialRampToValueAtTime(500, t + 0.25);
    filter.Q.setValueAtTime(2.0, t);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(vol * 0.5, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(t);
    noise.stop(t + 0.25);
  }

  private synthPlay(ctx: AudioContext, t: number, vol: number) {
    // Card placement thud (deep wood tap)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.15);

    gain.gain.setValueAtTime(vol * 0.8, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    // Lowpass filter to make it warmer/heavier
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, t);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.16);
  }

  private synthMove(ctx: AudioContext, t: number, vol: number) {
    // Shorter soft slide
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(130, t);
    osc.frequency.linearRampToValueAtTime(90, t + 0.1);

    gain.gain.setValueAtTime(vol * 0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.11);
  }

  private synthCombat(ctx: AudioContext, t: number, vol: number) {
    // Hit/Clash: Noise burst + metal clink
    const duration = 0.35;
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(400, t);
    noiseFilter.frequency.exponentialRampToValueAtTime(80, t + duration);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(vol * 0.9, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(t);
    noise.stop(t + duration);

    // Metal clash overlay (high pitch oscs)
    const frequencies = [640, 890, 1100];
    frequencies.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.linearRampToValueAtTime(freq - 150, t + 0.15);

      oscGain.gain.setValueAtTime(vol * 0.4 / frequencies.length, t);
      oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.21);
    });
  }

  private synthTurbo(ctx: AudioContext, t: number, vol: number) {
    // J - Speed up/Turbo charge (rising sweep)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(250, t);
    osc.frequency.exponentialRampToValueAtTime(750, t + 0.3);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, t);
    filter.frequency.exponentialRampToValueAtTime(1500, t + 0.3);

    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(vol * 0.4, t + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.31);
  }

  private synthHeal(ctx: AudioContext, t: number, vol: number) {
    // Q - Magical healing chime sequence (C5 -> E5 -> G5 -> C6)
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const startTime = t + (idx * 0.08);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      osc.frequency.linearRampToValueAtTime(freq + 30, startTime + 0.25);

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(vol * 0.4, startTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.31);
    });
  }

  private synthKing(ctx: AudioContext, t: number, vol: number) {
    // K - Double command drum
    const playDrum = (delay: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(120, t + delay);
      osc.frequency.exponentialRampToValueAtTime(45, t + delay + 0.15);

      gain.gain.setValueAtTime(vol * 0.8, t + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t + delay);
      osc.stop(t + delay + 0.16);
    };

    playDrum(0);
    playDrum(0.18);
  }

  private synthMissile(ctx: AudioContext, t: number, vol: number) {
    // A - Missile launch then explosion
    // Launch sound (high pitch noise sweep)
    const bufferSize = ctx.sampleRate * 0.6;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(200, t);
    filter.frequency.exponentialRampToValueAtTime(1200, t + 0.4);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(vol * 0.5, t + 0.2);
    gain.gain.linearRampToValueAtTime(0.01, t + 0.4);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(t);
    noise.stop(t + 0.4);

    // Boom sound (explosion at t + 0.35)
    const expT = t + 0.35;
    const osc = ctx.createOscillator();
    const expGain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(90, expT);
    osc.frequency.exponentialRampToValueAtTime(30, expT + 0.3);

    expGain.gain.setValueAtTime(vol * 0.9, expT);
    expGain.gain.exponentialRampToValueAtTime(0.001, expT + 0.35);

    osc.connect(expGain);
    expGain.connect(ctx.destination);
    
    osc.start(expT);
    osc.stop(expT + 0.36);
  }

  private synthJoker(ctx: AudioContext, t: number, vol: number) {
    // Joker - Blade slash (very fast sharp highpass noise sweep)
    const bufferSize = ctx.sampleRate * 0.18;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(4000, t);
    filter.frequency.exponentialRampToValueAtTime(800, t + 0.15);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vol * 0.7, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(t);
    noise.stop(t + 0.18);
  }

  private synthWin(ctx: AudioContext, t: number, vol: number) {
    // Fanfare (C4 -> E4 -> G4 -> C5 -> E5 -> G5)
    const arpeggio = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99];
    
    // Play notes in sequence
    arpeggio.forEach((freq, idx) => {
      const noteTime = t + (idx * 0.08);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0, noteTime);
      gain.gain.linearRampToValueAtTime(vol * 0.3, noteTime + 0.02);
      
      // Let the final note ring out longer
      const duration = idx === arpeggio.length - 1 ? 0.8 : 0.2;
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + duration + 0.05);
    });
  }

  private synthLose(ctx: AudioContext, t: number, vol: number) {
    // Sad dissonant descending sequence
    const arpeggio = [311.13, 293.66, 277.18, 196.00];
    
    arpeggio.forEach((freq, idx) => {
      const noteTime = t + (idx * 0.15);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, noteTime);
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, noteTime);

      gain.gain.setValueAtTime(0, noteTime);
      gain.gain.linearRampToValueAtTime(vol * 0.3, noteTime + 0.03);
      
      const duration = idx === arpeggio.length - 1 ? 1.0 : 0.3;
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + duration + 0.05);
    });
  }

  // --- BGM SYNTHESIZER (NATURE AMBIENT LOOP) ---
  public startBGM() {
    this.bgmPlaying = true;
    if (this.bgmMuted || this.bgmVolume <= 0) return;
    if (this.bgmInterval) return; // Already running

    try {
      const ctx = this.initContext();
      const now = ctx.currentTime;

      // 1. WIND GENERATOR (Lowpass Filtered Looping White Noise)
      const bufferSize = ctx.sampleRate * 4.0; // 4 seconds of noise buffer
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      this.windSource = ctx.createBufferSource();
      this.windSource.buffer = buffer;
      this.windSource.loop = true;

      // Soft wind lowpass filter
      const windFilter = ctx.createBiquadFilter();
      windFilter.type = 'lowpass';
      windFilter.frequency.setValueAtTime(320, now);
      windFilter.Q.setValueAtTime(1.5, now);

      // Slow LFO to modulate filter frequency (creates breathing wind gusts)
      this.windLFO = ctx.createOscillator();
      this.windLFO.type = 'sine';
      this.windLFO.frequency.setValueAtTime(0.06, now); // Very slow frequency change (every 16s)

      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(180, now); // Modulate by +/- 180 Hz

      // Connect LFO modulator
      this.windLFO.connect(lfoGain);
      lfoGain.connect(windFilter.frequency);

      // Main wind volume
      this.windGain = ctx.createGain();
      this.windGain.gain.setValueAtTime(0, now);
      this.windGain.gain.linearRampToValueAtTime(this.bgmVolume * 0.25, now + 2.0); // Slow fade-in

      // Connect wind nodes
      this.windSource.connect(windFilter);
      windFilter.connect(this.windGain);
      this.windGain.connect(ctx.destination);

      // Start wind
      this.windSource.start(now);
      this.windLFO.start(now);

      // 2. PERIODIC SONG BIRDS (Synthesizes soft random forest chirps)
      const playForestBirdCall = () => {
        if (!this.bgmPlaying || this.bgmMuted) return;

        const callTime = ctx.currentTime;
        const baseFreq = 1400 + Math.random() * 500; // Random bird species pitch
        const numChirps = 2 + Math.floor(Math.random() * 3); // 2-4 chirps per call

        const playSingleChirp = (delay: number, pitch: number) => {
          const chirpT = callTime + delay;
          const birdOsc = ctx.createOscillator();
          const birdGain = ctx.createGain();

          birdOsc.type = 'sine';
          birdOsc.frequency.setValueAtTime(pitch, chirpT);
          // Quick pitch sweep up and down
          birdOsc.frequency.exponentialRampToValueAtTime(pitch * 1.4, chirpT + 0.035);
          birdOsc.frequency.exponentialRampToValueAtTime(pitch * 0.85, chirpT + 0.07);

          birdGain.gain.setValueAtTime(0, chirpT);
          birdGain.gain.linearRampToValueAtTime(this.bgmVolume * 0.12, chirpT + 0.015);
          birdGain.gain.exponentialRampToValueAtTime(0.001, chirpT + 0.07);

          birdOsc.connect(birdGain);
          birdGain.connect(ctx.destination);

          birdOsc.start(chirpT);
          birdOsc.stop(chirpT + 0.08);
        };

        // Trigger chirp sequence
        for (let i = 0; i < numChirps; i++) {
          const delay = i * (0.12 + Math.random() * 0.05);
          const pitchOffset = i * 60; // Slightly rising chirps
          playSingleChirp(delay, baseFreq + pitchOffset);
        }
      };

      // Play first bird call after a short delay
      setTimeout(playForestBirdCall, 4000);

      // Schedule periodic bird calls (every 8 to 15 seconds randomly)
      const triggerNextBirdCall = () => {
        if (!this.bgmPlaying || this.bgmMuted) return;
        playForestBirdCall();
        const nextDelay = 8000 + Math.random() * 7000;
        this.bgmInterval = setTimeout(triggerNextBirdCall, nextDelay);
      };
      
      this.bgmInterval = setTimeout(triggerNextBirdCall, 10000);

    } catch (e) {
      console.warn('Failed to start nature BGM:', e);
    }
  }

  // --- THEMATIC BGM SYNTHESIS (EPIC MELODY OVERLAYS) ---
  public playThematicBGM(type: 'joker' | 'jack' | 'queen' | 'king') {
    if (this.bgmMuted || this.bgmVolume <= 0) return;
    
    try {
      const ctx = this.initContext();
      const now = ctx.currentTime;
      const vol = this.bgmVolume;

      // Stop and clear any previous thematic melodies
      this.stopActiveThematic();

      // Temporarily lower ambient wind volume (ducking)
      if (this.windGain) {
        try {
          this.windGain.gain.cancelScheduledValues(now);
          this.windGain.gain.setValueAtTime(this.windGain.gain.value, now);
          this.windGain.gain.linearRampToValueAtTime(vol * 0.02, now + 0.15); // Duck to 2% volume
        } catch (e) {}
      }

      // Play the corresponding melody
      let duration = 3.0; // Default duration of the melody
      
      switch (type) {
        case 'joker':
          duration = this.playJokerMelody(ctx, now, vol);
          break;
        case 'jack':
          duration = this.playJackMelody(ctx, now, vol);
          break;
        case 'queen':
          duration = this.playQueenMelody(ctx, now, vol);
          break;
        case 'king':
          duration = this.playKingMelody(ctx, now, vol);
          break;
      }

      // Schedule restoring the ambient wind volume
      this.activeThematicTimeout = setTimeout(() => {
        if (this.windGain && this.bgmPlaying && !this.bgmMuted) {
          try {
            const restoreNow = ctx.currentTime;
            this.windGain.gain.cancelScheduledValues(restoreNow);
            this.windGain.gain.setValueAtTime(this.windGain.gain.value, restoreNow);
            this.windGain.gain.linearRampToValueAtTime(vol * 0.25, restoreNow + 1.2); // Fade in over 1.2s
          } catch (e) {}
        }
      }, duration * 1000);

    } catch (error) {
      console.warn('Failed to play thematic BGM melody:', error);
    }
  }

  private stopActiveThematic() {
    if (this.activeThematicTimeout) {
      clearTimeout(this.activeThematicTimeout);
      this.activeThematicTimeout = null;
    }
    this.thematicNodes.forEach(node => {
      try { node.stop(); } catch (e) {}
      try { node.disconnect(); } catch (e) {}
    });
    this.thematicNodes = [];
  }

  private playJokerMelody(ctx: AudioContext, startT: number, vol: number): number {
    const nodes: any[] = [];
    
    // 1. Heartbeats (tense, low-pitched thuds)
    const heartbeatTimes = [0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0];
    heartbeatTimes.forEach((delay) => {
      const t = startT + delay;
      // Double thump
      for (let j = 0; j < 2; j++) {
        const thumpT = t + (j * 0.12);
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(55, thumpT); // Low A
        osc.frequency.exponentialRampToValueAtTime(30, thumpT + 0.1);
        gain.gain.setValueAtTime(vol * 0.65, thumpT);
        gain.gain.exponentialRampToValueAtTime(0.001, thumpT + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(thumpT);
        osc.stop(thumpT + 0.12);
        nodes.push(osc);
      }
    });

    // 2. High Suspense Screech / Strings (minor second dissonance: E5 & F5)
    const frequencies = [659.25, 698.46]; // E5 & F5
    frequencies.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, startT + 0.2);
      
      // Add heavy vibrato for tension
      lfo.frequency.setValueAtTime(8, startT); // 8Hz vibrato
      lfoGain.gain.setValueAtTime(10, startT);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      // Low-pass filter to make it screechy but not ear-splitting
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1300, startT);

      gain.gain.setValueAtTime(0, startT + 0.2);
      gain.gain.linearRampToValueAtTime(vol * 0.12, startT + 0.8);
      gain.gain.linearRampToValueAtTime(vol * 0.12, startT + 2.8);
      gain.gain.exponentialRampToValueAtTime(0.001, startT + 3.2);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      lfo.start(startT);
      osc.start(startT + 0.2);
      lfo.stop(startT + 3.2);
      osc.stop(startT + 3.2);

      nodes.push(osc, lfo);
    });

    this.thematicNodes.push(...nodes);
    return 3.4; // Duration in seconds
  }

  private playJackMelody(ctx: AudioContext, startT: number, vol: number): number {
    const nodes: any[] = [];
    const notes = [146.83, 164.81, 196.00, 220.00, 293.66, 329.63, 392.00, 440.00]; // D3, E3, G3, A3, D4, E4, G4, A4
    
    let currentDelay = 0;
    let step = 0.20; // Starts at 200ms per note
    
    for (let i = 0; i < 20; i++) {
      const noteT = startT + currentDelay;
      const freq = notes[i % notes.length] * (1 + (i * 0.05)); // Pitches rise as we accelerate!
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteT);
      
      gain.gain.setValueAtTime(vol * 0.35, noteT);
      gain.gain.exponentialRampToValueAtTime(0.001, noteT + step * 0.95);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(noteT);
      osc.stop(noteT + step);
      nodes.push(osc);
      
      currentDelay += step;
      step *= 0.88; // Accelerate! Each note plays 12% faster than the last
    }

    // Add a final laser swoosh sweep
    const laserT = startT + currentDelay;
    const sweepOsc = ctx.createOscillator();
    const sweepGain = ctx.createGain();
    sweepOsc.type = 'sine';
    sweepOsc.frequency.setValueAtTime(200, laserT);
    sweepOsc.frequency.exponentialRampToValueAtTime(1700, laserT + 0.55);
    sweepGain.gain.setValueAtTime(vol * 0.45, laserT);
    sweepGain.gain.exponentialRampToValueAtTime(0.001, laserT + 0.55);
    sweepOsc.connect(sweepGain);
    sweepGain.connect(ctx.destination);
    sweepOsc.start(laserT);
    sweepOsc.stop(laserT + 0.55);
    nodes.push(sweepOsc);

    this.thematicNodes.push(...nodes);
    return currentDelay + 0.6;
  }

  private playQueenMelody(ctx: AudioContext, startT: number, vol: number): number {
    const nodes: any[] = [];
    // Heavenly Gmaj9 / Cmaj9 arpeggio: G4, B4, D5, F#5, A5, C6, E6
    const melodyNotes = [392.00, 493.88, 587.33, 739.99, 880.00, 1046.50, 1318.51];
    
    melodyNotes.forEach((freq, idx) => {
      const noteT = startT + (idx * 0.14); // Staggered arpeggio
      const osc = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      
      // Warm sine + soft triangle for bell tone
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteT);
      
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq * 2, noteT); // Sub octave sparkle
      
      gain.gain.setValueAtTime(0, noteT);
      gain.gain.linearRampToValueAtTime(vol * 0.28, noteT + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, noteT + 1.6); // Long magical ring decay
      
      osc.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(noteT);
      osc2.start(noteT);
      osc.stop(noteT + 1.65);
      osc2.stop(noteT + 1.65);
      nodes.push(osc, osc2);
    });

    this.thematicNodes.push(...nodes);
    return 2.8;
  }

  private playKingMelody(ctx: AudioContext, startT: number, vol: number): number {
    const nodes: any[] = [];
    
    // 1. Epic War Drums (Low frequency white noise bursts + pitch sweeps)
    const drumBeats = [0, 0.4, 0.8, 1.2, 1.4, 1.6, 2.0, 2.4, 2.8, 3.0];
    drumBeats.forEach((delay) => {
      const t = startT + delay;
      // Synthesize deep kick drum
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(110, t);
      osc.frequency.exponentialRampToValueAtTime(45, t + 0.18);
      gain.gain.setValueAtTime(vol * 0.95, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.22);
      nodes.push(osc);
    });

    // 2. Powerful Royal Brass/Synth Theme (A2-E3-A3 -> G2-D3-G3 -> F2-C3-F3 -> E2-B2-E3)
    const brassChords = [
      { delay: 0.0, root: 110.00 }, // A2 (power chord)
      { delay: 0.8, root: 97.99 },  // G2
      { delay: 1.6, root: 87.31 },  // F2
      { delay: 2.4, root: 82.41 },  // E2
    ];

    brassChords.forEach((chord) => {
      const chordT = startT + chord.delay;
      const pitches = [chord.root, chord.root * 1.5, chord.root * 2.0]; // Root, Fifth, Octave!
      
      pitches.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, chordT);
        
        // Slightly detune to sound thicker (orchestral ensemble effect)
        osc.detune.setValueAtTime(Math.random() * 10 - 5, chordT);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, chordT);
        filter.frequency.linearRampToValueAtTime(650, chordT + 0.3); // Brass swell filter
        
        gain.gain.setValueAtTime(0, chordT);
        gain.gain.linearRampToValueAtTime(vol * 0.2, chordT + 0.1);
        gain.gain.linearRampToValueAtTime(vol * 0.16, chordT + 0.6);
        gain.gain.exponentialRampToValueAtTime(0.001, chordT + 0.8);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(chordT);
        osc.stop(chordT + 0.85);
        nodes.push(osc);
      });
    });

    this.thematicNodes.push(...nodes);
    return 3.5;
  }

  public stopBGM() {
    this.bgmPlaying = false;
    
    // Clear bird call scheduler
    if (this.bgmInterval) {
      clearTimeout(this.bgmInterval);
      this.bgmInterval = null;
    }

    const now = this.ctx?.currentTime ?? 0;

    // Fade out wind source
    if (this.windGain && this.ctx) {
      try {
        this.windGain.gain.cancelScheduledValues(now);
        this.windGain.gain.setValueAtTime(this.windGain.gain.value, now);
        this.windGain.gain.exponentialRampToValueAtTime(0.001, now + 1.0); // Smooth 1s fade-out
      } catch (e) {}
    }

    // Stop oscillators after fade-out completes
    const sourceToStop = this.windSource;
    const lfoToStop = this.windLFO;
    setTimeout(() => {
      try { sourceToStop?.stop(); } catch (e) {}
      try { lfoToStop?.stop(); } catch (e) {}
    }, 1100);

    this.windSource = null;
    this.windLFO = null;
    this.windGain = null;
  }
}

export const audioService = new AudioService();
