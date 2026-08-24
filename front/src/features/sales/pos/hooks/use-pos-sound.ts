'use client';

import { useCallback, useRef } from 'react';

type PosSoundCue = 'scan' | 'success' | 'error';

const TONE_FREQUENCIES: Record<Exclude<PosSoundCue, 'scan'>, number[]> = {
  success: [660, 990],
  error: [220, 160]
};

/**
 * `scan` (add-to-cart) plays the same beep asset salespro's POS used
 * (`public/beep/beep-07.mp3`, copied in as `/sounds/pos-beep.mp3`) — a
 * single shared `<audio>` element, `currentTime` reset before each play so
 * rapid scans retrigger it instead of queuing. `success`/`error` have no
 * equivalent in the old app; kept as short synthesized cues via Web Audio.
 * All gated by `posSettings.play_sound` — pass that as `enabled`.
 */
export function usePosSound(enabled: boolean) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const contextRef = useRef<AudioContext | null>(null);

  const getAudio = useCallback(() => {
    if (typeof window === 'undefined') return null;
    if (!audioRef.current) {
      audioRef.current = new Audio('/sounds/pos-beep.mp3');
    }
    return audioRef.current;
  }, []);

  const getContext = useCallback(() => {
    if (typeof window === 'undefined') return null;
    if (!contextRef.current) {
      const AudioContextCtor =
        window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextCtor) return null;
      contextRef.current = new AudioContextCtor();
    }
    return contextRef.current;
  }, []);

  const playTone = useCallback(
    (cue: Exclude<PosSoundCue, 'scan'>) => {
      const ctx = getContext();
      if (!ctx) return;

      const frequencies = TONE_FREQUENCIES[cue];
      const noteDuration = 0.09;

      frequencies.forEach((frequency, index) => {
        const startAt = ctx.currentTime + index * noteDuration;
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, startAt);
        gain.gain.setValueAtTime(0.0001, startAt);
        gain.gain.exponentialRampToValueAtTime(0.2, startAt + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, startAt + noteDuration);
        oscillator.connect(gain);
        gain.connect(ctx.destination);
        oscillator.start(startAt);
        oscillator.stop(startAt + noteDuration);
      });
    },
    [getContext]
  );

  const playScan = useCallback(() => {
    if (!enabled) return;
    const audio = getAudio();
    if (!audio) return;
    audio.currentTime = 0;
    void audio.play().catch(() => {
      // Autoplay can be blocked before the first user gesture — harmless, no cart-blocking fallback needed.
    });
  }, [enabled, getAudio]);

  const playSuccess = useCallback(() => {
    if (!enabled) return;
    playTone('success');
  }, [enabled, playTone]);

  const playError = useCallback(() => {
    if (!enabled) return;
    playTone('error');
  }, [enabled, playTone]);

  return { playScan, playSuccess, playError };
}
