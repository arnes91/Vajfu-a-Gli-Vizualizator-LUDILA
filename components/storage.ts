// LocalStorage & State Persistence Layer for BRZI_STUDIO
// Persists active visualizer theme, reactive sensitivity settings, visual toggles, and evolution cycle progress

import { ReactiveSettings, ThemeStyle, VisualToggles, ShaderMode, EvolutionReport } from '../types';

const STORAGE_KEYS = {
  THEME: 'brzi_active_theme',
  SETTINGS: 'brzi_reactive_settings',
  TOGGLES: 'brzi_visual_toggles',
  SHADER_MODE: 'brzi_shader_mode',
  EVOLUTION_STATE: 'brzi_evolution_state',
  MIDI_MAP: 'brzi_midi_mappings',
};

// Default Fallbacks
export const DEFAULT_SETTINGS: ReactiveSettings = {
  sensitivity: 1.25,
  decaySpeed: 0.8,
  shakeIntensity: 1.0,
  glitchThreshold: 0.55,
  syncOffset: 0.0,
  driftMultiplier: 1.0,
};

export const DEFAULT_TOGGLES: VisualToggles = {
  matrixRain: true,
  scanlines: true,
  screenShake: true,
  oscilloscope: true,
  frequencyBars: true,
  anaglyphSplit: true,
  cssGlitch: true,
};

export const DEFAULT_THEME: ThemeStyle = 'SARAJEVO_SUNSET';
export const DEFAULT_SHADER_MODE: ShaderMode = 'ORGANIC_CONTOUR';

// Safe localStorage Access
export const loadSavedTheme = (): ThemeStyle => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    if (saved) return saved as ThemeStyle;
  } catch (e) {}
  return DEFAULT_THEME;
};

export const saveActiveTheme = (theme: ThemeStyle): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  } catch (e) {}
};

export const loadSavedSettings = (): ReactiveSettings => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
  } catch (e) {}
  return DEFAULT_SETTINGS;
};

export const saveActiveSettings = (settings: ReactiveSettings): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {}
};

export const loadSavedToggles = (): VisualToggles => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.TOGGLES);
    if (saved) return { ...DEFAULT_TOGGLES, ...JSON.parse(saved) };
  } catch (e) {}
  return DEFAULT_TOGGLES;
};

export const saveActiveToggles = (toggles: VisualToggles): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.TOGGLES, JSON.stringify(toggles));
  } catch (e) {}
};

export const loadSavedShaderMode = (): ShaderMode => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SHADER_MODE);
    if (saved) return saved as ShaderMode;
  } catch (e) {}
  return DEFAULT_SHADER_MODE;
};

export const saveActiveShaderMode = (mode: ShaderMode): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.SHADER_MODE, mode);
  } catch (e) {}
};

export interface PersistedEvolutionState {
  currentCycle: number;
  memoryNodes: number;
  syncScore: number;
  lastReport?: EvolutionReport;
  historyReports?: EvolutionReport[];
}

export const loadSavedEvolutionState = (): PersistedEvolutionState => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.EVOLUTION_STATE);
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return {
    currentCycle: 9,
    memoryNodes: 6,
    syncScore: 95.4,
  };
};

export const saveActiveEvolutionState = (state: PersistedEvolutionState): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.EVOLUTION_STATE, JSON.stringify(state));
  } catch (e) {}
};
