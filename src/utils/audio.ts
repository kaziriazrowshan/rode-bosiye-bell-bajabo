/**
 * Web Audio API synthesizer for the iconic bicycle bell ("Tring Tring!")
 * Plays when user clicks "Bell Bajabo"
 */

class BellAudio {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  playRing() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      // Play double chime "tring ... tring"
      this.singleChime(ctx, now, 2400, 2900);
      this.singleChime(ctx, now + 0.12, 2450, 2950);
      this.singleChime(ctx, now + 0.32, 2400, 2900);
      this.singleChime(ctx, now + 0.44, 2450, 2950);
    } catch (e) {
      console.warn('Audio playback error', e);
    }
  }

  private singleChime(ctx: AudioContext, startTime: number, freq1: number, freq2: number) {
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq1, startTime);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq2, startTime);

    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.35, startTime + 0.015);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.28);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(startTime);
    osc2.start(startTime);

    osc1.stop(startTime + 0.3);
    osc2.stop(startTime + 0.3);
  }
}

export const bellAudio = new BellAudio();
