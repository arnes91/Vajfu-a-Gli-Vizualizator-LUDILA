// Dedicated Evolution Knowledge Graph Panel
// Visualizes the active BRZI_STUDIO knowledge graph, nodes, connections, and triggers autonomous evolution automation

import React, { useState } from 'react';
import { Dna, Play, Sparkles, Cpu, Layers, Activity, RefreshCw, X, Radio, ArrowRight, ShieldCheck } from 'lucide-react';
import { EvolutionReport } from '../types';
import { EvolutionEngine, KnowledgeGraphNode } from './EvolutionEngine';

interface KnowledgeGraphPanelProps {
  isOpen: boolean;
  onClose: () => void;
  evolutionReport: EvolutionReport;
  onRunEvolutionCycle: () => void;
  isEvolving: boolean;
  evolutionEngine: EvolutionEngine;
}

export const KnowledgeGraphPanel: React.FC<KnowledgeGraphPanelProps> = ({
  isOpen,
  onClose,
  evolutionReport,
  onRunEvolutionCycle,
  isEvolving,
  evolutionEngine,
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('eli-orchestrator');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  if (!isOpen) return null;

  const { nodes, links } = evolutionEngine.getKnowledgeGraph();
  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0];

  const categoryColors: Record<string, { bg: string; stroke: string; text: string }> = {
    CORE: { bg: '#ffe600', stroke: '#ffe600', text: '#ffe600' },
    ORCHESTRATOR: { bg: '#00ff66', stroke: '#00ff66', text: '#00ff66' },
    AUDIO: { bg: '#ff0055', stroke: '#ff0055', text: '#ff0055' },
    VISUAL: { bg: '#00f0ff', stroke: '#00f0ff', text: '#00f0ff' },
    NEURAL: { bg: '#ff00ff', stroke: '#ff00ff', text: '#ff00ff' },
    HARDWARE: { bg: '#ffaa00', stroke: '#ffaa00', text: '#ffaa00' },
    SOVEREIGNTY: { bg: '#9d00ff', stroke: '#9d00ff', text: '#9d00ff' },
    PIPELINE: { bg: '#39c5bb', stroke: '#39c5bb', text: '#39c5bb' },
  };

  const filteredNodes = nodes.filter((n) => categoryFilter === 'ALL' || n.category === categoryFilter);

  return (
    <div className="fixed inset-0 z-50 bg-[#06070d]/95 backdrop-blur-md flex flex-col text-white font-mono select-none overflow-hidden">
      {/* Top Header Bar */}
      <header className="px-5 py-3 border-b border-neutral-800 bg-black/80 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-[#00ff66]/10 border border-[#00ff66]/40 text-[#00ff66]">
            <Dna className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-sm sm:text-base font-black tracking-widest text-white uppercase">
                AUTONOMOUS KNOWLEDGE GRAPH
              </h1>
              <span className="text-[10px] px-2 py-0.5 bg-[#00ff66]/20 border border-[#00ff66] text-[#00ff66] font-bold">
                {evolutionReport.version}
              </span>
            </div>
            <p className="text-[10px] text-neutral-400">
              Cross-Module Alignment: <strong className="text-[#00ff66]">{evolutionReport.crossModuleSyncScore}%</strong> | Hydrated Nodes: <strong className="text-[#00f0ff]">{evolutionReport.memoryNodes}</strong>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onRunEvolutionCycle}
            disabled={isEvolving}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#00ff66] to-[#00f0ff] hover:opacity-90 text-black font-black text-xs uppercase cursor-pointer shadow-[0_0_20px_rgba(0,255,102,0.3)] disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 fill-black ${isEvolving ? 'animate-spin' : ''}`} />
            <span>{isEvolving ? 'RUNNING EVOLUTION CYCLE...' : 'RUN EVOLUTION CYCLE'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-2 bg-neutral-900 border border-neutral-700 hover:border-white text-neutral-400 hover:text-white cursor-pointer"
            title="Close Panel (ESC)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Area: SVG Visualizer + Node Inspector */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Left / Center: Interactive SVG Knowledge Graph */}
        <div className="flex-1 relative bg-radial from-neutral-950 to-black overflow-hidden flex items-center justify-center p-4">
          {/* Subtle Grid Background */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#00ff66 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          {/* Category Filter Chips */}
          <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-1.5 max-w-md">
            {['ALL', 'CORE', 'ORCHESTRATOR', 'AUDIO', 'VISUAL', 'NEURAL', 'HARDWARE', 'SOVEREIGNTY'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-2 py-0.5 text-[10px] font-bold border transition-colors cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-white text-black border-white'
                    : 'bg-black/60 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Dynamic SVG Visual Canvas */}
          <svg className="w-full h-full max-w-4xl max-h-[700px] z-0 overflow-visible" viewBox="0 0 100 100">
            <defs>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Connection Links */}
            {links.map((link, idx) => {
              const srcNode = nodes.find((n) => n.id === link.source);
              const tgtNode = nodes.find((n) => n.id === link.target);
              if (!srcNode || !tgtNode) return null;

              const isHighlighted = selectedNodeId === link.source || selectedNodeId === link.target;

              return (
                <g key={idx}>
                  {/* Connecting Line */}
                  <line
                    x1={srcNode.x}
                    y1={srcNode.y}
                    x2={tgtNode.x}
                    y2={tgtNode.y}
                    stroke={isHighlighted ? '#00ff66' : 'rgba(255,255,255,0.15)'}
                    strokeWidth={isHighlighted ? '0.6' : '0.25'}
                    strokeDasharray={isHighlighted ? '1.5 1' : undefined}
                    className={isHighlighted ? 'animate-pulse' : ''}
                  />

                  {/* Animated Traveling Data Packet Dot */}
                  {isHighlighted && (
                    <circle r="0.6" fill="#00f0ff">
                      <animateMotion
                        path={`M ${srcNode.x} ${srcNode.y} L ${tgtNode.x} ${tgtNode.y}`}
                        dur="2s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}
                </g>
              );
            })}

            {/* Nodes */}
            {filteredNodes.map((node) => {
              const isSelected = selectedNodeId === node.id;
              const colorInfo = categoryColors[node.category] || { bg: '#fff', stroke: '#fff', text: '#fff' };

              return (
                <g
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  className="cursor-pointer transition-transform duration-200"
                  style={{ transformOrigin: `${node.x}% ${node.y}%` }}
                >
                  {/* Halo Ring if Selected */}
                  {isSelected && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="4.2"
                      fill="none"
                      stroke={colorInfo.stroke}
                      strokeWidth="0.4"
                      className="animate-ping opacity-60"
                    />
                  )}

                  {/* Outer Ring */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isSelected ? '3.2' : '2.4'}
                    fill="#0a0c16"
                    stroke={isSelected ? '#ffffff' : colorInfo.stroke}
                    strokeWidth={isSelected ? '0.8' : '0.4'}
                    filter={isSelected ? 'url(#glow)' : undefined}
                  />

                  {/* Center Dot */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isSelected ? '1.2' : '0.8'}
                    fill={colorInfo.bg}
                  />

                  {/* Node Label Text */}
                  <text
                    x={node.x}
                    y={node.y + 4.2}
                    fill={isSelected ? '#ffffff' : 'rgba(255,255,255,0.75)'}
                    fontSize={isSelected ? '1.8' : '1.4'}
                    fontWeight={isSelected ? 'bold' : 'normal'}
                    textAnchor="middle"
                    className="select-none pointer-events-none"
                    style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}
                  >
                    {node.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Right Side: Node Inspector Card */}
        <aside className="w-full md:w-96 bg-[#0a0c16] border-t md:border-t-0 md:border-l border-neutral-800 p-5 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-4">
            <div className="border-b border-neutral-800 pb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] px-2 py-0.5 bg-neutral-900 border border-neutral-700 text-neutral-300 font-bold">
                  {selectedNode.category}
                </span>
                <span className="text-[10px] font-bold text-[#00ff66] flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>SYNC: {selectedNode.syncLevel}%</span>
                </span>
              </div>
              <h2 className="text-base font-black text-white">{selectedNode.label}</h2>
              <p className="text-[10px] text-neutral-400 font-mono mt-0.5">ID: {selectedNode.id}</p>
            </div>

            <div>
              <h3 className="text-[10px] font-bold uppercase text-neutral-500 mb-1">NODE ARCHITECTURE ROLE</h3>
              <p className="text-xs text-neutral-300 leading-relaxed bg-black/50 p-3 border border-neutral-800">
                {selectedNode.description}
              </p>
            </div>

            <div>
              <h3 className="text-[10px] font-bold uppercase text-neutral-500 mb-2">LINKED SYNAPSE CONNECTIONS</h3>
              <div className="space-y-1.5">
                {selectedNode.connections.map((connId) => {
                  const targetNode = nodes.find((n) => n.id === connId);
                  return (
                    <button
                      key={connId}
                      type="button"
                      onClick={() => setSelectedNodeId(connId)}
                      className="w-full flex items-center justify-between p-2 bg-neutral-900/60 border border-neutral-800 hover:border-[#00ff66] hover:text-[#00ff66] text-xs transition-colors cursor-pointer text-left"
                    >
                      <span className="font-bold">{targetNode?.label || connId}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-neutral-500" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Constitution & SSOT Anchor */}
            <div className="p-3 bg-[#ffe600]/5 border border-[#ffe600]/30 text-[10px] text-[#ffe600] leading-relaxed">
              <strong className="block mb-0.5 font-bold">BRZI_STUDIO DOCTRINE:</strong>
              Admin PC is Single Source of Truth (SSOT). All outputs are verified against core sovereign priorities.
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-800">
            <button
              type="button"
              onClick={onRunEvolutionCycle}
              disabled={isEvolving}
              className="w-full py-2.5 bg-[#00ff66] hover:bg-white text-black font-black text-xs uppercase cursor-pointer shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isEvolving ? 'animate-spin' : ''}`} />
              <span>{isEvolving ? 'SYNCHRONIZING GRAPH...' : 'EXECUTE EVOLUTION ADAPTATION'}</span>
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};
