// Cyberpunk Sidebar Navigation Component
// Houses the primary application view tabs including 'VISUALIZER', 'EVOLUTION' (Knowledge Graph),
// and fast triggers for Telemetry Drawer and Dev Diagnostics.

import React, { useState } from 'react';
import { Eye, Dna, Terminal, Sliders, Radio, ChevronLeft, ChevronRight, Cpu, Play } from 'lucide-react';

export type AppTab = 'VISUALIZER' | 'EVOLUTION';

interface SidebarNavigationProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  onOpenTelemetryDrawer: () => void;
  onToggleDiagnostics: () => void;
  isDiagnosticsOpen: boolean;
  midiConnected: boolean;
  memoryNodesCount: number;
  syncScore: number;
}

export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  activeTab,
  onTabChange,
  onOpenTelemetryDrawer,
  onToggleDiagnostics,
  isDiagnosticsOpen,
  midiConnected,
  memoryNodesCount,
  syncScore,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <nav
      className={`h-full bg-[#06070c]/95 border-r border-neutral-800/90 flex flex-col justify-between select-none z-30 transition-all duration-200 backdrop-blur-md ${
        isExpanded ? 'w-56' : 'w-14'
      }`}
    >
      {/* Top: Brand Logo / Toggle */}
      <div>
        <div className="p-3 flex items-center justify-between border-b border-neutral-800">
          <div className="flex items-center space-x-2 overflow-hidden">
            <div className="w-7 h-7 bg-[#ffe600]/10 border border-[#ffe600]/50 flex items-center justify-center shrink-0">
              <Cpu className="w-4 h-4 text-[#ffe600]" />
            </div>
            {isExpanded && (
              <div className="truncate">
                <div className="text-[11px] font-black text-[#ffe600] tracking-wider leading-tight">
                  BRZI_STUDIO
                </div>
                <div className="text-[8px] text-neutral-500 font-mono">VJ AGENT v2.0</div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            title={isExpanded ? 'Collapse Sidebar' : 'Expand Sidebar'}
          >
            {isExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        {/* Primary Navigation Tabs */}
        <div className="p-2 space-y-1.5">
          {/* 1. VISUALIZER TAB */}
          <button
            type="button"
            onClick={() => onTabChange('VISUALIZER')}
            className={`w-full flex items-center space-x-3 p-2.5 rounded-sm transition-all cursor-pointer text-left ${
              activeTab === 'VISUALIZER'
                ? 'bg-[#ffe600]/15 border border-[#ffe600] text-[#ffe600]'
                : 'border border-transparent text-neutral-400 hover:text-white hover:bg-neutral-900/60'
            }`}
            title="Visualizer Canvas"
          >
            <Eye className="w-4 h-4 shrink-0 text-[#ffe600]" />
            {isExpanded && (
              <div className="truncate flex-1 flex items-center justify-between">
                <span className="text-xs font-bold tracking-wider">VISUALIZER</span>
                <span className="text-[9px] px-1.5 py-0.2 bg-[#ffe600]/20 border border-[#ffe600]/40 text-[#ffe600]">
                  LIVE
                </span>
              </div>
            )}
          </button>

          {/* 2. EVOLUTION TAB (New Knowledge Graph & Automation Runner) */}
          <button
            type="button"
            onClick={() => onTabChange('EVOLUTION')}
            className={`w-full flex items-center space-x-3 p-2.5 rounded-sm transition-all cursor-pointer text-left group ${
              activeTab === 'EVOLUTION'
                ? 'bg-[#00ff66]/15 border border-[#00ff66] text-[#00ff66]'
                : 'border border-transparent text-neutral-400 hover:text-white hover:bg-neutral-900/60'
            }`}
            title="Autonomous Evolution Knowledge Graph"
          >
            <Dna className="w-4 h-4 shrink-0 text-[#00ff66] group-hover:rotate-12 transition-transform" />
            {isExpanded && (
              <div className="truncate flex-1 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold tracking-wider block">EVOLUTION</span>
                  <span className="text-[8px] text-neutral-400 font-mono">{syncScore}% SYNC</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.2 bg-[#00ff66]/20 border border-[#00ff66]/40 text-[#00ff66]">
                  {memoryNodesCount} NODES
                </span>
              </div>
            )}
          </button>

          {/* 3. TELEMETRY DRAWER TRIGGER */}
          <button
            type="button"
            onClick={onOpenTelemetryDrawer}
            className="w-full flex items-center space-x-3 p-2.5 rounded-sm border border-transparent text-neutral-400 hover:text-white hover:bg-neutral-900/60 transition-all cursor-pointer text-left"
            title="Open Applied Adaptations Telemetry Drawer"
          >
            <Terminal className="w-4 h-4 shrink-0 text-[#00f0ff]" />
            {isExpanded && (
              <div className="truncate flex-1 flex items-center justify-between">
                <span className="text-xs font-bold tracking-wider">TELEMETRY</span>
                <span className="text-[9px] text-neutral-500">DRAWER</span>
              </div>
            )}
          </button>

          {/* 4. DEVELOPER DIAGNOSTICS TOGGLE */}
          <button
            type="button"
            onClick={onToggleDiagnostics}
            className={`w-full flex items-center space-x-3 p-2.5 rounded-sm transition-all cursor-pointer text-left ${
              isDiagnosticsOpen
                ? 'bg-[#00f0ff]/15 border border-[#00f0ff] text-[#00f0ff]'
                : 'border border-transparent text-neutral-400 hover:text-white hover:bg-neutral-900/60'
            }`}
            title="Developer Diagnostic Overlay (~ or D)"
          >
            <Sliders className="w-4 h-4 shrink-0 text-[#00f0ff]" />
            {isExpanded && (
              <div className="truncate flex-1 flex items-center justify-between">
                <span className="text-xs font-bold tracking-wider">DIAGNOSTICS</span>
                <span className="text-[9px] text-neutral-500 font-mono">[~]</span>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Bottom: Hardware & SSOT Status */}
      <div className="p-2 border-t border-neutral-800 space-y-2">
        {/* MIDI Indicator */}
        <div
          className={`flex items-center space-x-2.5 p-2 rounded-sm border ${
            midiConnected
              ? 'bg-[#00ff66]/10 border-[#00ff66]/40 text-[#00ff66]'
              : 'bg-neutral-900/40 border-neutral-800 text-neutral-500'
          }`}
          title={midiConnected ? 'Hardware MIDI Active' : 'MIDI Listening'}
        >
          <Radio className={`w-3.5 h-3.5 shrink-0 ${midiConnected ? 'animate-pulse text-[#00ff66]' : ''}`} />
          {isExpanded && (
            <div className="text-[10px] truncate font-mono">
              <span className="block font-bold">{midiConnected ? 'MIDI: ONLINE' : 'MIDI: STANDBY'}</span>
            </div>
          )}
        </div>

        {/* SSOT Tag */}
        {isExpanded && (
          <div className="px-2 py-1 text-[9px] text-neutral-500 font-mono border border-neutral-900 bg-black/40">
            ADMIN PC = SSOT
          </div>
        )}
      </div>
    </nav>
  );
};
