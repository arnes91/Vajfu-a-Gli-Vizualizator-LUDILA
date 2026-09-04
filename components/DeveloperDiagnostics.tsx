// Hidden Developer Diagnostic Overlay
// Displays real-time FPS, AudioContext sample rate, and memory usage for Web Audio & Canvas animation loops,
// plus Web MIDI hardware connection diagnostic meters.

import React, { useState, useEffect } from 'react';
import { X, Activity, Cpu, HardDrive, Radio, Sliders, Zap, CheckCircle } from 'lucide-react';
import { WebMidiController, MidiEventRecord } from './WebMidiController';

export interface DiagnosticStats {
  fps: number;
  frameTimeMs: number;
  audioSampleRate: number;
  audioState: string;
  audioLatencyMs: number;
  jsHeapUsedMB?: number;
  jsHeapTotalMB?: number;
  activeParticles: number;
  canvasResolution: string;
  glslShaderMode: string;
}

interface DeveloperDiagnosticsProps {
  isOpen: boolean;
  onClose: () => void;
  stats: DiagnosticStats;
  midiController: WebMidiController;
  onTriggerMidiNote: (note: number, vel?: number) => void;
  onTriggerMidiCC: (cc: number, val: number) => void;
}

export const DeveloperDiagnostics: React.FC<DeveloperDiagnosticsProps> = ({
  isOpen,
  onClose,
  stats,
  midiController,
  onTriggerMidiNote,
  onTriggerMidiCC,
}) => {
  const [fpsHistory, setFpsHistory] = useState<number[]>([]);
  const [lastMidiEvent, setLastMidiEvent] = useState<MidiEventRecord | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    setFpsHistory((prev) => {
      const next = [...prev, stats.fps].slice(-24);
      return next;
    });

    setLastMidiEvent(midiController.getLastEvent());
  }, [isOpen, stats.fps, midiController]);

  if (!isOpen) return null;

  const midiStatus = midiController.getStatus();
  const minFps = fpsHistory.length > 0 ? Math.min(...fpsHistory) : stats.fps;
  const maxFps = fpsHistory.length > 0 ? Math.max(...fpsHistory) : stats.fps;
  const avgFps =
    fpsHistory.length > 0
      ? (fpsHistory.reduce((a, b) => a + b, 0) / fpsHistory.length).toFixed(1)
      : stats.fps.toString();

  return (
    <div className="fixed top-12 right-4 z-50 w-84 sm:w-96 bg-[#07080f]/95 border-2 border-[#00f0ff]/80 text-white font-mono text-xs shadow-[0_0_40px_rgba(0,240,255,0.25)] select-none backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
      {/* Header */}
      <div className="flex items-center justify-between p-2.5 bg-black/80 border-b border-neutral-800">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-[#00f0ff] animate-pulse" />
          <span className="font-black text-[#00f0ff] tracking-wider text-[11px]">
            SYSTEM DIAGNOSTICS // DEV HUD
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-neutral-400 hover:text-white p-1 hover:bg-neutral-800 transition-colors"
          title="Close (Press ~ or D)"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="p-3 space-y-3 max-h-[85vh] overflow-y-auto text-[11px]">
        {/* 1. FPS & Frame Timing Loop */}
        <div className="bg-black/60 border border-neutral-800 p-2.5 space-y-1.5">
          <div className="flex justify-between items-center text-[10px] text-neutral-400 border-b border-neutral-800 pb-1">
            <span className="font-bold text-white flex items-center gap-1">
              <Zap className="w-3 h-3 text-[#ffe600]" />
              CANVAS ANIMATION LOOP
            </span>
            <span className="text-[#00ff66] font-bold">{stats.fps} FPS</span>
          </div>

          <div className="grid grid-cols-3 gap-1 text-[10px]">
            <div>
              <span className="text-neutral-500 block">AVG FPS:</span>
              <strong className="text-white">{avgFps}</strong>
            </div>
            <div>
              <span className="text-neutral-500 block">MIN / MAX:</span>
              <strong className="text-white">{minFps} / {maxFps}</strong>
            </div>
            <div>
              <span className="text-neutral-500 block">FRAME TIME:</span>
              <strong className={stats.frameTimeMs > 20 ? 'text-amber-400' : 'text-[#00ff66]'}>
                {stats.frameTimeMs.toFixed(1)} ms
              </strong>
            </div>
          </div>

          {/* Mini Sparkline Bar Chart */}
          <div className="flex items-end h-6 gap-0.5 pt-1">
            {fpsHistory.map((val, idx) => {
              const hPercent = Math.min(100, Math.max(10, (val / 60) * 100));
              return (
                <div
                  key={idx}
                  className={`flex-1 ${val >= 55 ? 'bg-[#00ff66]' : val >= 30 ? 'bg-[#ffe600]' : 'bg-[#ff0055]'}`}
                  style={{ height: `${hPercent}%` }}
                />
              );
            })}
          </div>
        </div>

        {/* 2. Web Audio Core Telemetry */}
        <div className="bg-black/60 border border-neutral-800 p-2.5 space-y-1.5">
          <div className="flex justify-between items-center text-[10px] text-neutral-400 border-b border-neutral-800 pb-1">
            <span className="font-bold text-white flex items-center gap-1">
              <Cpu className="w-3 h-3 text-[#00f0ff]" />
              WEB AUDIO CONTEXT
            </span>
            <span
              className={`font-bold uppercase ${
                stats.audioState === 'running' ? 'text-[#00ff66]' : 'text-amber-400'
              }`}
            >
              [{stats.audioState}]
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div>
              <span className="text-neutral-500 block">SAMPLE RATE:</span>
              <strong className="text-[#00f0ff] font-bold">{stats.audioSampleRate} Hz</strong>
            </div>
            <div>
              <span className="text-neutral-500 block">EST. LATENCY:</span>
              <strong className="text-white">{stats.audioLatencyMs.toFixed(2)} ms</strong>
            </div>
          </div>
        </div>

        {/* 3. Memory & Particle Allocation */}
        <div className="bg-black/60 border border-neutral-800 p-2.5 space-y-1.5">
          <div className="flex justify-between items-center text-[10px] text-neutral-400 border-b border-neutral-800 pb-1">
            <span className="font-bold text-white flex items-center gap-1">
              <HardDrive className="w-3 h-3 text-[#ff00ff]" />
              MEMORY & PIPELINE ALLOCATION
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div>
              <span className="text-neutral-500 block">JS HEAP USED:</span>
              <strong className="text-white">
                {stats.jsHeapUsedMB ? `${stats.jsHeapUsedMB.toFixed(1)} MB` : 'N/A (Sandboxed)'}
              </strong>
            </div>
            <div>
              <span className="text-neutral-500 block">JS HEAP TOTAL:</span>
              <strong className="text-white">
                {stats.jsHeapTotalMB ? `${stats.jsHeapTotalMB.toFixed(1)} MB` : 'Dynamic'}
              </strong>
            </div>
            <div>
              <span className="text-neutral-500 block">ACTIVE PARTICLES:</span>
              <strong className="text-[#ffe600] font-bold">{stats.activeParticles}</strong>
            </div>
            <div>
              <span className="text-neutral-500 block">CANVAS RESOLUTION:</span>
              <strong className="text-neutral-300">{stats.canvasResolution}</strong>
            </div>
          </div>
        </div>

        {/* 4. Web MIDI Hardware Bridge Diagnostic */}
        <div className="bg-black/60 border border-neutral-800 p-2.5 space-y-2">
          <div className="flex justify-between items-center text-[10px] text-neutral-400 border-b border-neutral-800 pb-1">
            <span className="font-bold text-white flex items-center gap-1">
              <Radio className="w-3 h-3 text-[#ffaa00]" />
              WEB MIDI HARDWARE BRIDGE
            </span>
            <span
              className={`font-bold ${
                midiStatus.isConnected ? 'text-[#00ff66]' : 'text-neutral-500'
              }`}
            >
              {midiStatus.isConnected ? 'CONNECTED' : 'LISTENING'}
            </span>
          </div>

          <div className="text-[10px]">
            <span className="text-neutral-500 block">ACTIVE PORT:</span>
            <span className="text-white truncate block font-bold">{midiStatus.activeDeviceName}</span>
          </div>

          {lastMidiEvent && (
            <div className="p-1.5 bg-neutral-900 border border-neutral-800 text-[9px]">
              <span className="text-neutral-500 block">LAST MIDI PACKET:</span>
              <span className="text-[#00ff66] font-mono">{lastMidiEvent.description}</span>
            </div>
          )}

          {/* Virtual MIDI Quick Test Triggers */}
          <div className="pt-1.5 border-t border-neutral-800 space-y-1">
            <span className="text-[9px] text-neutral-400 font-bold block">
              VIRTUAL MIDI TEST MATRIX:
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => onTriggerMidiNote(36, 127)}
                className="py-1 px-2 bg-neutral-900 border border-neutral-700 hover:border-[#ffe600] text-neutral-300 hover:text-white text-[10px] cursor-pointer"
              >
                Pad 36 (Sub Shock)
              </button>
              <button
                type="button"
                onClick={() => onTriggerMidiNote(38, 127)}
                className="py-1 px-2 bg-neutral-900 border border-neutral-700 hover:border-[#ff0055] text-neutral-300 hover:text-white text-[10px] cursor-pointer"
              >
                Pad 38 (Glitch Burst)
              </button>
              <button
                type="button"
                onClick={() => onTriggerMidiNote(40, 127)}
                className="py-1 px-2 bg-neutral-900 border border-neutral-700 hover:border-[#00f0ff] text-neutral-300 hover:text-white text-[10px] cursor-pointer"
              >
                Pad 40 (AI DJ Drop)
              </button>
              <button
                type="button"
                onClick={() => onTriggerMidiNote(42, 127)}
                className="py-1 px-2 bg-neutral-900 border border-neutral-700 hover:border-[#00ff66] text-neutral-300 hover:text-white text-[10px] cursor-pointer"
              >
                Pad 42 (Cycle Theme)
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-2 border-t border-neutral-800 bg-black/80 flex items-center justify-between text-[9px] text-neutral-500">
        <span>PRESS [~] OR [D] TO HIDE</span>
        <span>BRZI_STUDIO VJ AGENT</span>
      </div>
    </div>
  );
};
