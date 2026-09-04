// Slide-Out Telemetry Drawer
// Displays the detailed Applied Adaptations log, active memory nodes, and self-learning telemetry

import React, { useState } from 'react';
import { X, CheckCircle2, Cpu, Terminal, Sparkles, Copy, Check, Filter, Search, Play, ShieldAlert } from 'lucide-react';
import { EvolutionReport } from '../types';
import { DetailedAdaptation } from './EvolutionEngine';

interface TelemetryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  evolutionReport: EvolutionReport;
  adaptations: DetailedAdaptation[];
  onRunEvolutionCycle: () => void;
  isEvolving: boolean;
}

export const TelemetryDrawer: React.FC<TelemetryDrawerProps> = ({
  isOpen,
  onClose,
  evolutionReport,
  adaptations,
  onRunEvolutionCycle,
  isEvolving,
}) => {
  const [activeTab, setActiveTab] = useState<'ADAPTATIONS' | 'MEMORY_NODES' | 'RAW_TELEMETRY'>('ADAPTATIONS');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const filteredAdaptations = adaptations.filter((a) => {
    const matchesCat = selectedCategory === 'ALL' || a.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleCopyTelemetry = () => {
    const data = JSON.stringify(evolutionReport, null, 2);
    navigator.clipboard?.writeText(data).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm select-none font-mono">
      {/* Background click to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Drawer Container */}
      <div className="w-full max-w-xl h-full bg-[#090a12] border-l border-[#00ff66]/40 shadow-[-10px_0_40px_rgba(0,0,0,0.8)] flex flex-col animate-in slide-in-from-right duration-200 text-white">
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 bg-[#07080e] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 bg-[#00ff66]/10 border border-[#00ff66]/40 text-[#00ff66]">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black tracking-wider text-white uppercase flex items-center gap-1.5">
                <span>AUTONOMOUS TELEMETRY DRAWER</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-[#00ff66]/20 border border-[#00ff66] text-[#00ff66]">
                  LIVE
                </span>
              </h2>
              <div className="text-[10px] text-neutral-400">
                {evolutionReport.version} // SYNC: {evolutionReport.crossModuleSyncScore}%
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onRunEvolutionCycle}
              disabled={isEvolving}
              className="px-2.5 py-1 text-[10px] bg-[#00ff66]/20 border border-[#00ff66] hover:bg-[#00ff66] hover:text-black text-[#00ff66] font-black cursor-pointer flex items-center space-x-1"
            >
              <Play className={`w-2.5 h-2.5 ${isEvolving ? 'animate-spin' : ''}`} />
              <span>{isEvolving ? 'EVOLVING...' : 'RUN CYCLE'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 bg-neutral-900 border border-neutral-700 hover:border-white text-neutral-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-800 bg-black/40 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('ADAPTATIONS')}
            className={`flex-1 py-2.5 font-bold text-center border-b-2 transition-colors cursor-pointer ${
              activeTab === 'ADAPTATIONS'
                ? 'border-[#00ff66] text-[#00ff66] bg-[#00ff66]/5'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            APPLIED ADAPTATIONS ({adaptations.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('MEMORY_NODES')}
            className={`flex-1 py-2.5 font-bold text-center border-b-2 transition-colors cursor-pointer ${
              activeTab === 'MEMORY_NODES'
                ? 'border-[#00f0ff] text-[#00f0ff] bg-[#00f0ff]/5'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            MEMORY NODES ({evolutionReport.memoryNodes}/16)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('RAW_TELEMETRY')}
            className={`flex-1 py-2.5 font-bold text-center border-b-2 transition-colors cursor-pointer ${
              activeTab === 'RAW_TELEMETRY'
                ? 'border-[#ffe600] text-[#ffe600] bg-[#ffe600]/5'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            TELEMETRY EXPORT
          </button>
        </div>

        {/* Tab 1: Applied Adaptations */}
        {activeTab === 'ADAPTATIONS' && (
          <div className="flex-1 flex flex-col overflow-hidden p-4 space-y-3">
            {/* Search & Category Filter */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-neutral-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search adaptations..."
                  className="w-full pl-8 pr-3 py-1.5 bg-black/50 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#00ff66]"
                />
              </div>

              <div className="flex items-center space-x-1 overflow-x-auto pb-1 text-[10px]">
                {['ALL', 'SOVEREIGNTY', 'AUDIO_DSP', 'SHADERS', 'TELEMETRY', 'MIDI_BRIDGE'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2 py-1 font-bold border transition-colors cursor-pointer whitespace-nowrap ${
                      selectedCategory === cat
                        ? 'bg-[#00ff66]/20 border-[#00ff66] text-[#00ff66]'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Adaptations List */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {filteredAdaptations.map((adapt) => (
                <div
                  key={adapt.id}
                  className="p-3 bg-black/60 border border-neutral-800/80 hover:border-neutral-700 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] px-1.5 py-0.5 bg-neutral-900 border border-neutral-700 text-neutral-300 font-mono">
                        {adapt.id}
                      </span>
                      <h3 className="text-xs font-black text-white">{adapt.title}</h3>
                    </div>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 font-bold border ${
                        adapt.status === 'VALIDATED'
                          ? 'bg-[#00ff66]/10 border-[#00ff66]/50 text-[#00ff66]'
                          : adapt.status === 'DEPLOYED'
                          ? 'bg-[#00f0ff]/10 border-[#00f0ff]/50 text-[#00f0ff]'
                          : 'bg-[#ffe600]/10 border-[#ffe600]/50 text-[#ffe600]'
                      }`}
                    >
                      {adapt.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-neutral-300 mb-2 leading-relaxed">
                    {adapt.description}
                  </p>

                  <div className="flex flex-wrap items-center justify-between text-[9px] pt-1.5 border-t border-neutral-900 text-neutral-400">
                    <div className="flex items-center space-x-2">
                      <span className="text-[#ffe600]">IMPACT: {adapt.impact}</span>
                    </div>
                    <div className="text-neutral-500 font-mono">
                      CYCLE {adapt.cycle} // {adapt.timestamp}
                    </div>
                  </div>
                </div>
              ))}

              {filteredAdaptations.length === 0 && (
                <div className="p-8 text-center text-neutral-500 text-xs">
                  No adaptations match filter parameters.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Memory Nodes */}
        {activeTab === 'MEMORY_NODES' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <div className="p-3 bg-neutral-950 border border-neutral-800 text-xs flex justify-between items-center">
              <div>
                <span className="text-neutral-400">HYDRATED COGNITIVE NODES:</span>{' '}
                <strong className="text-[#00f0ff]">{evolutionReport.memoryNodes} / 16</strong>
              </div>
              <div className="text-[#00ff66] font-bold">ALL NODES HEALTHY</div>
            </div>

            <div className="space-y-2">
              {[
                { id: 'NODE-01', name: 'Admin PC SSOT Anchor', role: 'Authority Governance', integrity: '100%', status: 'HYDRATED' },
                { id: 'NODE-02', name: 'BRZI_STUDIO Cognitive Spine', role: 'System Directory Structure', integrity: '99.8%', status: 'HYDRATED' },
                { id: 'NODE-03', name: 'ELI Orchestrator Memory', role: 'Autonomous Execution Protocol', integrity: '99.4%', status: 'HYDRATED' },
                { id: 'NODE-04', name: '142 BPM Hardwave DSP Matrix', role: 'Synthesizer Timing & Arpeggiator', integrity: '98.9%', status: 'HYDRATED' },
                { id: 'NODE-05', name: 'GLSL Contour Fluid Displacement', role: 'Shaders & Harmonic Waves', integrity: '99.1%', status: 'HYDRATED' },
                { id: 'NODE-06', name: 'Web MIDI Hardware Controller', role: 'Real-time CC & Pad Ingestion', integrity: '96.5%', status: 'HYDRATED' },
                { id: 'NODE-07', name: 'DistroKid Commercial Pipeline', role: 'Master Audio Packaging', integrity: '95.2%', status: evolutionReport.memoryNodes >= 7 ? 'HYDRATED' : 'STANDBY' },
                { id: 'NODE-08', name: 'Claritas Ex Fracta Ritual', role: 'Noise Distillation Protocol', integrity: '99.0%', status: evolutionReport.memoryNodes >= 8 ? 'HYDRATED' : 'STANDBY' },
                { id: 'NODE-09', name: 'Balkan AI Community Knowledge', role: 'Viral Hooks & Outreach Hub', integrity: '97.2%', status: evolutionReport.memoryNodes >= 9 ? 'HYDRATED' : 'STANDBY' },
                { id: 'NODE-10', name: 'Gemini Neural Speech Uplink', role: 'Real-time Voice Synthesis', integrity: '96.8%', status: evolutionReport.memoryNodes >= 10 ? 'HYDRATED' : 'STANDBY' },
              ].map((node) => (
                <div
                  key={node.id}
                  className={`p-2.5 border text-xs flex items-center justify-between ${
                    node.status === 'HYDRATED'
                      ? 'bg-black/60 border-neutral-800 text-white'
                      : 'bg-black/20 border-neutral-900 text-neutral-600'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Cpu className={`w-3.5 h-3.5 ${node.status === 'HYDRATED' ? 'text-[#00f0ff]' : 'text-neutral-700'}`} />
                    <div>
                      <div className="font-bold flex items-center space-x-2">
                        <span>{node.name}</span>
                        <span className="text-[9px] text-neutral-500 font-normal font-mono">[{node.id}]</span>
                      </div>
                      <div className="text-[10px] text-neutral-400">{node.role}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-mono font-bold text-[#00ff66]">{node.integrity}</div>
                    <div className="text-[8px] uppercase tracking-wider text-neutral-500">{node.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Raw Telemetry Export */}
        {activeTab === 'RAW_TELEMETRY' && (
          <div className="flex-1 flex flex-col p-4 space-y-3 overflow-hidden">
            <div className="flex justify-between items-center text-xs">
              <span className="text-neutral-400">TELEMETRY SUMMARY & JSON SNAPSHOT</span>
              <button
                type="button"
                onClick={handleCopyTelemetry}
                className="flex items-center space-x-1 px-2.5 py-1 bg-neutral-900 border border-neutral-700 hover:border-white text-xs cursor-pointer text-white font-bold"
              >
                {copied ? <Check className="w-3 h-3 text-[#00ff66]" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'COPIED!' : 'COPY JSON'}</span>
              </button>
            </div>

            <div className="p-3 bg-black/80 border border-neutral-800 text-xs text-neutral-300 leading-relaxed font-mono">
              <strong className="text-[#ffe600] block mb-1">OPERATIONAL REPORT:</strong>
              {evolutionReport.telemetrySummary}
            </div>

            <div className="flex-1 bg-black border border-neutral-900 p-3 overflow-y-auto text-[10px] font-mono text-[#00ff66]">
              <pre>{JSON.stringify(evolutionReport, null, 2)}</pre>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-3 border-t border-neutral-800 bg-[#07080e] flex items-center justify-between text-[10px] text-neutral-500">
          <span>SSOT: ADMIN PC (KISELJAK/BILALOVAC)</span>
          <span>BRZI_STUDIO CONSTITUTION V1</span>
        </div>
      </div>
    </div>
  );
};
