// Web Audio API Synthesizer for Premium UI Sound Effects
let audioCtx: AudioContext | null = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export const playSound = {
  click: (enabled: boolean) => {
    if (!enabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.05);
      
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {
      console.warn("Audio Context failed", e);
    }
  },
  
  scan: (enabled: boolean) => {
    if (!enabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.3);
      osc.frequency.linearRampToValueAtTime(200, ctx.currentTime + 0.6);
      
      gain.gain.setValueAtTime(0.02, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch (e) {
      console.warn("Audio Context failed", e);
    }
  },
  
  success: (enabled: boolean) => {
    if (!enabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const time = ctx.currentTime;
      
      // Node 1 - low chime
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(523.25, time); // C5
      gain1.gain.setValueAtTime(0.06, time);
      gain1.gain.exponentialRampToValueAtTime(0.001, time + 0.4);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(time);
      osc1.stop(time + 0.4);
      
      // Node 2 - high chime slightly delayed
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(659.25, time + 0.1); // E5
      gain2.gain.setValueAtTime(0.06, time + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.001, time + 0.5);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(time + 0.1);
      osc2.stop(time + 0.5);

      // Node 3 - highest chime
      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(783.99, time + 0.2); // G5
      gain3.gain.setValueAtTime(0.06, time + 0.2);
      gain3.gain.exponentialRampToValueAtTime(0.001, time + 0.6);
      osc3.connect(gain3);
      gain3.connect(ctx.destination);
      osc3.start(time + 0.2);
      osc3.stop(time + 0.6);
    } catch (e) {
      console.warn("Audio Context failed", e);
    }
  },
  
  error: (enabled: boolean) => {
    if (!enabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(90, ctx.currentTime + 0.25);
      
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch (e) {
      console.warn("Audio Context failed", e);
    }
  }
};
