import React, { useState } from 'react';
import {
  ShaderMode,
  ThemeStyle,
  VisualToggles,
  ReactiveSettings,
  EvolutionReport,
  HypeText,
} from '../types';
import { THEMES } from './themes';
import {
  Music,
  Radio,
  Sparkles,
  Dna,
  Sliders,
  Play,
  Square,
  Mic,
  Upload,
  Volume2,
  Share2,
  Camera,
  Flame,
  Zap,
  Eye,
  Palette,
  RefreshCw,
  Check,
  Copy,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

interface CyberpunkDockProps {
  // Audio state
  isSynthPlaying: boolean;
  onToggleSynth: () => void;
  synthBpm: number;
  onSynthBpmChange: (bpm: number) => void;
  onTestSubPulse: () => void;
  inputMode: 'FILE' | 'MIC' | 'SYNTH';
  onInputModeChange: (mode: 'FILE' | 'MIC' | 'SYNTH') => void;
  file: File | null;
  onSelectFileClick: () => void;

  // Visualizer / Shader
  shaderMode: ShaderMode;
  onShaderModeChange: (mode: ShaderMode) => void;
  currentTheme: ThemeStyle;
  onThemeChange: (theme: ThemeStyle) => void;
  onCycleTheme: () => void;
  toggles: VisualToggles;
  onToggleChange: (key: keyof VisualToggles) => void;

  // AI DJ & Hype
  onTriggerDJDrop: (customText?: string) => void;
  isAISpeaking: boolean;
  onTriggerHypeText: (text: string, color?: string) => void;
  onTalkToAIMic: () => void;
  isMicListening: boolean;

  // Evolution Engine
  evolutionReport: EvolutionReport;
  onRunEvolutionCycle: () => void;
  isEvolving: boolean;

  // Export / Capture
  onCaptureScreenshot: () => void;
  onShareApp: () => void;
  shareCopied: boolean;
  onOpenExportModal: () => void;
}

export const CyberpunkDock: React.FC<CyberpunkDockProps> = ({
  isSynthPlaying,
  onToggleSynth,
  synthBpm,
  onSynthBpmChange,
  onTestSubPulse,
  inputMode,
  onInputModeChange,
  file,
  onSelectFileClick,
  shaderMode,
  onShaderModeChange,
  currentTheme,
  onThemeChange,
  onCycleTheme,
  toggles,
  onToggleChange,
  onTriggerDJDrop,
  isAISpeaking,
  onTriggerHypeText,
  onTalkToAIMic,
  isMicListening,
  evolutionReport,
  onRunEvolutionCycle,
  isEvolving,
  onCaptureScreenshot,
  onShareApp,
  shareCopied,
  onOpenExportModal,
}) => {
  const [activeTab, setActiveTab] = useState<'AUDIO' | 'SHADERS' | 'DJ' | 'EVOLUTION' | 'EXPORT'>('AUDIO');
  const [isExpanded, setIsExpanded] = useState(true);
  const [customDJInput, setCustomDJInput] = useState('');

  const themesList: ThemeStyle[] = [
    'SARAJEVO_SUNSET',
    'BALKAN_NEON_CYBER',
    'ACID_EMERALD',
    'QUANTUM_VIOLET_SUN',
    'MONOCHROME_BRUTALIST',
  ];

  return (
    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 w-[96%] max-w-5xl select-none font-mono">
      {/* Dock Content Panel (Expandable) */}
      {isExpanded && (
        <div className="mb-2 bg-[#05060b]/95 border border-[#39c5bb]/60 p-3.5 backdrop-blur-xl shadow-[0_0_40px_rgba(0,0,0,0.9)] max-h-[46vh] overflow-y-auto text-xs text-neutral-200">
          {/* TAB 1: AUDIO ENGINE */}
          {activeTab === 'AUDIO' && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between border-b border-neutral-800 pb-2 gap-2">
                <div className="flex items-center space-x-2">
                  <Music className="w-4 h-4 text-[#ffe600]" />
                  <span className="font-black text-white text-xs tracking-wider uppercase">
                    GLITCH SEVDAH 2.0 // 142 BPM HARDWAVE SYNTH
                  </span>
                  <span className="bg-[#ff0055]/20 text-[#ff0055] border border-[#ff0055]/40 text-[9px] px-1.5 py-0.5 font-bold">
                    D MINOR
                  </span>
                  <span className="bg-[#00ff66]/20 text-[#00ff66] border border-[#00ff66]/40 text-[9px] px-1.5 py-0.5 font-bold">
                    DISTROKID READY
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={onToggleSynth}
                    className={`px-4 py-1.5 font-black uppercase text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-md ${
                      isSynthPlaying
                        ? 'bg-red-600 text-white animate-pulse shadow-[0_0_15px_red]'
                        : 'bg-[#ffe600] text-black hover:bg-white'
                    }`}
                  >
                    {isSynthPlaying ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isSynthPlaying ? 'STOP BALKAN SYNTH' : 'START 142 BPM SYNTH'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={onTestSubPulse}
                    className="px-2.5 py-1.5 bg-neutral-900 border border-neutral-700 text-neutral-300 hover:text-white text-[11px] font-bold cursor-pointer"
                    title="Send 40Hz sub-bass transient to pulse visualizer"
                  >
                    TEST SUB-PULSE
                  </button>
                </div>
              </div>

              {/* Tempo & Audio Source Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* BPM Controller */}
                <div className="bg-black/60 border border-neutral-800 p-2.5">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-neutral-400 font-bold text-[10px]">TEMPO (BPM)</span>
                    <span className="text-[#ffe600] font-black text-sm">{synthBpm} BPM</span>
                  </div>
                  <input
                    type="range"
                    min="120"
                    max="165"
                    step="1"
                    value={synthBpm}
                    onChange={(e) => onSynthBpmChange(parseInt(e.target.value))}
                    className="w-full accent-[#ffe600] h-1.5 bg-neutral-800 cursor-pointer"
                  />
                  <div className="flex justify-between text-[8px] text-neutral-500 mt-1">
                    <span>120 Classic</span>
                    <span>142 Hardwave</span>
                    <span>165 Turbo</span>
                  </div>
                </div>

                {/* Audio Source Modes */}
                <div className="bg-black/60 border border-neutral-800 p-2.5">
                  <span className="text-neutral-400 font-bold text-[10px] block mb-1.5">INPUT SOURCE ROUTING</span>
                  <div className="grid grid-cols-3 gap-1">
                    <button
                      type="button"
                      onClick={() => onInputModeChange('SYNTH')}
                      className={`py-1 text-[10px] font-bold uppercase border ${
                        inputMode === 'SYNTH'
                          ? 'bg-[#ffe600] text-black border-[#ffe600]'
                          : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                      }`}
                    >
                      SYNTH
                    </button>
                    <button
                      type="button"
                      onClick={() => onInputModeChange('FILE')}
                      className={`py-1 text-[10px] font-bold uppercase border ${
                        inputMode === 'FILE'
                          ? 'bg-[#39c5bb] text-black border-[#39c5bb]'
                          : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                      }`}
                    >
                      FILE
                    </button>
                    <button
                      type="button"
                      onClick={() => onInputModeChange('MIC')}
                      className={`py-1 text-[10px] font-bold uppercase border ${
                        inputMode === 'MIC'
                          ? 'bg-red-600 text-white border-red-500 animate-pulse'
                          : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                      }`}
                    >
                      LIVE MIC
                    </button>
                  </div>
                </div>

                {/* File Quick-Load */}
                <div className="bg-black/60 border border-neutral-800 p-2.5 flex flex-col justify-between">
                  <div className="truncate">
                    <span className="text-neutral-400 font-bold text-[10px] block mb-0.5">AUDIO FILE LOADED</span>
                    <span className="text-[#39c5bb] font-bold text-xs truncate block">
                      {file ? file.name : 'No custom file loaded (Using synth)'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={onSelectFileClick}
                    className="mt-1.5 w-full py-1 bg-neutral-900 border border-neutral-700 text-neutral-300 hover:text-white text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Upload className="w-3 h-3" />
                    <span>{file ? 'CHANGE AUDIO FILE' : 'LOAD MP3 / WAV'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SHADERS & VISUAL FX */}
          {activeTab === 'SHADERS' && (
            <div className="space-y-3">
              <div className="border-b border-neutral-800 pb-2 flex flex-wrap items-center justify-between gap-2">
                <span className="font-black text-white text-xs uppercase flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#39c5bb]" />
                  <span>HIGH-OCTANE SHADER ENGINES & PALETTES</span>
                </span>
                <button
                  type="button"
                  onClick={onCycleTheme}
                  className="px-3 py-1 bg-[#ff00ff]/20 border border-[#ff00ff] text-[#ff00ff] hover:bg-[#ff00ff] hover:text-white text-[10px] font-black uppercase flex items-center gap-1 cursor-pointer transition-all"
                >
                  <Palette className="w-3 h-3" />
                  <span>AI PALETTE GEN (CYCLE)</span>
                </button>
              </div>

              {/* Shader Mode Selection */}
              <div>
                <span className="text-neutral-400 font-bold text-[10px] block mb-1.5">SELECT ACTIVE GLSL SHADER CORE</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'ORGANIC_CONTOUR', label: 'ORGANIC CONTOUR RIPPLE', desc: 'Harmonic Fluid Rings (Cover Match)' },
                    { id: 'CYBER_TUNNEL', label: 'CYBER TUNNEL 3D', desc: 'Infinite Glitch Perspective' },
                    { id: 'DIGITAL_SOUL', label: 'DIGITAL SOUL FBM', desc: 'Plasma Fluid Turbulence' },
                    { id: 'GOD_PARTICLE', label: 'GOD PARTICLE', desc: 'Gravitational Singularity' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => onShaderModeChange(s.id as ShaderMode)}
                      className={`p-2 text-left border transition-all cursor-pointer ${
                        shaderMode === s.id
                          ? 'bg-[#39c5bb]/20 border-[#39c5bb] text-white shadow-[0_0_15px_rgba(57,197,187,0.3)]'
                          : 'bg-black/50 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      <span className="font-black text-[11px] block text-[#39c5bb]">{s.label}</span>
                      <span className="text-[9px] text-neutral-400 block mt-0.5">{s.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme Palettes */}
              <div>
                <span className="text-neutral-400 font-bold text-[10px] block mb-1.5">CYBER-AESTHETIC PALETTES</span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {themesList.map((tKey) => {
                    const t = THEMES[tKey];
                    const isCurrent = currentTheme === tKey;
                    return (
                      <button
                        key={tKey}
                        type="button"
                        onClick={() => onThemeChange(tKey)}
                        className={`p-2 text-left border transition-all cursor-pointer ${
                          isCurrent
                            ? 'bg-neutral-900 border-white text-white shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                            : 'bg-black/40 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        <div className="flex items-center space-x-1 mb-1">
                          <span className="w-2.5 h-2.5 inline-block" style={{ backgroundColor: t.primary }} />
                          <span className="w-2.5 h-2.5 inline-block" style={{ backgroundColor: t.secondary }} />
                          <span className="w-2.5 h-2.5 inline-block" style={{ backgroundColor: t.accent }} />
                        </div>
                        <span className="font-bold text-[10px] block truncate">{t.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Visual Toggles Grid */}
              <div>
                <span className="text-neutral-400 font-bold text-[10px] block mb-1.5">LAYER TOGGLES</span>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                  {[
                    { k: 'matrixRain', label: 'Matrix Rain' },
                    { k: 'scanlines', label: 'Scanlines' },
                    { k: 'screenShake', label: 'Screen Shake' },
                    { k: 'oscilloscope', label: 'Oscilloscope' },
                    { k: 'frequencyBars', label: 'Spectrum Bars' },
                    { k: 'anaglyphSplit', label: 'Anaglyph 3D' },
                  ].map((item) => {
                    const active = toggles[item.k as keyof VisualToggles];
                    return (
                      <button
                        key={item.k}
                        type="button"
                        onClick={() => onToggleChange(item.k as keyof VisualToggles)}
                        className={`py-1 px-1.5 text-[10px] font-bold border truncate ${
                          active
                            ? 'bg-[#39c5bb]/20 border-[#39c5bb] text-white'
                            : 'bg-neutral-950 border-neutral-800 text-neutral-500'
                        }`}
                      >
                        {active ? '✓ ' : '✕ '}
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AI DJ & FLASH HYPE TEXT */}
          {activeTab === 'DJ' && (
            <div className="space-y-3">
              <div className="border-b border-neutral-800 pb-2 flex items-center justify-between">
                <span className="font-black text-white text-xs uppercase flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-[#ff00ff]" />
                  <span>AI DJ SHOUTOUT (VOICE TTS) & FLASH HYPE TEXT</span>
                </span>
                {isAISpeaking && (
                  <span className="bg-[#ff00ff] text-white text-[9px] px-2 py-0.5 font-black animate-pulse">
                    VOICE ACTIVE (SYNCHRONIZING SHOCKWAVES)
                  </span>
                )}
              </div>

              {/* Instant DJ Drop Buttons */}
              <div>
                <span className="text-neutral-400 font-bold text-[10px] block mb-1.5">TRIGGER INSTANT BALKAN DJ SHOUTOUTS</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onTriggerDJDrop('SARAJEVO SUB-BASS ENGAGED! BRZI ARZI ON THE MASTER DECK!')}
                    className="p-2 bg-black/60 border border-[#ffe600]/40 text-[#ffe600] hover:bg-[#ffe600] hover:text-black font-black text-xs text-left cursor-pointer transition-all"
                  >
                    🔊 "SARAJEVO SUB-BASS ENGAGED!"
                  </button>
                  <button
                    type="button"
                    onClick={() => onTriggerDJDrop('GLITCH SEVDAH 2.0 PROTOCOL ACTIVATED. 142 BPM. PURE SOVEREIGNTY.')}
                    className="p-2 bg-black/60 border border-[#39c5bb]/40 text-[#39c5bb] hover:bg-[#39c5bb] hover:text-black font-black text-xs text-left cursor-pointer transition-all"
                  >
                    🔊 "GLITCH SEVDAH 2.0 PROTOCOL ACTIVATED"
                  </button>
                  <button
                    type="button"
                    onClick={() => onTriggerDJDrop('HAJMO SVI! BALKAN BEAST MODE: ONLINE!')}
                    className="p-2 bg-black/60 border border-[#ff0055]/40 text-[#ff0055] hover:bg-[#ff0055] hover:text-white font-black text-xs text-left cursor-pointer transition-all"
                  >
                    🔊 "HAJMO SVI! BALKAN BEAST MODE!"
                  </button>
                  <button
                    type="button"
                    onClick={() => onTriggerDJDrop('CLARITAS EX FRACTA — TURNING NOISE INTO SIGNAL, CHAOS INTO SOVEREIGNTY.')}
                    className="p-2 bg-black/60 border border-[#00ff66]/40 text-[#00ff66] hover:bg-[#00ff66] hover:text-black font-black text-xs text-left cursor-pointer transition-all"
                  >
                    🔊 "CLARITAS EX FRACTA (SOVEREIGNTY SPELL)"
                  </button>
                </div>
              </div>

              {/* Custom Voice Drop Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customDJInput}
                  onChange={(e) => setCustomDJInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && customDJInput.trim()) {
                      onTriggerDJDrop(customDJInput);
                      setCustomDJInput('');
                    }
                  }}
                  placeholder="Type custom DJ drop or AI vocal prompt to synthesize into audio visualizer..."
                  className="flex-1 bg-black border border-neutral-800 px-2.5 py-1.5 text-xs text-white placeholder-neutral-500 focus:border-[#ff00ff] outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customDJInput.trim()) {
                      onTriggerDJDrop(customDJInput);
                      setCustomDJInput('');
                    }
                  }}
                  className="px-4 py-1.5 bg-[#ff00ff] text-white hover:bg-white hover:text-black font-black uppercase text-xs cursor-pointer shadow-md"
                >
                  SPEAK DROP
                </button>
              </div>

              {/* Flash Hype Text Trigger Row */}
              <div>
                <span className="text-neutral-400 font-bold text-[10px] block mb-1.5">FLASH HYPE TEXT OVERLAYS</span>
                <div className="flex flex-wrap gap-1.5">
                  {['SARAJEVO SUB-BASS', 'GLITCH SEVDAH 2.0', 'SOVEREIGN VIBE', 'BALKAN BEAST MODE', 'VIBE CODING CORE: ONLINE'].map((txt) => (
                    <button
                      key={txt}
                      type="button"
                      onClick={() => onTriggerHypeText(txt)}
                      className="px-2.5 py-1 bg-neutral-900 border border-neutral-700 text-neutral-300 hover:text-white hover:border-[#ffe600] text-[10px] font-bold cursor-pointer"
                    >
                      ⚡ {txt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Talk To AI Mic Button */}
              <div className="border border-neutral-800 p-2.5 bg-black/40 flex items-center justify-between">
                <div>
                  <span className="text-white font-bold text-xs block">TALK TO AI (VOICE MIC)</span>
                  <span className="text-neutral-400 text-[10px]">Speak directly to Gemini; AI replies with voice-synced contour ripples</span>
                </div>
                <button
                  type="button"
                  onClick={onTalkToAIMic}
                  className={`px-4 py-2 font-black uppercase text-xs flex items-center gap-1.5 cursor-pointer ${
                    isMicListening
                      ? 'bg-red-600 text-white animate-pulse'
                      : 'bg-[#39c5bb] text-black hover:bg-white'
                  }`}
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>{isMicListening ? 'LISTENING...' : 'START VOICE DIALOGUE'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: AUTONOMOUS SELF-EVOLUTION ENGINE */}
          {activeTab === 'EVOLUTION' && (
            <div className="space-y-3">
              <div className="border-b border-neutral-800 pb-2 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <Dna className="w-4 h-4 text-[#00ff66]" />
                  <span className="font-black text-white text-xs uppercase">
                    AUTONOMOUS SELF-EVOLUTION ENGINE // BRZI_STUDIO
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onRunEvolutionCycle}
                  disabled={isEvolving}
                  className="px-4 py-1.5 bg-[#00ff66] text-black hover:bg-white font-black uppercase text-xs flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(0,255,102,0.4)] disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isEvolving ? 'animate-spin' : ''}`} />
                  <span>{isEvolving ? 'EVOLVING...' : 'RUN EVOLUTION CYCLE'}</span>
                </button>
              </div>

              {/* Telemetry Metrics Bar */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-black/60 border border-neutral-800 p-2">
                  <span className="text-neutral-400 font-bold text-[9px] block">CYCLE VERSION</span>
                  <span className="text-[#00ff66] font-black text-xs block truncate">{evolutionReport.version}</span>
                </div>
                <div className="bg-black/60 border border-neutral-800 p-2">
                  <span className="text-neutral-400 font-bold text-[9px] block">ACTIVE MEMORY NODES</span>
                  <span className="text-[#ffe600] font-black text-xs block">{evolutionReport.memoryNodes} NODES (HYDRATED)</span>
                </div>
                <div className="bg-black/60 border border-neutral-800 p-2">
                  <span className="text-neutral-400 font-bold text-[9px] block">CROSS-MODULE SYNC</span>
                  <span className="text-[#39c5bb] font-black text-xs block">{evolutionReport.crossModuleSyncScore}% [OPTIMAL]</span>
                </div>
              </div>

              {/* Telemetry Summary & Applied Adaptations */}
              <div className="bg-black/80 border border-neutral-800 p-3 space-y-2">
                <div>
                  <span className="text-neutral-500 font-bold text-[10px] block mb-0.5">OPERATIONAL TELEMETRY // {evolutionReport.timestamp}</span>
                  <p className="text-neutral-300 text-[11px] leading-relaxed">{evolutionReport.telemetrySummary}</p>
                </div>

                <div>
                  <span className="text-[#00ff66] font-bold text-[10px] block mb-1">APPLIED ADAPTATIONS:</span>
                  <div className="space-y-1">
                    {evolutionReport.appliedAdaptations.map((adapt, i) => (
                      <div key={i} className="flex items-start space-x-1.5 text-[11px] text-neutral-300">
                        <span className="text-[#00ff66] font-bold">⚡</span>
                        <span>{adapt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: RECORD & EXPORT */}
          {activeTab === 'EXPORT' && (
            <div className="space-y-3">
              <div className="border-b border-neutral-800 pb-2 flex items-center justify-between">
                <span className="font-black text-white text-xs uppercase flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-[#39c5bb]" />
                  <span>CAPTURE, VIRAL HOOK & VIDEO RENDERING</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* One-Tap PNG Capture */}
                <div className="bg-black/60 border border-neutral-800 p-3 flex flex-col justify-between">
                  <div>
                    <span className="font-bold text-white text-xs block mb-1">SAVE VISUAL (PNG)</span>
                    <span className="text-neutral-400 text-[10px] block mb-3">
                      Capture current high-definition organic contour frame with active telemetry overlays.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={onCaptureScreenshot}
                    className="w-full py-2 bg-[#39c5bb] text-black hover:bg-white font-black text-xs uppercase cursor-pointer"
                  >
                    DOWNLOAD PNG FRAME
                  </button>
                </div>

                {/* Viral Clip & Trimmer Launcher */}
                <div className="bg-black/60 border border-neutral-800 p-3 flex flex-col justify-between">
                  <div>
                    <span className="font-bold text-white text-xs block mb-1">TRIMMER & VIRAL HOOK</span>
                    <span className="text-neutral-400 text-[10px] block mb-3">
                      Open the multimodal AI viral hook detector & interactive waveform cut trimmer.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={onOpenExportModal}
                    className="w-full py-2 bg-[#ff00ff] text-white hover:bg-white hover:text-black font-black text-xs uppercase cursor-pointer"
                  >
                    OPEN WAVEFORM TRIMMER
                  </button>
                </div>

                {/* Share Link */}
                <div className="bg-black/60 border border-neutral-800 p-3 flex flex-col justify-between">
                  <div>
                    <span className="font-bold text-white text-xs block mb-1">IFRAME-SAFE SHARE</span>
                    <span className="text-neutral-400 text-[10px] block mb-3">
                      Copy application link with clipboard fallback safe for sandboxed iframes.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={onShareApp}
                    className="w-full py-2 bg-neutral-900 border border-neutral-700 text-neutral-200 hover:text-white font-bold text-xs uppercase flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {shareCopied ? <Check className="w-3.5 h-3.5 text-[#00ff66]" /> : <Share2 className="w-3.5 h-3.5" />}
                    <span>{shareCopied ? 'LINK COPIED!' : 'SHARE APPLICATION'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Bottom Navigation Dock Bar */}
      <div className="bg-black/90 border-2 border-[#39c5bb] p-1.5 flex items-center justify-between backdrop-blur-md shadow-[0_0_30px_rgba(57,197,187,0.3)]">
        {/* Dock Navigation Buttons */}
        <div className="flex items-center space-x-1 overflow-x-auto">
          {[
            { id: 'AUDIO', label: 'AUDIO & SYNTH', icon: Music, color: '#ffe600' },
            { id: 'SHADERS', label: 'SHADERS & FX', icon: Sparkles, color: '#39c5bb' },
            { id: 'DJ', label: 'AI DJ & HYPE', icon: Zap, color: '#ff00ff' },
            { id: 'EVOLUTION', label: 'EVOLUTION', icon: Dna, color: '#00ff66' },
            { id: 'EXPORT', label: 'RECORD / EXPORT', icon: Camera, color: '#ffffff' },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setIsExpanded(true);
                }}
                className={`px-3 py-1.5 text-xs font-black uppercase flex items-center space-x-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.4)]'
                    : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" style={{ color: isActive ? '#000' : tab.color }} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Dock Utilities: Expand/Collapse Toggle */}
        <div className="flex items-center space-x-1.5 pl-2 border-l border-neutral-800">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white text-xs font-bold border border-neutral-700 cursor-pointer"
            title={isExpanded ? 'Collapse Dock' : 'Expand Dock'}
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
