import { useRef, useState, useEffect, useCallback } from "react";

const MUTE_KEY = "galaxy-audio-muted";

export function useGalaxyAudio() {
  const ctxRef = useRef<AudioContext | null>(null);
  const ambientNodesRef = useRef<{ osc1: OscillatorNode; osc2: OscillatorNode; gain: GainNode } | null>(null);
  const hoverTimerRef = useRef<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    try {
      return localStorage.getItem(MUTE_KEY) === "true";
    } catch {
      return false;
    }
  });
  const isMutedRef = useRef(isMuted);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  const getCtx = useCallback((): AudioContext | null => {
    if (!ctxRef.current) {
      try {
        ctxRef.current = new AudioContext();
      } catch {
        return null;
      }
    }
    return ctxRef.current;
  }, []);

  // Internal helper: start ambient nodes on an existing, running context
  const _startAmbientNodes = useCallback((ctx: AudioContext) => {
    if (ambientNodesRef.current) return;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.02, ctx.currentTime + 2.0);
    gain.connect(ctx.destination);

    const osc1 = ctx.createOscillator();
    osc1.type = "sine";
    osc1.frequency.value = 55;
    osc1.connect(gain);
    osc1.start();

    const osc2 = ctx.createOscillator();
    osc2.type = "sine";
    osc2.frequency.value = 57.5;
    osc2.connect(gain);
    osc2.start();

    ambientNodesRef.current = { osc1, osc2, gain };
  }, []);

  const startAmbient = useCallback(() => {
    // Always create context on first call (satisfies browser gesture policy
    // even when muted — ensures unmute works later without needing another click)
    const ctx = getCtx();
    if (!ctx) return;

    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    // Don't start oscillators if muted — but context is now initialised
    if (isMutedRef.current) return;

    _startAmbientNodes(ctx);
  }, [getCtx, _startAmbientNodes]);

  const stopAmbient = useCallback(() => {
    if (!ambientNodesRef.current || !ctxRef.current) return;
    const ctx = ctxRef.current;
    const { osc1, osc2, gain } = ambientNodesRef.current;
    gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
    setTimeout(() => {
      try { osc1.stop(); } catch {}
      try { osc2.stop(); } catch {}
      try { gain.disconnect(); } catch {}
    }, 600);
    ambientNodesRef.current = null;
  }, []);

  const playHover = useCallback(() => {
    if (isMutedRef.current) return;
    const now = performance.now();
    if (now - hoverTimerRef.current < 200) return;
    hoverTimerRef.current = now;

    const ctx = getCtx();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume().catch(() => {});

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
  }, [getCtx]);

  const playWarp = useCallback(() => {
    if (isMutedRef.current) return;
    const ctx = getCtx();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume().catch(() => {});

    // White noise whoosh
    const bufferSize = ctx.sampleRate * 0.5;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(200, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(4000, ctx.currentTime + 0.4);
    filter.Q.value = 1.5;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.2, ctx.currentTime);
    noiseGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);

    source.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    source.start(ctx.currentTime);

    // Descending sine tone
    const toneOsc = ctx.createOscillator();
    toneOsc.type = "sine";
    toneOsc.frequency.setValueAtTime(220, ctx.currentTime);
    toneOsc.frequency.exponentialRampToValueAtTime(55, ctx.currentTime + 0.5);

    const toneGain = ctx.createGain();
    toneGain.gain.setValueAtTime(0.15, ctx.currentTime);
    toneGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);

    toneOsc.connect(toneGain);
    toneGain.connect(ctx.destination);
    toneOsc.start(ctx.currentTime);
    toneOsc.stop(ctx.currentTime + 0.55);
  }, [getCtx]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      isMutedRef.current = next;
      try {
        localStorage.setItem(MUTE_KEY, String(next));
      } catch {}

      if (next) {
        // Muting: suspend context to silence everything
        if (ctxRef.current && ctxRef.current.state === "running") {
          ctxRef.current.suspend().catch(() => {});
        }
      } else {
        // Unmuting: ensure context exists (handles case where user was muted before
        // ever clicking the canvas — getCtx() creates it here so no extra gesture needed
        // since toggleMute itself is a user gesture)
        const ctx = ctxRef.current ?? (() => {
          try { ctxRef.current = new AudioContext(); } catch {}
          return ctxRef.current;
        })();

        if (ctx) {
          if (ctx.state === "suspended") {
            ctx.resume().catch(() => {});
          }
          // Start ambient nodes if they aren't running yet
          if (!ambientNodesRef.current) {
            _startAmbientNodes(ctx);
          }
        }
      }
      return next;
    });
  }, [_startAmbientNodes]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAmbient();
      if (ctxRef.current) {
        ctxRef.current.close().catch(() => {});
        ctxRef.current = null;
      }
    };
  }, [stopAmbient]);

  return { startAmbient, stopAmbient, playHover, playWarp, isMuted, toggleMute };
}
