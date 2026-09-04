import React, { useEffect, useRef, useState } from 'react';
import { LyricLine } from '../types';
import { Scissors, Play, RotateCcw, Clock, Sparkles } from 'lucide-react';

interface WaveformTrimmerProps {
  audioBuffer: AudioBuffer | null;
  cutStart: number;
  cutEnd: number;
  onCutChange: (start: number, end: number) => void;
  currentTime: number;
  onSeek: (time: number) => void;
  lyrics: LyricLine[];
  themePrimary: string;
}

export const WaveformTrimmer: React.FC<WaveformTrimmerProps> = ({
  audioBuffer,
  cutStart,
  cutEnd,
  onCutChange,
  currentTime,
  onSeek,
  lyrics,
  themePrimary,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [peaks, setPeaks] = useState<number[]>([]);
  const isDraggingRef = useRef<'start' | 'end' | 'scrub' | null>(null);

  // Format mm:ss.s
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms}`;
  };

  const totalDuration = audioBuffer ? audioBuffer.duration : 0;

  // Extract waveform peaks from AudioBuffer
  useEffect(() => {
    if (!audioBuffer) {
      setPeaks([]);
      return;
    }

    const channelData = audioBuffer.getChannelData(0);
    const numBuckets = 300;
    const bucketSize = Math.floor(channelData.length / numBuckets);
    const calculatedPeaks: number[] = [];

    for (let i = 0; i < numBuckets; i++) {
      let max = 0;
      const start = i * bucketSize;
      const end = Math.min(start + bucketSize, channelData.length);
      for (let j = start; j < end; j += 4) {
        const val = Math.abs(channelData[j]);
        if (val > max) max = val;
      }
      calculatedPeaks.push(max);
    }
    setPeaks(calculatedPeaks);
  }, [audioBuffer]);

  // Draw waveform
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || peaks.length === 0 || totalDuration === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Dark canvas background
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, w, h);

    // Cut region coordinates
    const startX = (cutStart / totalDuration) * w;
    const endX = (cutEnd / totalDuration) * w;

    // Darken non-cut regions
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.fillRect(0, 0, startX, h);
    ctx.fillRect(endX, 0, w - endX, h);

    // Active cut region glow
    ctx.fillStyle = 'rgba(57, 197, 187, 0.08)';
    ctx.fillRect(startX, 0, endX - startX, h);

    // Waveform bars
    const barWidth = w / peaks.length;
    for (let i = 0; i < peaks.length; i++) {
      const peak = peaks[i];
      const barHeight = Math.max(2, peak * (h * 0.78));
      const x = i * barWidth;
      const y = (h - barHeight) / 2;

      const isInsideCut = x >= startX && x <= endX;
      if (isInsideCut) {
        ctx.fillStyle = themePrimary;
        ctx.shadowColor = themePrimary;
        ctx.shadowBlur = 4;
      } else {
        ctx.fillStyle = '#334155';
        ctx.shadowBlur = 0;
      }

      ctx.fillRect(x, y, Math.max(1, barWidth - 1), barHeight);
    }
    ctx.shadowBlur = 0;

    // Lyric Markers
    ctx.fillStyle = '#ffe600';
    lyrics.forEach((l) => {
      const lx = (l.time / totalDuration) * w;
      ctx.fillRect(lx - 1, 0, 2, 8);
    });

    // Cut start handle & border line
    ctx.fillStyle = '#39c5bb';
    ctx.fillRect(startX - 2, 0, 4, h);
    ctx.beginPath();
    ctx.moveTo(startX, 0);
    ctx.lineTo(startX + 8, 0);
    ctx.lineTo(startX, 10);
    ctx.fill();

    // Cut end handle & border line
    ctx.fillStyle = '#ff00ff';
    ctx.fillRect(endX - 2, 0, 4, h);
    ctx.beginPath();
    ctx.moveTo(endX, 0);
    ctx.lineTo(endX - 8, 0);
    ctx.lineTo(endX, 10);
    ctx.fill();

    // Current Playhead Cursor
    const playheadX = (currentTime / totalDuration) * w;
    if (playheadX >= 0 && playheadX <= w) {
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 10;
      ctx.fillRect(playheadX - 1.5, 0, 3, h);
      ctx.shadowBlur = 0;
    }
  }, [peaks, totalDuration, cutStart, cutEnd, currentTime, lyrics, themePrimary]);

  // Handle pointer interactions on waveform
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || totalDuration === 0) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const clickTime = Math.max(0, Math.min((x / rect.width) * totalDuration, totalDuration));

    const startX = (cutStart / totalDuration) * rect.width;
    const endX = (cutEnd / totalDuration) * rect.width;

    // Hit test handles (within 12px)
    if (Math.abs(x - startX) <= 12) {
      isDraggingRef.current = 'start';
    } else if (Math.abs(x - endX) <= 12) {
      isDraggingRef.current = 'end';
    } else {
      isDraggingRef.current = 'scrub';
      onSeek(clickTime);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas || totalDuration === 0) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = Math.max(0, Math.min((x / rect.width) * totalDuration, totalDuration));

    if (isDraggingRef.current === 'start') {
      const newStart = Math.min(time, cutEnd - 1.0);
      onCutChange(Math.max(0, newStart), cutEnd);
    } else if (isDraggingRef.current === 'end') {
      const newEnd = Math.max(time, cutStart + 1.0);
      onCutChange(cutStart, Math.min(totalDuration, newEnd));
    } else if (isDraggingRef.current === 'scrub') {
      onSeek(time);
    }
  };

  const handlePointerUp = () => {
    isDraggingRef.current = null;
  };

  const setPresetDuration = (targetSec: number) => {
    if (totalDuration === 0) return;
    if (targetSec >= totalDuration) {
      onCutChange(0, totalDuration);
      return;
    }
    // Center around current start or default to beginning
    const start = Math.min(cutStart, Math.max(0, totalDuration - targetSec));
    onCutChange(start, start + targetSec);
  };

  const cutDuration = Math.max(0, cutEnd - cutStart);

  return (
    <div className="bg-[#0c0d14] border border-[#39c5bb]/30 p-3 text-white font-mono text-xs shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="flex items-center space-x-2">
          <Scissors className="w-4 h-4 text-[#39c5bb]" />
          <span className="font-bold text-sm text-[#39c5bb] tracking-tight">
            AUDIO TIMELINE & SHORT TRIMMER
          </span>
          <span className="text-[10px] bg-neutral-800 text-neutral-300 px-1.5 py-0.5 border border-neutral-700">
            TOTAL: {formatTime(totalDuration)}
          </span>
        </div>

        {/* Quick Short Duration Presets */}
        <div className="flex items-center space-x-1.5">
          <span className="text-[10px] text-neutral-400 font-bold uppercase hidden sm:inline">PRESETS:</span>
          <button
            type="button"
            onClick={() => setPresetDuration(15)}
            className="px-2 py-0.5 bg-neutral-900 hover:bg-[#39c5bb] hover:text-black border border-[#39c5bb]/40 text-[10px] font-bold transition-colors"
          >
            15s
          </button>
          <button
            type="button"
            onClick={() => setPresetDuration(30)}
            className="px-2 py-0.5 bg-neutral-900 hover:bg-[#39c5bb] hover:text-black border border-[#39c5bb]/40 text-[10px] font-bold transition-colors"
          >
            30s HOOK
          </button>
          <button
            type="button"
            onClick={() => setPresetDuration(60)}
            className="px-2 py-0.5 bg-neutral-900 hover:bg-[#39c5bb] hover:text-black border border-[#39c5bb]/40 text-[10px] font-bold transition-colors"
          >
            60s REEL
          </button>
          <button
            type="button"
            onClick={() => onCutChange(0, totalDuration)}
            className="px-2 py-0.5 bg-neutral-900 hover:bg-[#ff00ff] hover:text-white border border-[#ff00ff]/40 text-[10px] font-bold transition-colors"
          >
            FULL TRACK
          </button>
        </div>
      </div>

      {/* Interactive Waveform Canvas */}
      <div className="relative w-full h-20 mb-2 border border-neutral-800 overflow-hidden cursor-crosshair">
        <canvas
          ref={canvasRef}
          width={800}
          height={80}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className="w-full h-full block"
        />
      </div>

      {/* Metrics & Time Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] pt-1 border-t border-neutral-800">
        <div className="flex items-center space-x-3">
          <div>
            <span className="text-neutral-500 font-bold">START: </span>
            <span className="text-[#39c5bb] font-bold">{formatTime(cutStart)}</span>
          </div>
          <div>
            <span className="text-neutral-500 font-bold">END: </span>
            <span className="text-[#ff00ff] font-bold">{formatTime(cutEnd)}</span>
          </div>
          <div>
            <span className="text-neutral-500 font-bold">DURATION: </span>
            <span className="text-[#ffe600] font-bold">{cutDuration.toFixed(1)}s</span>
          </div>
          <div>
            <span className="text-neutral-500 font-bold">PLAYHEAD: </span>
            <span className="text-white font-bold">{formatTime(currentTime)}</span>
          </div>
        </div>

        {/* Nudge Buttons */}
        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={() => onCutChange(Math.max(0, cutStart - 0.5), cutEnd)}
            className="px-1.5 py-0.5 bg-black border border-neutral-700 text-neutral-300 hover:text-white text-[10px]"
            title="Start -0.5s"
          >
            ◀ Start
          </button>
          <button
            type="button"
            onClick={() => onCutChange(Math.min(cutEnd - 1, cutStart + 0.5), cutEnd)}
            className="px-1.5 py-0.5 bg-black border border-neutral-700 text-neutral-300 hover:text-white text-[10px]"
            title="Start +0.5s"
          >
            Start ▶
          </button>
          <span className="text-neutral-600">|</span>
          <button
            type="button"
            onClick={() => onCutChange(cutStart, Math.max(cutStart + 1, cutEnd - 0.5))}
            className="px-1.5 py-0.5 bg-black border border-neutral-700 text-neutral-300 hover:text-white text-[10px]"
            title="End -0.5s"
          >
            ◀ End
          </button>
          <button
            type="button"
            onClick={() => onCutChange(cutStart, Math.min(totalDuration, cutEnd + 0.5))}
            className="px-1.5 py-0.5 bg-black border border-neutral-700 text-neutral-300 hover:text-white text-[10px]"
            title="End +0.5s"
          >
            End ▶
          </button>
        </div>
      </div>
    </div>
  );
};
