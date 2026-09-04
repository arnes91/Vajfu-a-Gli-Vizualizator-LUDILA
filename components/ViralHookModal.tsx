import React from 'react';
import { ViralHookAnalysis } from '../types';
import { Sparkles, Check, X, Flame, Play, Share2 } from 'lucide-react';

interface ViralHookModalProps {
  analysis: ViralHookAnalysis | null;
  isOpen: boolean;
  onClose: () => void;
  onApply: (start: number, end: number) => void;
  onPreviewHook: (start: number, end: number) => void;
}

export const ViralHookModal: React.FC<ViralHookModalProps> = ({
  analysis,
  isOpen,
  onClose,
  onApply,
  onPreviewHook,
}) => {
  if (!isOpen || !analysis) return null;

  const formatSec = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    const ms = Math.floor((s % 1) * 10);
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-[#0c0d14] border-2 border-[#ff00ff] p-5 max-w-lg w-full text-white font-mono text-xs shadow-[0_0_40px_rgba(255,0,255,0.4)] animate-in fade-in zoom-in duration-150">
        <div className="flex items-center justify-between border-b border-[#ff00ff]/40 pb-3 mb-4">
          <div className="flex items-center space-x-2">
            <Flame className="w-5 h-5 text-[#ff00ff]" />
            <span className="font-black text-sm uppercase text-white tracking-wider font-['Orbitron']">
              AI VIRAL HOOK DETECTOR
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Virality Score Badge */}
        <div className="flex items-center justify-between bg-black/60 border border-[#ff00ff]/30 p-3 mb-4">
          <div>
            <div className="text-[10px] text-neutral-400 uppercase font-bold">VIRALITY PREDICTION SCORE</div>
            <div className="text-2xl font-black text-[#ffe600] tracking-tight">
              {analysis.viralityScore} / 100
            </div>
            <div className="text-[10px] text-[#39c5bb] font-bold uppercase">{analysis.hookType}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-neutral-400 uppercase font-bold">RECOMMENDED CUT</div>
            <div className="text-sm font-black text-white">
              {formatSec(analysis.hookStart)} → {formatSec(analysis.hookEnd)}
            </div>
            <div className="text-[10px] text-[#ff00ff] font-bold">
              {analysis.duration.toFixed(1)}s OPTIMAL LENGTH
            </div>
          </div>
        </div>

        {/* Retention Strategy Tip */}
        <div className="mb-3 bg-neutral-950 border border-neutral-800 p-2.5">
          <div className="text-[10px] text-[#39c5bb] font-bold uppercase mb-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ALGORITHM RETENTION HOOK</span>
          </div>
          <p className="text-neutral-300 text-[11px] leading-relaxed">
            {analysis.retentionTip}
          </p>
        </div>

        {/* Suggested Caption */}
        <div className="mb-4 bg-neutral-950 border border-neutral-800 p-2.5">
          <div className="text-[10px] text-[#ff00ff] font-bold uppercase mb-1 flex items-center gap-1">
            <Share2 className="w-3.5 h-3.5" />
            <span>VIRAL CAPTION & HASHTAGS</span>
          </div>
          <p className="text-[#ffe600] text-[11px] select-all cursor-pointer font-bold">
            {analysis.caption}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2 border-t border-neutral-800">
          <button
            type="button"
            onClick={() => onPreviewHook(analysis.hookStart, analysis.hookEnd)}
            className="flex-1 py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white font-bold flex items-center justify-center gap-1.5 transition-colors uppercase text-xs"
          >
            <Play className="w-3.5 h-3.5" />
            <span>PREVIEW CUT</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onApply(analysis.hookStart, analysis.hookEnd);
              onClose();
            }}
            className="flex-1 py-2.5 bg-[#ff00ff] hover:bg-white hover:text-black text-white font-black flex items-center justify-center gap-1.5 transition-all shadow-[0_0_15px_rgba(255,0,255,0.6)] uppercase text-xs"
          >
            <Check className="w-4 h-4" />
            <span>APPLY TO TRIMMER</span>
          </button>
        </div>
      </div>
    </div>
  );
};
