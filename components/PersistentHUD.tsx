// Persistent HUD Component
// Displays Autonomous Evolution Engine live metrics (Memory Nodes, Cross-Module Sync %, Version),
// hardware MIDI status, and fast-access actions to the Knowledge Graph, Telemetry Drawer, and Dev Diagnostics.

import React from 'react';
import { Dna, Activity, Sliders, Cpu, Terminal, Radio, Play } from 'lucide-react';
import { EvolutionReport } from '../types';

interface PersistentHUDProps {
  evolutionReport: EvolutionReport;
  isEvolving: boolean;
  onRunEvolutionCycle: () => void;
  onOpenKnowledgeGraph: () => void;
  onOpenTelemetryDrawer: () => void;
  onToggleDiagnostics: () => void;
  isDiagnosticsOpen: boolean;
  midiConnected: boolean;
  midiDeviceName: string;
  isAISpeaking?: boolean;
}

export const PersistentHUD: React.FC<PersistentHUDProps> = ({
  evolutionReport,
  isEvolving,
  onRunEvolutionCycle,
  onOpenKnowledgeGraph,
  onOpenTelemetryDrawer,
  onToggleDiagnostics,
  isDiagnosticsOpen,
  midiConnected,
  midiDeviceName,
  isAISpeaking,
}) => {
  const syncPercentage = evolutionReport.crossModuleSyncScore;
  const isHighSync = syncPercentage >= 95;

  return (
    <header className="w-full bg-[#07080f]/90 border-b border-neutral-800/90 text-white select-none backdrop-blur-md px-3 py-2 flex flex-wrap items-center justify-between gap-2.5 z-40 relative">
      {/* Left: Branding & Core Engine State */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <div className="relative flex items-center justify-center w-6 h-6 bg-[#00ff66]/10 border border-[#00ff66]/40">
            <Cpu className="w-3.5 h-3.5 text-[#00ff66]" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#00ff66] animate-ping" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-[11px] font-black tracking-widest text-[#ffe600]">
                BRZI_STUDIO //
              </span>
              <span className="text-[11px] font-extrabold text-white tracking-wider">
                AUTONOMOUS ENGINE
              </span>
            </div>
            <div className="text-[9px] text-neutral-400 font-mono flex items-center space-x-2">
              <span className="text-[#00f0ff]">{evolutionReport.version}</span>
              <span className="text-neutral-600">|</span>
              <span>ADMIN PC SSOT</span>
            </div>
          </div>
        </div>

        {/* Live MIDI Status Pill */}
        <div
          className={`hidden sm:flex items-center space-x-1.5 px-2 py-0.5 text-[10px] border font-mono ${
            midiConnected
              ? 'bg-[#00ff66]/10 border-[#00ff66]/50 text-[#00ff66]'
              : 'bg-neutral-900 border-neutral-800 text-neutral-400'
          }`}
          title={midiDeviceName}
        >
          <Radio className={`w-3 h-3 ${midiConnected ? 'animate-pulse text-[#00ff66]' : 'text-neutral-500'}`} />
          <span className="font-bold">
            {midiConnected ? `MIDI: ${midiDeviceName.slice(0, 14)}` : 'MIDI: LISTENING'}
          </span>
        </div>

        {/* AI Voice Announcer Indicator */}
        {isAISpeaking && (
          <div className="flex items-center space-x-1.5 px-2 py-0.5 text-[10px] bg-[#ff00ff]/20 border border-[#ff00ff] text-[#ff00ff] animate-pulse">
            <Activity className="w-3 h-3" />
            <span className="font-bold">AI VOICE TRANSMITTING...</span>
          </div>
        )}
      </div>

      {/* Center: Live Evolution Metrics Display */}
      <div className="flex items-center space-x-4 bg-black/60 border border-neutral-800/80 px-3 py-1 rounded-sm">
        {/* Memory Nodes */}
        <div className="flex items-center space-x-2">
          <div className="text-right">
            <div className="text-[8px] text-neutral-500 font-bold uppercase tracking-wider">
              MEMORY NODES
            </div>
            <div className="text-xs font-black text-white font-mono flex items-center space-x-1">
              <span className="text-[#00f0ff]">{evolutionReport.memoryNodes}</span>
              <span className="text-neutral-600">/</span>
              <span className="text-neutral-400">16</span>
              <span className="text-[9px] text-[#00ff66] font-normal ml-0.5">HYDRATED</span>
            </div>
          </div>
        </div>

        <div className="h-5 w-[1px] bg-neutral-800" />

        {/* Cross-Module Sync Percentage */}
        <div className="flex items-center space-x-2.5">
          <div className="text-right">
            <div className="text-[8px] text-neutral-500 font-bold uppercase tracking-wider">
              CROSS-MODULE SYNC
            </div>
            <div className="text-xs font-black font-mono flex items-center space-x-1">
              <span className={isHighSync ? 'text-[#00ff66]' : 'text-[#ffe600]'}>
                {syncPercentage.toFixed(1)}%
              </span>
              <span className="text-[9px] text-neutral-400 font-normal">
                {isHighSync ? '[OPTIMAL]' : '[SYNCING]'}
              </span>
            </div>
          </div>

          {/* Mini Progress Bar */}
          <div className="w-16 sm:w-24 h-2 bg-neutral-900 border border-neutral-800 overflow-hidden relative">
            <div
              className={`h-full transition-all duration-500 ${
                isHighSync
                  ? 'bg-gradient-to-r from-[#ffe600] to-[#00ff66]'
                  : 'bg-gradient-to-r from-[#ff5500] to-[#ffe600]'
              }`}
              style={{ width: `${Math.min(100, syncPercentage)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Right: Actions (Knowledge Graph, Telemetry Drawer, Dev Diag, Run Cycle) */}
      <div className="flex items-center space-x-2">
        {/* Knowledge Graph Quick Button */}
        <button
          type="button"
          onClick={onOpenKnowledgeGraph}
          className="flex items-center space-x-1.5 px-2.5 py-1 text-[11px] bg-neutral-900/90 border border-neutral-700 hover:border-[#00f0ff] hover:text-[#00f0ff] text-neutral-300 transition-colors font-bold cursor-pointer"
          title="Open Evolution Knowledge Graph"
        >
          <Dna className="w-3.5 h-3.5 text-[#00f0ff]" />
          <span className="hidden md:inline">GRAPH</span>
        </button>

        {/* Telemetry Logs Drawer Quick Button */}
        <button
          type="button"
          onClick={onOpenTelemetryDrawer}
          className="flex items-center space-x-1.5 px-2.5 py-1 text-[11px] bg-neutral-900/90 border border-neutral-700 hover:border-[#ffe600] hover:text-[#ffe600] text-neutral-300 transition-colors font-bold cursor-pointer"
          title="View Applied Adaptations & Telemetry Drawer"
        >
          <Terminal className="w-3.5 h-3.5 text-[#ffe600]" />
          <span className="hidden md:inline">ADAPTATIONS</span>
        </button>

        {/* Developer Diagnostics Toggle */}
        <button
          type="button"
          onClick={onToggleDiagnostics}
          className={`p-1.5 text-[11px] border font-bold cursor-pointer transition-colors ${
            isDiagnosticsOpen
              ? 'bg-[#00f0ff]/20 border-[#00f0ff] text-[#00f0ff]'
              : 'bg-neutral-900 border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500'
          }`}
          title="Toggle Hidden Developer Diagnostic Overlay (~ or D)"
        >
          <Sliders className="w-3.5 h-3.5" />
        </button>

        {/* Run Evolution Cycle Automation Button */}
        <button
          type="button"
          onClick={onRunEvolutionCycle}
          disabled={isEvolving}
          className="flex items-center space-x-1.5 px-3 py-1 text-[11px] bg-gradient-to-r from-[#00ff66]/20 to-[#00f0ff]/20 border border-[#00ff66] hover:bg-[#00ff66] hover:text-black text-[#00ff66] font-black transition-all cursor-pointer shadow-[0_0_12px_rgba(0,255,102,0.2)] disabled:opacity-50"
          title="Trigger Autonomous Evolution Cycle"
        >
          <Play className={`w-3 h-3 fill-current ${isEvolving ? 'animate-spin' : ''}`} />
          <span>{isEvolving ? 'EVOLVING...' : 'RUN CYCLE'}</span>
        </button>
      </div>
    </header>
  );
};
