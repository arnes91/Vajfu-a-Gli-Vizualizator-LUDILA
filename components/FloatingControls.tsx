import React, { useState } from 'react';
import { ThemeStyle, VisualToggles, ReactiveSettings } from '../types';
import { THEMES } from './themes';
import {
  Sliders,
  Palette,
  Eye,
  Activity,
  Zap,
  RotateCcw,
  Minimize2,
  Maximize2,
  Timer,
} from 'lucide-react';

interface FloatingControlsProps {
  currentTheme: ThemeStyle;
  onThemeChange: (theme: ThemeStyle) => void;
  toggles: VisualToggles;
  onToggleChange: (key: keyof VisualToggles) => void;
  settings: ReactiveSettings;
  onSettingChange: (key: keyof ReactiveSettings, value: number) => void;
  onResetSettings: () => void;
  liveAudioStats: { bass: number; mid: number; high: number; isBurst: boolean };
}

export const FloatingControls: React.FC<FloatingControlsProps> = ({
  currentTheme,
  onThemeChange,
  toggles,
  onToggleChange,
  settings,
  onSettingChange,
  onResetSettings,
  liveAudioStats,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'reactive' | 'themes' | 'toggles' | 'sync'>('reactive');

  const themeList: ThemeStyle[] = ['CYBERPUNK', 'ACID_MATRIX', 'TOKYO_VIOLET', 'MONOCHROME', 'SOLAR_FLARE'];

  return (
    <div className="absolute top-16 right-4 z-30 max-w-sm w-80 bg-[#07080f]/95 border border-[#39c5bb]/60 text-white font-mono text-xs shadow-[0_0_25px_rgba(0,0,0,0.8)] backdrop-blur-md select-none transition-all">
      {/* Header */}
      <div className="flex items-center justify-between bg-black/80 px-3 py-2 border-b border-[#39c5bb]/40">
        <div className="flex items-center space-x-2">
          <Sliders className="w-3.5 h-3.5 text-[#39c5bb]" />
          <span className="font-bold text-[11px] text-[#39c5bb] tracking-tight uppercase">
            CONTROL HUD
          </span>
          {liveAudioStats.isBurst && (
            <span className="bg-[#ff00ff] text-white text-[9px] px-1 py-0.2 font-black animate-pulse">
              ⚡ GLITCH
            </span>
          )}
        </div>

        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-neutral-400 hover:text-white p-1"
            title={isCollapsed ? 'Expand Panel' : 'Collapse Panel'}
          >
            {isCollapsed ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="p-3">
          {/* Sub Navigation */}
          <div className="grid grid-cols-4 gap-1 mb-3 border-b border-neutral-800 pb-2">
            {[
              { id: 'reactive', label: 'REACT', icon: Activity },
              { id: 'themes', label: 'THEMES', icon: Palette },
              { id: 'toggles', label: 'TOGGLE', icon: Eye },
              { id: 'sync', label: 'SYNC', icon: Timer },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-1 text-[10px] font-bold uppercase flex flex-col items-center justify-center transition-colors border ${
                    isActive
                      ? 'bg-[#39c5bb] text-black border-[#39c5bb]'
                      : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-3 h-3 mb-0.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab 1: Reactive Sensitivity & Decay */}
          {activeTab === 'reactive' && (
            <div className="space-y-3">
              {/* Sensitivity Slider */}
              <div>
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-neutral-400 font-bold">AUDIO SENSITIVITY</span>
                  <span className="text-[#39c5bb] font-bold">{settings.sensitivity.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="3.0"
                  step="0.1"
                  value={settings.sensitivity}
                  onChange={(e) => onSettingChange('sensitivity', parseFloat(e.target.value))}
                  className="w-full accent-[#39c5bb] h-1.5 bg-neutral-800 cursor-pointer"
                />
              </div>

              {/* Decay Speed (FFT Smoothing) */}
              <div>
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-neutral-400 font-bold">VISUAL DECAY SPEED</span>
                  <span className="text-[#ff00ff] font-bold">{settings.decaySpeed.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.95"
                  step="0.05"
                  value={settings.decaySpeed}
                  onChange={(e) => onSettingChange('decaySpeed', parseFloat(e.target.value))}
                  className="w-full accent-[#ff00ff] h-1.5 bg-neutral-800 cursor-pointer"
                />
                <div className="flex justify-between text-[8px] text-neutral-500 mt-0.5">
                  <span>Fast Transient</span>
                  <span>Smooth Decay</span>
                </div>
              </div>

              {/* Shake Intensity */}
              <div>
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-neutral-400 font-bold">SHAKE & BASS ZOOM</span>
                  <span className="text-[#ffe600] font-bold">{settings.shakeIntensity.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="2.5"
                  step="0.1"
                  value={settings.shakeIntensity}
                  onChange={(e) => onSettingChange('shakeIntensity', parseFloat(e.target.value))}
                  className="w-full accent-[#ffe600] h-1.5 bg-neutral-800 cursor-pointer"
                />
              </div>

              {/* Glitch Burst Threshold */}
              <div>
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-neutral-400 font-bold">GLITCH BURST THRESHOLD</span>
                  <span className="text-red-400 font-bold">{settings.glitchThreshold.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.25"
                  max="0.85"
                  step="0.05"
                  value={settings.glitchThreshold}
                  onChange={(e) => onSettingChange('glitchThreshold', parseFloat(e.target.value))}
                  className="w-full accent-red-500 h-1.5 bg-neutral-800 cursor-pointer"
                />
              </div>

              {/* Reset button */}
              <button
                type="button"
                onClick={onResetSettings}
                className="w-full py-1 mt-1 bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white text-[10px] flex items-center justify-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>RESET AUDIO DEFAULTS</span>
              </button>
            </div>
          )}

          {/* Tab 2: Visual Themes */}
          {activeTab === 'themes' && (
            <div className="space-y-1.5">
              {themeList.map((tKey) => {
                const t = THEMES[tKey];
                const isSelected = currentTheme === tKey;
                return (
                  <button
                    key={tKey}
                    type="button"
                    onClick={() => onThemeChange(tKey)}
                    className={`w-full p-2 text-left border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-[#39c5bb] bg-[#39c5bb]/15 text-white'
                        : 'border-neutral-800 bg-black/60 text-neutral-400 hover:border-neutral-600 hover:text-white'
                    }`}
                  >
                    <div>
                      <div className="text-[11px] font-bold">{t.name}</div>
                      <div className="text-[9px] text-neutral-500 truncate max-w-[190px]">
                        {t.description}
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <span className="w-3 h-3 border border-black" style={{ backgroundColor: t.primary }} />
                      <span className="w-3 h-3 border border-black" style={{ backgroundColor: t.secondary }} />
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Tab 3: Visual Effect Toggles */}
          {activeTab === 'toggles' && (
            <div className="space-y-1.5">
              {[
                { key: 'matrixRain', label: 'Matrix Rain Stream' },
                { key: 'scanlines', label: 'CRT Phosphor Scanlines' },
                { key: 'screenShake', label: 'Bass Quake & Zoom' },
                { key: 'oscilloscope', label: 'Jagged Waveform' },
                { key: 'frequencyBars', label: 'Live Spectrum Bars' },
                { key: 'anaglyphSplit', label: 'Anaglyph RGB Split' },
                { key: 'cssGlitch', label: 'High-Freq CSS Glitch' },
              ].map(({ key, label }) => {
                const isEnabled = toggles[key as keyof VisualToggles];
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onToggleChange(key as keyof VisualToggles)}
                    className={`w-full px-2 py-1.5 text-left border flex items-center justify-between transition-colors ${
                      isEnabled
                        ? 'bg-neutral-900 border-[#39c5bb]/60 text-[#39c5bb] font-bold'
                        : 'bg-black border-neutral-800 text-neutral-500'
                    }`}
                  >
                    <span className="text-[11px]">{label}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 font-black ${
                        isEnabled ? 'bg-[#39c5bb] text-black' : 'bg-neutral-800 text-neutral-400'
                      }`}
                    >
                      {isEnabled ? 'ON' : 'OFF'}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Tab 4: Drift & Sync Calibration */}
          {activeTab === 'sync' && (
            <div className="space-y-3">
              <div className="text-[10px] text-neutral-400 leading-normal">
                Fine-tune lyrics synchronization or compensate for sample-rate linear time drift.
              </div>

              {/* Sync Offset */}
              <div>
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-neutral-400 font-bold">GLOBAL SYNC OFFSET</span>
                  <span className="text-[#39c5bb] font-bold">
                    {settings.syncOffset >= 0 ? `+${settings.syncOffset.toFixed(2)}s` : `${settings.syncOffset.toFixed(2)}s`}
                  </span>
                </div>
                <div className="flex gap-1 mb-1">
                  <button
                    type="button"
                    onClick={() => onSettingChange('syncOffset', Math.max(-5, settings.syncOffset - 0.5))}
                    className="flex-1 py-1 bg-black border border-neutral-700 text-[10px] hover:border-[#39c5bb]"
                  >
                    -0.5s
                  </button>
                  <button
                    type="button"
                    onClick={() => onSettingChange('syncOffset', Math.max(-5, settings.syncOffset - 0.1))}
                    className="flex-1 py-1 bg-black border border-neutral-700 text-[10px] hover:border-[#39c5bb]"
                  >
                    -0.1s
                  </button>
                  <button
                    type="button"
                    onClick={() => onSettingChange('syncOffset', 0)}
                    className="px-2 py-1 bg-neutral-900 border border-neutral-700 text-[10px] hover:text-white"
                  >
                    0.0s
                  </button>
                  <button
                    type="button"
                    onClick={() => onSettingChange('syncOffset', Math.min(5, settings.syncOffset + 0.1))}
                    className="flex-1 py-1 bg-black border border-neutral-700 text-[10px] hover:border-[#39c5bb]"
                  >
                    +0.1s
                  </button>
                  <button
                    type="button"
                    onClick={() => onSettingChange('syncOffset', Math.min(5, settings.syncOffset + 0.5))}
                    className="flex-1 py-1 bg-black border border-neutral-700 text-[10px] hover:border-[#39c5bb]"
                  >
                    +0.5s
                  </button>
                </div>
              </div>

              {/* Drift Multiplier */}
              <div>
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-neutral-400 font-bold">DRIFT MULTIPLIER (STRETCH)</span>
                  <span className="text-[#ff00ff] font-bold">{settings.driftMultiplier.toFixed(3)}x</span>
                </div>
                <input
                  type="range"
                  min="0.95"
                  max="1.05"
                  step="0.001"
                  value={settings.driftMultiplier}
                  onChange={(e) => onSettingChange('driftMultiplier', parseFloat(e.target.value))}
                  className="w-full accent-[#ff00ff] h-1.5 bg-neutral-800 cursor-pointer"
                />
                <div className="flex justify-between text-[8px] text-neutral-500 mt-0.5">
                  <span>Compress (0.95x)</span>
                  <span>Neutral (1.000x)</span>
                  <span>Expand (1.05x)</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
