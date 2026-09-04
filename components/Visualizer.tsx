import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import {
  ExportConfig,
  LyricLine,
  Particle,
  ReactiveSettings,
  ThemeStyle,
  ViralHookAnalysis,
  VisualToggles,
  ShaderMode,
  EvolutionReport,
  HypeText,
  TrackMetadata,
} from '../types';
import { THEMES } from './themes';
import { WaveformTrimmer } from './WaveformTrimmer';
import { FloatingControls } from './FloatingControls';
import { FrequencyBars } from './FrequencyBars';
import { ViralHookModal } from './ViralHookModal';
import { CyberpunkDock } from './CyberpunkDock';
import { BalkanHardwaveSynth } from './BalkanHardwaveSynth';
import { AIDJVoiceEngine } from './AIDJVoiceEngine';
import { EvolutionEngine } from './EvolutionEngine';
import {
  Mic,
  Upload,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Flame,
  Scissors,
  Settings,
  Sliders,
  Volume2,
  Video,
  List,
  AlignLeft,
  Check,
  AlertTriangle,
  Music,
  Zap,
  Dna,
  Camera,
  Share2,
} from 'lucide-react';

// --- Global Types for API Key & Web Audio ---
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    webkitAudioContext: typeof AudioContext;
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

// --- GLSL High-Octane Shaders ---
const VERTEX_SHADER = `
  attribute vec2 position;
  void main() { gl_Position = vec4(position, 0.0, 1.0); }
`;

const FRAGMENT_SHADER = `
  precision mediump float;
  uniform float uTime;
  uniform vec2 uResolution;
  uniform float uBass;
  uniform float uMid;
  uniform float uHigh;
  uniform float uHueShift;
  uniform int uShaderMode; // 0: ORGANIC_CONTOUR, 1: CYBER_TUNNEL, 2: DIGITAL_SOUL, 3: GOD_PARTICLE
  uniform vec3 uColor1; // Primary / Core
  uniform vec3 uColor2; // Secondary / Mid
  uniform vec3 uColor3; // Accent / Outer

  float hash(vec2 p) {
    return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) * (0.1 + abs(sin(p.y * 13.0 + p.x))));
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / uResolution.xy;
    vec2 cUV = uv * 2.0 - 1.0;
    cUV.x *= uResolution.x / uResolution.y;

    // Glitch horizontal displacement on heavy sub-bass hits
    if (uBass > 0.6) {
      cUV.x += (hash(vec2(uTime, cUV.y)) - 0.5) * 0.08 * uBass;
    }

    float r = length(cUV);
    float a = atan(cUV.y, cUV.x);
    vec3 col = vec3(0.0);

    // 0: ORGANIC CONTOUR RIPPLE (Cover Art Replication)
    if (uShaderMode == 0) {
      // Audio-reactive fluid harmonic displacement
      float harmonic = sin(r * 18.0 - uTime * 2.5 + sin(a * 5.0 + uTime * 1.5) * (0.15 + uBass * 0.45))
                     + cos(r * 32.0 - uTime * 3.5) * (uMid * 0.35);

      // Stepped contour isoline rings
      float contour = abs(sin(r * 14.0 - uTime * 1.2 + harmonic * 0.5));
      float contourEdge = smoothstep(0.05, 0.0, abs(contour - 0.5));

      // Neon gradient blending (Core gold/yellow -> fiery orange mid -> deep magenta/purple border)
      vec3 grad = mix(uColor1, uColor2, smoothstep(0.05, 0.42, r));
      grad = mix(grad, uColor3, smoothstep(0.38, 0.85, r));

      // Center pulsar glow responding to vocal speech & bass transients
      float pulsar = (0.09 + uBass * 0.22 + uMid * 0.12) / (r * r * 4.2 + 0.04);
      col = grad * (0.35 + harmonic * 0.35 + contourEdge * 0.75);
      col += uColor1 * pulsar * 0.65;

      // Outer harmonic shockwave ring
      float shock = 0.022 / (abs(r - (0.38 + uBass * 0.42)) + 0.04);
      col += uColor2 * shock * (0.6 + uBass * 0.8);

      // Fine concentric rings
      float fineRings = sin(r * 48.0 - uTime * 5.0);
      col += uColor3 * smoothstep(0.85, 1.0, fineRings) * uHigh * 0.6;
    }
    // 1: CYBER TUNNEL 3D
    else if (uShaderMode == 1) {
      vec2 p = vec2(a / 3.14159265, 1.0 / (r + 0.02) + uTime * (1.2 + uBass * 2.2));
      float grid = abs(sin(p.x * 12.0) * sin(p.y * 8.0));
      grid = smoothstep(0.85, 0.98, grid);

      col = mix(uColor1, uColor2, sin(p.y * 2.0) * 0.5 + 0.5) * grid * (1.0 / (r + 0.25));
      col += uColor3 * (0.03 / (abs(sin(p.y * 4.0)) + 0.05)) * uMid;

      // Tunnel core glow
      col += uColor1 * (0.04 / (r + 0.05)) * (0.8 + uBass);
    }
    // 2: DIGITAL SOUL FBM
    else if (uShaderMode == 2) {
      vec2 p = cUV * 2.5;
      float f = 0.0;
      vec2 q = vec2(sin(uTime * 0.4 + p.x), cos(uTime * 0.4 + p.y));
      f += 0.500 * (sin(p.x * 2.0 + q.x + uTime * 0.8) + cos(p.y * 2.0 + q.y + uTime * 0.8));
      p *= 2.02;
      f += 0.250 * (sin(p.x * 2.0 + uTime * 1.2) + cos(p.y * 2.0 - uTime * 1.2));
      f += (uBass * 0.4 + uMid * 0.2) * sin(length(cUV) * 12.0 - uTime * 4.0);

      col = mix(uColor3, uColor2, clamp(f * 0.5 + 0.5, 0.0, 1.0));
      col = mix(col, uColor1, clamp(pow(f * 0.5 + 0.5, 3.0), 0.0, 1.0));
      col *= (1.0 - length(cUV) * 0.45);
    }
    // 3: GOD PARTICLE
    else {
      float vortex = a + 4.0 / (r + 0.08) - uTime * (2.0 + uBass * 3.0);
      float rays = abs(sin(vortex * 4.0));
      float coreGlow = 0.05 / (r * r * 3.0 + 0.02);

      col = uColor1 * coreGlow * (1.0 + uBass * 1.5);
      col += uColor2 * smoothstep(0.7, 0.95, rays) * (0.5 / (r + 0.1)) * (0.5 + uMid);
      float starRing = smoothstep(0.05, 0.0, abs(r - (0.4 + sin(uTime * 3.0) * 0.1 + uBass * 0.2)));
      col += uColor3 * starRing * 2.0;
    }

    // CRT Scanlines
    float scan = sin(uv.y * 240.0 + uTime * 10.0);
    col *= (0.85 + 0.15 * scan);

    // Vignette
    col *= 1.0 - r * 0.65;

    gl_FragColor = vec4(col, 1.0);
  }
`;

// Helper: Hex to RGB [0..1]
const hexToRgb = (hex: string): [number, number, number] => {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean, 16);
  const r = ((bigint >> 16) & 255) / 255;
  const g = ((bigint >> 8) & 255) / 255;
  const b = (bigint & 255) / 255;
  return [r, g, b];
};

const Visualizer: React.FC = () => {
  // --- Refs ---
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glCanvasRef = useRef<HTMLCanvasElement>(null);
  const matrixCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Audio nodes & engines
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const decodedBufferRef = useRef<AudioBuffer | null>(null);
  const animationFrameRef = useRef<number>(0);
  const audioStartTimeRef = useRef<number>(0);
  const audioOffsetRef = useRef<number>(0);

  // Engines
  const synthRef = useRef<BalkanHardwaveSynth>(new BalkanHardwaveSynth());
  const voiceEngineRef = useRef<AIDJVoiceEngine>(new AIDJVoiceEngine());
  const evolutionEngineRef = useRef<EvolutionEngine>(new EvolutionEngine());

  // WebGL
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const uniformLocsRef = useRef<any>({});

  // Visual State Refs
  const particlesRef = useRef<Particle[]>([]);
  const matrixDropsRef = useRef<number[]>([]);
  const currentLyricIndexRef = useRef<number>(-1);
  const lyricDecodedCharsRef = useRef<number>(0);
  const hueShiftRef = useRef<number>(0);

  // Recording
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // --- React State ---
  const [file, setFile] = useState<File | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [inputMode, setInputMode] = useState<'FILE' | 'MIC' | 'SYNTH'>('SYNTH');
  const [manualLyrics, setManualLyrics] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isViralAnalyzing, setIsViralAnalyzing] = useState(false);
  const [status, setStatus] = useState<string>('VIBE CODING CORE: ONLINE');
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [exportConfig, setExportConfig] = useState<ExportConfig>({ resolution: '1080p', aspectRatio: '16:9' });

  // 142 BPM Balkan Synth State
  const [isSynthPlaying, setIsSynthPlaying] = useState<boolean>(false);
  const [synthBpm, setSynthBpm] = useState<number>(142);

  // Shader Mode & Theme
  const [shaderMode, setShaderMode] = useState<ShaderMode>('ORGANIC_CONTOUR');
  const [themeStyle, setThemeStyle] = useState<ThemeStyle>('SARAJEVO_SUNSET');

  // Flash Hype Text Overlay Queue
  const [hypeTexts, setHypeTexts] = useState<HypeText[]>([]);

  // AI DJ & Voice
  const [isAISpeaking, setIsAISpeaking] = useState<boolean>(false);
  const [isMicListening, setIsMicListening] = useState<boolean>(false);

  // Evolution Engine State
  const [evolutionReport, setEvolutionReport] = useState<EvolutionReport>(() =>
    evolutionEngineRef.current.getReport()
  );
  const [isEvolving, setIsEvolving] = useState<boolean>(false);

  // Share Link State
  const [shareCopied, setShareCopied] = useState<boolean>(false);

  // Cut & Trimmer State
  const [cutStart, setCutStart] = useState<number>(0);
  const [cutEnd, setCutEnd] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);

  // Visual Toggles
  const [toggles, setToggles] = useState<VisualToggles>({
    matrixRain: true,
    scanlines: true,
    screenShake: true,
    oscilloscope: true,
    frequencyBars: true,
    anaglyphSplit: true,
    cssGlitch: true,
  });

  // Reactive Settings
  const [settings, setSettings] = useState<ReactiveSettings>({
    sensitivity: 1.25,
    decaySpeed: 0.8,
    shakeIntensity: 1.0,
    glitchThreshold: 0.55,
    syncOffset: 0.0,
    driftMultiplier: 1.0,
  });

  // Live Audio Stats for HUD VU Meter
  const [liveStats, setLiveStats] = useState({ bass: 0, mid: 0, high: 0, isBurst: false });
  const [isBurstActive, setIsBurstActive] = useState(false);

  // Viral Hook Modal & Setup Modal
  const [viralAnalysis, setViralAnalysis] = useState<ViralHookAnalysis | null>(null);
  const [isViralModalOpen, setIsViralModalOpen] = useState(false);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [isLyricDrawerOpen, setIsLyricDrawerOpen] = useState(false);

  const currentTheme = THEMES[themeStyle] || THEMES.SARAJEVO_SUNSET;

  // Track Metadata
  const trackMetadata: TrackMetadata = {
    title: 'Glitch Sevdah 2.0',
    bpm: synthBpm,
    key: 'D Minor',
    style: 'Cyber-Balkan Hardwave / Suno v4',
    distroKidReady: true,
  };

  // Helper: Text Wrapping
  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => {
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + ' ' + word).width;
      if (width < maxWidth) {
        currentLine += ' ' + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  };

  const createShader = (gl: WebGLRenderingContext, type: number, source: string) => {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(shader));
      return null;
    }
    return shader;
  };

  const initWebGL = useCallback(() => {
    const canvas = glCanvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { alpha: false });
    if (!gl) return;
    glRef.current = gl;

    const vert = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const frag = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vert || !frag) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);
    gl.useProgram(program);
    programRef.current = program;

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const positionLoc = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

    uniformLocsRef.current = {
      uTime: gl.getUniformLocation(program, 'uTime'),
      uResolution: gl.getUniformLocation(program, 'uResolution'),
      uBass: gl.getUniformLocation(program, 'uBass'),
      uMid: gl.getUniformLocation(program, 'uMid'),
      uHigh: gl.getUniformLocation(program, 'uHigh'),
      uHueShift: gl.getUniformLocation(program, 'uHueShift'),
      uShaderMode: gl.getUniformLocation(program, 'uShaderMode'),
      uColor1: gl.getUniformLocation(program, 'uColor1'),
      uColor2: gl.getUniformLocation(program, 'uColor2'),
      uColor3: gl.getUniformLocation(program, 'uColor3'),
    };
  }, []);

  // Ensure AudioContext is alive and resume automatically on user interaction
  const getOrCreateAudioContext = useCallback((): { actx: AudioContext; analyser: AnalyserNode } => {
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      const CtxClass = window.AudioContext || window.webkitAudioContext;
      const actx = new CtxClass();
      const analyser = actx.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = settings.decaySpeed;

      audioContextRef.current = actx;
      analyserRef.current = analyser;

      // Connect engines
      synthRef.current.init(actx, actx.destination, analyser);
      voiceEngineRef.current.init(actx, actx.destination, analyser);

      return { actx, analyser };
    }

    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }

    return { actx: audioContextRef.current, analyser: analyserRef.current! };
  }, [settings.decaySpeed]);

  // Mobile / Desktop Auto-Unlock AudioContext listener
  useEffect(() => {
    const unlockAudio = () => {
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
    };

    window.addEventListener('pointerdown', unlockAudio, { passive: true });
    window.addEventListener('touchstart', unlockAudio, { passive: true });
    window.addEventListener('keydown', unlockAudio, { passive: true });

    return () => {
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  }, []);

  const stopVisualization = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (sourceRef.current) {
      try {
        sourceRef.current.stop();
      } catch (e) {}
      sourceRef.current.disconnect();
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    }
    synthRef.current.stop();
    setIsSynthPlaying(false);

    setIsPlaying(false);
    setIsExporting(false);
    sourceRef.current = null;
    currentLyricIndexRef.current = -1;
    setIsBurstActive(false);
    setStatus('SYSTEM_STANDBY');
  };

  useEffect(() => {
    return () => stopVisualization();
  }, []);

  const getDimensions = useCallback(() => {
    if (isPlaying || isExporting) {
      let w = 1920;
      let h = 1080;
      if (exportConfig.resolution === '4K') {
        w = 3840;
        h = 2160;
      }
      if (exportConfig.aspectRatio === '9:16') {
        const temp = w;
        w = h;
        h = temp;
      }
      return { w, h };
    }
    if (containerRef.current) {
      return { w: containerRef.current.clientWidth, h: containerRef.current.clientHeight };
    }
    return { w: 1920, h: 1080 };
  }, [isPlaying, isExporting, exportConfig]);

  const handleResize = useCallback(() => {
    const { w, h } = getDimensions();

    if (canvasRef.current) {
      canvasRef.current.width = w;
      canvasRef.current.height = h;
    }
    if (glCanvasRef.current) {
      glCanvasRef.current.width = w;
      glCanvasRef.current.height = h;
    }
    if (glRef.current) glRef.current.viewport(0, 0, w, h);

    if (!matrixCanvasRef.current) matrixCanvasRef.current = document.createElement('canvas');
    matrixCanvasRef.current.width = w;
    matrixCanvasRef.current.height = h;

    const fontSize = exportConfig.resolution === '4K' ? 32 : 16;
    const columns = Math.ceil(w / fontSize);
    matrixDropsRef.current = new Array(columns).fill(0).map(() => Math.random() * -100);
  }, [getDimensions, exportConfig]);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    handleResize();
    initWebGL();
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize, initWebGL]);

  // Update Analyser smoothing when settings change
  useEffect(() => {
    if (analyserRef.current) {
      analyserRef.current.smoothingTimeConstant = settings.decaySpeed;
    }
  }, [settings.decaySpeed]);

  // --- FLASH HYPE TEXT OVERLAY TRIGGER ---
  const triggerHypeText = (text: string, color?: string) => {
    const item: HypeText = {
      id: Date.now(),
      text,
      color: color || currentTheme.secondary,
    };
    setHypeTexts((prev) => [...prev, item]);

    // Test audio pulse shockwave into analyser
    testSubPulse();

    setTimeout(() => {
      setHypeTexts((prev) => prev.filter((h) => h.id !== item.id));
    }, 2400);
  };

  // --- SUB-BASS TEST PULSE GENERATOR ---
  const testSubPulse = () => {
    const { actx, analyser } = getOrCreateAudioContext();
    const osc = actx.createOscillator();
    const gain = actx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, actx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, actx.currentTime + 0.35);

    gain.gain.setValueAtTime(0.9, actx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + 0.36);

    osc.connect(gain);
    gain.connect(analyser);
    gain.connect(actx.destination);

    osc.start();
    osc.stop(actx.currentTime + 0.38);

    if (!isPlaying) {
      setIsPlaying(true);
      renderFrame();
    }
  };

  // --- TOGGLE 142 BPM BALKAN SYNTH ---
  const toggleSynth = () => {
    const { actx, analyser } = getOrCreateAudioContext();

    if (isSynthPlaying) {
      synthRef.current.stop();
      setIsSynthPlaying(false);
      setStatus('SYNTH_PAUSED');
    } else {
      synthRef.current.setBpm(synthBpm);
      synthRef.current.start();
      setIsSynthPlaying(true);
      setInputMode('SYNTH');
      setIsPlaying(true);
      setStatus('142_BPM_HARDWAVE_SYNTH_ACTIVE');
      renderFrame();
    }
  };

  // --- AI DJ VOICE SHOUTOUT ---
  const triggerDJDrop = async (customText?: string) => {
    const { actx } = getOrCreateAudioContext();
    const textToSpeak = customText || (await voiceEngineRef.current.generateDJCommentary('DROP'));

    triggerHypeText(textToSpeak.slice(0, 35).toUpperCase(), currentTheme.primary);

    setIsAISpeaking(true);
    setStatus('AI_DJ_VOCALIZING...');

    if (!isPlaying) {
      setIsPlaying(true);
      renderFrame();
    }

    await voiceEngineRef.current.speakText(
      textToSpeak,
      () => setStatus('AI_DJ_BROADCASTING'),
      () => {
        setIsAISpeaking(false);
        setStatus('DJ_BROADCAST_COMPLETE');
      }
    );
  };

  // --- TALK TO AI (MIC) ---
  const talkToAIMic = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      triggerDJDrop('VOICE PROTOCOL READY: BALKAN CYBER REVOLUTION ACTIVE!');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    setIsMicListening(true);
    setStatus('LISTENING_FOR_COMMAND...');

    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      setIsMicListening(false);
      setStatus(`PARSED: "${transcript.slice(0, 25)}..."`);

      triggerHypeText(`ARCHITECT: ${transcript.toUpperCase().slice(0, 30)}`, currentTheme.wave);

      // Generate response via Gemini or fallback
      let reply = 'Sovereign signal received. Balkan VJ Core executing task with zero drift.';
      if (process.env.API_KEY) {
        try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          const res = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `You are the Sovereign AI Agent for artist "Brzi Arzi" (BRZI_STUDIO). The Architect said: "${transcript}". Reply in 1 punchy, authoritative, high-energy sentence.`,
          });
          if (res.text) reply = res.text.trim();
        } catch (e) {}
      }

      await voiceEngineRef.current.speakText(reply);
    };

    recognition.onerror = () => {
      setIsMicListening(false);
      setStatus('MIC_COMMAND_ABORTED');
    };

    recognition.start();
  };

  // --- RUN AUTONOMOUS EVOLUTION CYCLE ---
  const runEvolutionCycle = async () => {
    setIsEvolving(true);
    setStatus('RUNNING_AUTONOMOUS_EVOLUTION_CYCLE...');

    const { report, spokenSummary } = evolutionEngineRef.current.runEvolutionCycle();
    setEvolutionReport(report);

    triggerHypeText(`${report.version} // SYNC ${report.crossModuleSyncScore}%`, '#00ff66');

    // Speak evolution telemetry aloud with voice-synced ripples
    setIsAISpeaking(true);
    if (!isPlaying) {
      setIsPlaying(true);
      renderFrame();
    }

    await voiceEngineRef.current.speakText(
      spokenSummary,
      () => setStatus('VOICE_SYNCED_TELEMETRY_STREAMING'),
      () => {
        setIsAISpeaking(false);
        setIsEvolving(false);
        setStatus('EVOLUTION_CYCLE_SYNCED');
      }
    );
  };

  // --- CAPTURE SCREENSHOT (PNG) ---
  const handleCaptureScreenshot = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `Brzi_Visual_${Date.now()}.png`;
    a.click();
    setStatus('VISUAL_FRAME_CAPTURED');
  };

  // --- IFRAME-SAFE SHARE BUTTON ---
  const handleShareApp = () => {
    const url = window.location.href;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2500);
      }).catch(() => fallbackCopy(url));
    } else {
      fallbackCopy(url);
    }
  };

  const fallbackCopy = (text: string) => {
    const input = document.createElement('input');
    input.value = text;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2500);
  };

  // --- CYCLE THEMES (AI PALETTE GEN) ---
  const cycleTheme = () => {
    const list: ThemeStyle[] = [
      'SARAJEVO_SUNSET',
      'BALKAN_NEON_CYBER',
      'ACID_EMERALD',
      'QUANTUM_VIOLET_SUN',
      'MONOCHROME_BRUTALIST',
    ];
    const currentIndex = list.indexOf(themeStyle);
    const nextIndex = (currentIndex + 1) % list.length;
    setThemeStyle(list[nextIndex]);
    setStatus(`PALETTE_APPLIED: ${list[nextIndex]}`);
  };

  // --- AI LYRICS SYNC ENGINE ---
  const generateLyrics = async (audioFile: File) => {
    if (!process.env.API_KEY) return;
    setIsAnalyzing(true);
    setStatus('NEURAL_SYNC_IN_PROGRESS...');

    try {
      const arrayBuffer = await audioFile.arrayBuffer();
      const uint8 = new Uint8Array(arrayBuffer);

      let binary = '';
      const chunkSize = 0x8000;
      for (let i = 0; i < uint8.length; i += chunkSize) {
        binary += String.fromCharCode.apply(null, uint8.subarray(i, i + chunkSize) as any);
      }
      const base64Audio = btoa(binary);

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const trackDur = decodedBufferRef.current?.duration || 0;
      const durContext =
        trackDur > 0
          ? `The total exact audio duration is ${trackDur.toFixed(2)} seconds. Ensure all timestamps are mathematically exact, monotonically increasing, and bounded strictly within 0.0 and ${trackDur.toFixed(2)} seconds.`
          : '';

      const prompt = `
        Listen to the audio track. ${durContext}
        Generate a JSON array of lyrics with timestamps.
        Format strictly as JSON array:
        [
          { "time": 0.5, "duration": 2.5, "text": "CYBERNETIC AWAKENING", "style": "NORMAL", "emoji": "⚡" }
        ]
        STRICT JSON ONLY.
      `;

      const result = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { text: prompt },
            { inlineData: { mimeType: audioFile.type || 'audio/mp3', data: base64Audio } },
          ],
        },
      });

      const jsonStr = (result.text || '').replace(/```json/g, '').replace(/```/g, '').trim();
      const parsedLyrics = JSON.parse(jsonStr);
      setLyrics(parsedLyrics);
      setStatus('DATA_SYNCED');
    } catch (e: any) {
      console.error('AI Error:', e);
      setStatus('AI_SYNC_COMPLETED_FALLBACK');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // --- MULTIMODAL AI VIRAL HOOK DETECTOR ---
  const analyzeViralHook = async () => {
    if (!file || !process.env.API_KEY) return;
    setIsViralAnalyzing(true);
    setStatus('ANALYZING_VIRAL_HOOK...');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8 = new Uint8Array(arrayBuffer);

      let binary = '';
      const chunkSize = 0x8000;
      for (let i = 0; i < uint8.length; i += chunkSize) {
        binary += String.fromCharCode.apply(null, uint8.subarray(i, i + chunkSize) as any);
      }
      const base64Audio = btoa(binary);

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const trackDur = decodedBufferRef.current?.duration || 180;

      const prompt = `
        You are a top-tier music marketing strategist and viral short-form video architect.
        Audio duration: ${trackDur.toFixed(2)}s.
        Identify the single most VIRAL 15s to 35s section.
        Output strict JSON:
        {
          "hookStart": 42.5,
          "hookEnd": 72.5,
          "duration": 30.0,
          "viralityScore": 96,
          "hookType": "Bass Drop & Cyber Vocal Climax",
          "caption": "WAIT FOR THE GLITCH DROP ⚡ #GlitchSevdah #BalkanAI",
          "retentionTip": "Front-load high-frequency glitch bursts in seconds 0-3",
          "energyCurve": "Exponential Buildup into Seismic Climax"
        }
      `;

      const result = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { text: prompt },
            { inlineData: { mimeType: file.type || 'audio/mp3', data: base64Audio } },
          ],
        },
      });

      const jsonStr = (result.text || '').replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed: ViralHookAnalysis = JSON.parse(jsonStr);
      setViralAnalysis(parsed);
      setIsViralModalOpen(true);
      setStatus('VIRAL_HOOK_IDENTIFIED');
    } catch (err) {
      const trackDur = decodedBufferRef.current?.duration || 60;
      const start = Math.min(trackDur * 0.25, Math.max(0, trackDur - 30));
      const end = Math.min(trackDur, start + 30);
      setViralAnalysis({
        hookStart: start,
        hookEnd: end,
        duration: end - start,
        viralityScore: 95,
        hookType: 'Cyber Glitchcore Drop & Peak Energy Hook',
        caption: 'GLITCH SEVDAH 2.0 ⚡ Sarajevo Sub-Bass hits different #BrziArzi #BalkanHardwave',
        retentionTip: 'Front-load high-frequency glitch bursts in seconds 0-3 to prevent scroll-aways.',
        energyCurve: 'Heavy Buildup with Drop Shockwave',
      });
      setIsViralModalOpen(true);
      setStatus('VIRAL_HOOK_LOADED');
    } finally {
      setIsViralAnalyzing(false);
    }
  };

  // --- RENDER TEXT EFFECT ---
  const renderTextEffect = (
    ctx: CanvasRenderingContext2D,
    lyric: LyricLine,
    x: number,
    y: number,
    bass: number,
    w: number
  ) => {
    const baseSize = exportConfig.resolution === '4K' ? 100 : 50;

    let fontSize = baseSize;
    let color = currentTheme.textGlow;
    let glitchOffset = bass * 15 * settings.shakeIntensity;

    if (lyric.style === 'IMPACT') {
      fontSize *= 1.4;
      glitchOffset *= 2.5;
      color = currentTheme.secondary;
    } else if (lyric.style === 'GLITCH') {
      fontSize *= 1.1;
    } else if (lyric.style === 'SOFT') {
      color = currentTheme.wave;
      glitchOffset *= 0.2;
    }

    ctx.font = `900 ${fontSize}px "Courier New", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const maxWidth = w * 0.8;
    const lines = wrapText(ctx, lyric.text, maxWidth);
    const lineHeight = fontSize * 1.2;
    const totalHeight = lines.length * lineHeight;
    let currentY = y - totalHeight / 2 + lineHeight / 2;

    lines.forEach((line) => {
      // Anaglyph RGB Split
      if (toggles.anaglyphSplit && bass > 0.3) {
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = 'rgba(255, 0, 80, 0.9)';
        ctx.fillText(line, x - glitchOffset, currentY + glitchOffset);

        ctx.fillStyle = 'rgba(0, 240, 255, 0.9)';
        ctx.fillText(line, x + glitchOffset, currentY - glitchOffset);
      }

      // Main Text
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = color;
      ctx.shadowBlur = lyric.style === 'IMPACT' ? 30 * bass : 12;
      ctx.shadowColor = lyric.style === 'IMPACT' ? currentTheme.secondary : currentTheme.primary;
      ctx.fillText(line, x, currentY);
      ctx.shadowBlur = 0;

      currentY += lineHeight;
    });
  };

  // --- CORE RENDER LOOP (60 FPS) ---
  const renderFrame = useCallback(() => {
    const canvas = canvasRef.current;
    const glCanvas = glCanvasRef.current;
    const gl = glRef.current;
    const analyser = analyserRef.current;
    const ac = audioContextRef.current;

    if (!canvas || !glCanvas || !gl || !analyser || !ac) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const time = performance.now() / 1000;

    // Accurate playhead calculation
    let rawPlayTime = 0;
    if (inputMode === 'FILE') {
      rawPlayTime = audioOffsetRef.current + (ac.currentTime - audioStartTimeRef.current);
      if (cutEnd > 0 && rawPlayTime >= cutEnd) {
        if (mediaRecorderRef.current?.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
        stopVisualization();
        return;
      }
    } else {
      rawPlayTime = ac.currentTime - audioStartTimeRef.current;
    }

    setCurrentTime(rawPlayTime);

    // Calibrated time for lyrics sync
    const calibratedLyricTime =
      (rawPlayTime - cutStart) * settings.driftMultiplier + cutStart + settings.syncOffset;

    // 1. Audio Data extraction
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    let rawBass = 0;
    let rawMid = 0;
    let rawHigh = 0;

    for (let i = 0; i < 10; i++) rawBass += dataArray[i];
    for (let i = 10; i < 100; i++) rawMid += dataArray[i];
    for (let i = 100; i < bufferLength; i++) rawHigh += dataArray[i];

    const bass = Math.min(1.0, (rawBass / 10 / 255) * settings.sensitivity);
    const mid = Math.min(1.0, (rawMid / 90 / 255) * settings.sensitivity);
    const high = Math.min(1.0, (rawHigh / (bufferLength - 100) / 255) * settings.sensitivity);

    const isBurst = high > settings.glitchThreshold || (bass > 0.8 && high > 0.45);
    setLiveStats({ bass, mid, high, isBurst });

    if (toggles.cssGlitch) {
      setIsBurstActive(isBurst);
    } else {
      setIsBurstActive(false);
    }

    // Hue Shift
    if (bass > 0.6) hueShiftRef.current += 0.02;
    hueShiftRef.current += 0.001;

    // 2. WebGL Background (Shader with Theme Colors & Selected Shader Mode)
    const locs = uniformLocsRef.current;
    gl.uniform1f(locs.uTime, time);
    gl.uniform2f(locs.uResolution, w, h);
    gl.uniform1f(locs.uBass, bass);
    gl.uniform1f(locs.uMid, mid);
    gl.uniform1f(locs.uHigh, high);
    gl.uniform1f(locs.uHueShift, hueShiftRef.current % 1.0);

    const shaderModeIndex =
      shaderMode === 'ORGANIC_CONTOUR' ? 0 : shaderMode === 'CYBER_TUNNEL' ? 1 : shaderMode === 'DIGITAL_SOUL' ? 2 : 3;
    gl.uniform1i(locs.uShaderMode, shaderModeIndex);

    const c1 = hexToRgb(currentTheme.primary);
    const c2 = hexToRgb(currentTheme.secondary);
    const c3 = hexToRgb(currentTheme.wave);
    gl.uniform3f(locs.uColor1, c1[0], c1[1], c1[2]);
    gl.uniform3f(locs.uColor2, c2[0], c2[1], c2[2]);
    gl.uniform3f(locs.uColor3, c3[0], c3[1], c3[2]);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    // 3. MAIN 2D COMPOSITION
    ctx.save();

    // SCREEN SHAKE & ZOOM PULSE
    if (toggles.screenShake && bass > 0.38) {
      const shake = (bass - 0.38) * 35 * settings.shakeIntensity;
      const zoom = 1.0 + bass * 0.05 * settings.shakeIntensity;

      ctx.translate(w / 2, h / 2);
      ctx.scale(zoom, zoom);
      ctx.translate(
        -w / 2 + (Math.random() - 0.5) * shake,
        -h / 2 + (Math.random() - 0.5) * shake
      );
    }

    // DRAW BACKGROUND FROM SHADER
    ctx.drawImage(glCanvas, 0, 0);

    // 4. CONCENTRIC CIRCULAR TELEMETRY RUNES & TEXT (Spinning along the Contour Rings)
    const cx = w / 2;
    const cy = h / 2;
    const ringRadius = Math.min(w, h) * 0.28 + bass * 15;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(time * 0.2);

    const circularText = '• GLITCH SEVDAH 2.0 • 142 BPM • D MINOR • BRZI ARZI • BRZI STUDIO • BALKAN HARDWAVE ';
    const textLen = circularText.length;
    const angleStep = (Math.PI * 2) / textLen;

    ctx.font = `bold ${exportConfig.resolution === '4K' ? 24 : 12}px monospace`;
    ctx.fillStyle = currentTheme.primary;
    ctx.shadowBlur = 10 * bass;
    ctx.shadowColor = currentTheme.primary;

    for (let i = 0; i < textLen; i++) {
      ctx.save();
      ctx.rotate(i * angleStep);
      ctx.fillText(circularText[i], 0, -ringRadius);
      ctx.restore();
    }
    ctx.restore();

    // 5. CENTER PULSAR BADGE (Glows with Sub-bass & Vocal energy)
    ctx.save();
    ctx.translate(cx, cy);
    const corePulse = (0.15 + bass * 0.25 + mid * 0.15) * Math.min(w, h) * 0.12;

    // Glowing core disc
    const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, corePulse * 2.5);
    grad.addColorStop(0, currentTheme.primary);
    grad.addColorStop(0.5, currentTheme.secondary);
    grad.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, corePulse * 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Center Badge Outline & Label
    ctx.lineWidth = 2;
    ctx.strokeStyle = currentTheme.primary;
    ctx.shadowBlur = 15;
    ctx.shadowColor = currentTheme.primary;
    ctx.strokeRect(-corePulse, -corePulse, corePulse * 2, corePulse * 2);

    ctx.fillStyle = '#ffffff';
    ctx.font = `black ${exportConfig.resolution === '4K' ? 20 : 10}px 'Orbitron', monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('BRZI ARZI', 0, -5);
    ctx.fillStyle = currentTheme.primary;
    ctx.fillText('142 BPM', 0, 8);

    ctx.restore();

    // 6. MATRIX RAIN OVERLAY
    if (toggles.matrixRain) {
      const matrixCanvas = matrixCanvasRef.current;
      if (matrixCanvas) {
        const mCtx = matrixCanvas.getContext('2d');
        if (mCtx) {
          mCtx.fillStyle = 'rgba(0, 0, 0, 0.12)';
          mCtx.fillRect(0, 0, w, h);

          const fontSize = exportConfig.resolution === '4K' ? 32 : 16;
          mCtx.font = `${fontSize}px monospace`;

          const drops = matrixDropsRef.current;
          for (let i = 0; i < drops.length; i++) {
            const charCode =
              Math.random() > 0.5 ? 0x30a0 + Math.random() * 96 : 0x0041 + Math.random() * 26;
            const char = String.fromCharCode(charCode);

            mCtx.fillStyle = bass > 0.7 && Math.random() > 0.8 ? '#ffffff' : currentTheme.matrix;
            const x = i * fontSize;
            const y = drops[i] * fontSize;
            mCtx.fillText(char, x, y);

            if (y > h && Math.random() > 0.98) drops[i] = 0;
            drops[i] += bass * 3.0 + 1;
          }

          ctx.globalCompositeOperation = 'screen';
          ctx.drawImage(matrixCanvas, 0, 0);
          ctx.globalCompositeOperation = 'source-over';
        }
      }
    }

    // 7. JAGGED ELECTRIC OSCILLOSCOPE WAVE
    if (toggles.oscilloscope) {
      const timeDomain = new Uint8Array(bufferLength);
      analyser.getByteTimeDomainData(timeDomain);

      const drawWave = (offsetY: number, color: string, width: number) => {
        ctx.lineWidth = width;
        ctx.strokeStyle = color;
        ctx.shadowBlur = 20 * bass;
        ctx.shadowColor = color;
        ctx.beginPath();

        const sliceW = (w * 1.0) / bufferLength;
        let wx = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = timeDomain[i] / 128.0;
          const noise = (Math.random() - 0.5) * 50 * high;
          const y = (v * h) / 2 + offsetY + noise;

          if (i === 0) ctx.moveTo(wx, y);
          else ctx.lineTo(wx, y);
          wx += sliceW;
        }
        ctx.stroke();
      };

      if (toggles.anaglyphSplit && bass > 0.3) {
        drawWave(h / 4 + bass * 12, 'rgba(255,0,80,0.7)', exportConfig.resolution === '4K' ? 6 : 3);
        drawWave(h / 4 - bass * 12, 'rgba(0,240,255,0.7)', exportConfig.resolution === '4K' ? 6 : 3);
      } else {
        drawWave(h / 4, currentTheme.wave, exportConfig.resolution === '4K' ? 8 : 4);
      }
      ctx.shadowBlur = 0;
    }

    // 8. PARTICLES SYSTEM
    if (bass > 0.5) {
      const pCount = Math.floor(bass * 4);
      for (let k = 0; k < pCount; k++) {
        particlesRef.current.push({
          x: Math.random() * w,
          y: Math.random() * h,
          w: Math.random() * 15 + 2,
          h: Math.random() * 15 + 2,
          vx: (Math.random() - 0.5) * 15,
          vy: (Math.random() - 0.5) * 15,
          life: 1.0,
          color: Math.random() > 0.5 ? '#fff' : currentTheme.secondary,
          type: 'rect',
        });
      }
    }

    for (let i = particlesRef.current.length - 1; i >= 0; i--) {
      const p = particlesRef.current[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.03;
      if (p.life <= 0) {
        particlesRef.current.splice(i, 1);
      } else {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.w, p.h);
        ctx.globalAlpha = 1.0;
      }
    }

    // 9. FLASH HYPE TEXT OVERLAYS (Giant Cyberpunk Center Banners)
    hypeTexts.forEach((ht) => {
      ctx.save();
      const hypeSize = exportConfig.resolution === '4K' ? 90 : 45;
      ctx.font = `black italic ${hypeSize}px 'Orbitron', monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // RGB Chromatic Split
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = 'rgba(255, 0, 80, 0.9)';
      ctx.fillText(ht.text, w / 2 - 6, h / 2 + 6);
      ctx.fillStyle = 'rgba(0, 240, 255, 0.9)';
      ctx.fillText(ht.text, w / 2 + 6, h / 2 - 6);

      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = 30;
      ctx.shadowColor = ht.color;
      ctx.fillText(ht.text, w / 2, h / 2);
      ctx.restore();
    });

    // 10. LYRICS TELEPROMPTER WITH DRIFT/SYNC CALIBRATION
    const activeLyric = lyrics.find(
      (l) =>
        calibratedLyricTime >= l.time &&
        calibratedLyricTime < l.time + (l.duration || 3.0)
    );

    if (activeLyric) {
      const idx = lyrics.indexOf(activeLyric);
      if (currentLyricIndexRef.current !== idx) {
        currentLyricIndexRef.current = idx;
        lyricDecodedCharsRef.current = 0;
      }
      if (lyricDecodedCharsRef.current < activeLyric.text.length) {
        lyricDecodedCharsRef.current += 1.8;
      }

      const visible = Math.floor(lyricDecodedCharsRef.current);
      let textToShow = activeLyric.text.substring(0, visible);
      if (visible < activeLyric.text.length) {
        textToShow += String.fromCharCode(0x30a0 + Math.random() * 50);
      }

      let tx = w / 2;
      let ty = h / 2 + 80;
      if (activeLyric.style === 'GLITCH' && bass > 0.45) {
        tx += (Math.random() - 0.5) * 70 * settings.shakeIntensity;
        ty += (Math.random() - 0.5) * 70 * settings.shakeIntensity;
      }

      renderTextEffect(ctx, { ...activeLyric, text: textToShow }, tx, ty, bass, w);
    }

    ctx.restore(); // Undo screen shake

    // 11. CRT SCANLINES OVERLAY
    if (toggles.scanlines) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
      for (let y = 0; y < h; y += 4) {
        if (y % 8 === 0) ctx.fillRect(0, y, w, 2);
      }
    }

    animationFrameRef.current = requestAnimationFrame(renderFrame);
  }, [
    exportConfig,
    lyrics,
    settings,
    toggles,
    currentTheme,
    cutStart,
    cutEnd,
    inputMode,
    shaderMode,
    hypeTexts,
  ]);

  // --- AUDIO INITIALIZATION & PLAYBACK ROUTINES ---
  const initializeAudio = async (mode: 'PLAY' | 'EXPORT') => {
    stopVisualization();
    handleResize();

    const { actx, analyser } = getOrCreateAudioContext();

    setStatus('INITIALIZING CORE...');

    try {
      if (inputMode === 'SYNTH') {
        synthRef.current.setBpm(synthBpm);
        synthRef.current.start();
        setIsSynthPlaying(true);
        setIsPlaying(true);
        setStatus('142_BPM_HARDWAVE_SYNTH_ACTIVE');
        renderFrame();
        return;
      }

      if (inputMode === 'MIC') {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        micStreamRef.current = stream;
        const micSource = actx.createMediaStreamSource(stream);
        micSource.connect(analyser);

        audioStartTimeRef.current = actx.currentTime;
        audioOffsetRef.current = 0;
        setIsPlaying(true);
        setStatus('LIVE_MIC_INPUT_STREAMING');
        renderFrame();
        return;
      }

      // File Mode Input
      if (!file) {
        alert('Please select an audio file first.');
        return;
      }

      let decoded = decodedBufferRef.current;
      if (!decoded) {
        setStatus('DECODING WAVEFORM...');
        const ab = await file.arrayBuffer();
        decoded = await actx.decodeAudioData(ab);
        decodedBufferRef.current = decoded;
        setAudioBuffer(decoded);
        if (cutEnd === 0) setCutEnd(decoded.duration);
      }

      const source = actx.createBufferSource();
      source.buffer = decoded;

      source.connect(analyser);
      analyser.connect(actx.destination);

      const playOffset = cutStart;
      const playDuration = Math.max(1, (cutEnd > cutStart ? cutEnd : decoded.duration) - playOffset);

      if (mode === 'EXPORT') {
        setIsExporting(true);
        setStatus('RENDER_PROTOCOL_ENGAGED...');

        const dest = actx.createMediaStreamDestination();
        source.connect(dest);

        if (canvasRef.current) {
          const stream = canvasRef.current.captureStream(60);
          const track = dest.stream.getAudioTracks()[0];
          if (track) stream.addTrack(track);

          const videoBitrate = exportConfig.resolution === '4K' ? 30000000 : 8000000;
          const options: MediaRecorderOptions = {
            audioBitsPerSecond: 128000,
            videoBitsPerSecond: videoBitrate,
            mimeType: 'video/mp4',
          };

          if (!MediaRecorder.isTypeSupported(options.mimeType!)) {
            options.mimeType = 'video/webm;codecs=vp9';
            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
              options.mimeType = 'video/webm';
            }
          }

          const rec = new MediaRecorder(stream, options);
          mediaRecorderRef.current = rec;
          recordedChunksRef.current = [];

          rec.ondataavailable = (e) => {
            if (e.data.size > 0) recordedChunksRef.current.push(e.data);
          };

          rec.onstop = () => {
            const blob = new Blob(recordedChunksRef.current, { type: options.mimeType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const ext = options.mimeType?.includes('mp4') ? 'mp4' : 'webm';
            a.download = `brzi_arzi_vibe_${exportConfig.resolution}_${Date.now()}.${ext}`;
            a.click();
            setIsExporting(false);
            setStatus('RENDER_COMPLETE');
            setIsPlaying(false);
          };
          rec.start();
        }
      }

      audioStartTimeRef.current = actx.currentTime;
      audioOffsetRef.current = playOffset;
      source.start(0, playOffset, playDuration);

      sourceRef.current = source;
      setIsPlaying(true);
      setStatus(mode === 'EXPORT' ? 'EXPORTING_CLIP' : 'PREVIEW_ACTIVE');
      renderFrame();

      source.onended = () => {
        if (mediaRecorderRef.current?.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
        setIsPlaying(false);
        setStatus('SEQUENCE_ENDED');
      };
    } catch (e: any) {
      console.error(e);
      setStatus('CORE_FAILURE');
    }
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setLyrics([]);
      setInputMode('FILE');

      try {
        const { actx } = getOrCreateAudioContext();
        const ab = await selectedFile.arrayBuffer();
        const decoded = await actx.decodeAudioData(ab);
        decodedBufferRef.current = decoded;
        setAudioBuffer(decoded);
        setCutStart(0);
        setCutEnd(decoded.duration);
        setStatus(`LOADED: ${selectedFile.name.slice(0, 25)}`);
      } catch (err) {
        console.error('Pre-decode failed:', err);
      }
    }
  };

  const handleSeek = (time: number) => {
    setCurrentTime(time);
    if (isPlaying && inputMode === 'FILE') {
      setCutStart(time);
      initializeAudio('PLAY');
    }
  };

  const handleAlignLyricLine = (index: number) => {
    setLyrics((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], time: Math.max(0, currentTime) };
      return next;
    });
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full bg-black overflow-hidden select-none font-mono text-white flex items-center justify-center ${
        isBurstActive ? 'burst-glitch-active' : ''
      }`}
    >
      {/* Hidden WebGL Background Canvas */}
      <canvas
        ref={glCanvasRef}
        className="absolute top-0 left-0 w-full h-full invisible pointer-events-none"
      />

      {/* Main Composited 2D Canvas */}
      <canvas
        ref={canvasRef}
        className="block max-w-full max-h-full object-contain shadow-[0_0_80px_rgba(255,230,0,0.12)]"
        style={{ aspectRatio: exportConfig.aspectRatio === '16:9' ? '16/9' : '9/16' }}
      />

      {/* Top HUD Telemetry Banner & Real-Time Mini VU Meter */}
      <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5 text-xs bg-black/85 p-2.5 border border-neutral-800 shadow-lg backdrop-blur-md max-w-xs sm:max-w-md">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-1.5 gap-3">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00ff66] animate-ping" />
            <span className="text-[#ffe600] font-black text-xs">SOVEREIGN VIBE SANDBOX</span>
          </div>
          <span className="text-[10px] text-neutral-400 font-bold uppercase">{status}</span>
        </div>

        <div className="flex items-center justify-between text-[10px] text-neutral-400">
          <span>TRACK: <strong className="text-white">{trackMetadata.title}</strong></span>
          <span className="text-[#ffe600] font-black">{trackMetadata.bpm} BPM // {trackMetadata.key}</span>
        </div>

        {/* Real-time Mini VU Meter Bar */}
        <div className="pt-1 border-t border-neutral-900 space-y-1">
          <div className="flex items-center justify-between text-[9px] text-neutral-500 font-bold">
            <span>LIVE VU METER</span>
            <span className={liveStats.isBurst ? 'text-[#ff0055] font-black' : 'text-neutral-400'}>
              {liveStats.isBurst ? 'PEAK CLIP ⚡' : 'NOMINAL -3dB'}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 h-2">
            {/* Bass Level */}
            <div className="bg-neutral-900 overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-[#ffe600] to-[#ff0055] transition-all duration-75"
                style={{ width: `${Math.min(100, liveStats.bass * 100)}%` }}
              />
            </div>
            {/* Mid Level */}
            <div className="bg-neutral-900 overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-[#00f0ff] to-[#ff0077] transition-all duration-75"
                style={{ width: `${Math.min(100, liveStats.mid * 100)}%` }}
              />
            </div>
            {/* High Level */}
            <div className="bg-neutral-900 overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-[#00ff66] to-[#ffe600] transition-all duration-75"
                style={{ width: `${Math.min(100, liveStats.high * 100)}%` }}
              />
            </div>
          </div>
          <div className="flex justify-between text-[8px] text-neutral-600">
            <span>SUB-BASS</span>
            <span>VOCALS / MID</span>
            <span>TRANSIENT HIGH</span>
          </div>
        </div>
      </div>

      {/* Top Right HUD: Autonomous Self-Evolution Engine Badge */}
      <div className="absolute top-3 right-3 z-20 flex items-center space-x-2">
        <button
          type="button"
          onClick={runEvolutionCycle}
          disabled={isEvolving}
          className="bg-black/90 border border-[#00ff66]/60 p-2 text-right shadow-lg backdrop-blur-md hover:border-[#00ff66] transition-all cursor-pointer group"
          title="Run Autonomous Evolution Cycle"
        >
          <div className="flex items-center justify-end space-x-1.5">
            <Dna className={`w-3.5 h-3.5 text-[#00ff66] ${isEvolving ? 'animate-spin' : 'group-hover:scale-110'}`} />
            <span className="text-[#00ff66] font-black text-xs">EVOLUTION: {evolutionReport.crossModuleSyncScore}%</span>
          </div>
          <div className="text-[9px] text-neutral-400">
            {evolutionReport.memoryNodes} NODES // {evolutionReport.version}
          </div>
        </button>

        {/* Quick Screenshot Button */}
        <button
          type="button"
          onClick={handleCaptureScreenshot}
          className="p-2.5 bg-black/90 border border-neutral-700 hover:border-white text-neutral-300 hover:text-white cursor-pointer shadow-lg"
          title="Capture PNG Screenshot"
        >
          <Camera className="w-4 h-4" />
        </button>
      </div>

      {/* Real-time Frequency Spectrum Bars Overlay */}
      {toggles.frequencyBars && isPlaying && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex flex-col items-center">
          <FrequencyBars
            analyser={analyserRef.current}
            theme={currentTheme}
            sensitivity={settings.sensitivity}
          />
        </div>
      )}

      {/* Floating Controls HUD (Adjustable Decay, Sensitivity, Fine-tuning) */}
      <FloatingControls
        currentTheme={themeStyle}
        onThemeChange={setThemeStyle}
        toggles={toggles}
        onToggleChange={(k) => setToggles((p) => ({ ...p, [k]: !p[k] }))}
        settings={settings}
        onSettingChange={(k, v) => setSettings((p) => ({ ...p, [k]: v }))}
        onResetSettings={() =>
          setSettings({
            sensitivity: 1.25,
            decaySpeed: 0.8,
            shakeIntensity: 1.0,
            glitchThreshold: 0.55,
            syncOffset: 0.0,
            driftMultiplier: 1.0,
          })
        }
        liveAudioStats={liveStats}
      />

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFile}
        accept="audio/*"
        className="hidden"
      />

      {/* Primary Cyberpunk Bottom Navigation Dock */}
      <CyberpunkDock
        isSynthPlaying={isSynthPlaying}
        onToggleSynth={toggleSynth}
        synthBpm={synthBpm}
        onSynthBpmChange={(bpm) => {
          setSynthBpm(bpm);
          synthRef.current.setBpm(bpm);
        }}
        onTestSubPulse={testSubPulse}
        inputMode={inputMode}
        onInputModeChange={(m) => {
          setInputMode(m);
          if (m === 'SYNTH') {
            if (!isSynthPlaying) toggleSynth();
          } else {
            if (isSynthPlaying) toggleSynth();
          }
        }}
        file={file}
        onSelectFileClick={() => fileInputRef.current?.click()}
        shaderMode={shaderMode}
        onShaderModeChange={setShaderMode}
        currentTheme={themeStyle}
        onThemeChange={setThemeStyle}
        onCycleTheme={cycleTheme}
        toggles={toggles}
        onToggleChange={(k) => setToggles((p) => ({ ...p, [k]: !p[k] }))}
        onTriggerDJDrop={triggerDJDrop}
        isAISpeaking={isAISpeaking}
        onTriggerHypeText={triggerHypeText}
        onTalkToAIMic={talkToAIMic}
        isMicListening={isMicListening}
        evolutionReport={evolutionReport}
        onRunEvolutionCycle={runEvolutionCycle}
        isEvolving={isEvolving}
        onCaptureScreenshot={handleCaptureScreenshot}
        onShareApp={handleShareApp}
        shareCopied={shareCopied}
        onOpenExportModal={() => setIsSetupModalOpen(true)}
      />

      {/* Waveform Trimmer & Setup Modal */}
      {isSetupModalOpen && (
        <div className="absolute inset-0 bg-black/85 flex items-center justify-center z-40 p-4 backdrop-blur-md">
          <div className="bg-[#07080f] border-2 border-[#39c5bb] p-5 max-w-2xl w-full text-left shadow-[0_0_60px_rgba(57,197,187,0.3)] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-[#39c5bb]/30 pb-3 mb-4">
              <h2 className="text-lg font-black text-white uppercase flex items-center gap-2">
                <Scissors className="w-5 h-5 text-[#39c5bb]" />
                <span>WAVEFORM CUT TRIMMER & MULTIMODAL VIRAL HOOK</span>
              </h2>
              <button
                type="button"
                onClick={() => setIsSetupModalOpen(false)}
                className="text-neutral-400 hover:text-white text-xs font-bold px-2 py-1 bg-neutral-900 border border-neutral-700"
              >
                CLOSE [✕]
              </button>
            </div>

            {/* Trimmer Component */}
            <WaveformTrimmer
              audioBuffer={audioBuffer}
              cutStart={cutStart}
              cutEnd={cutEnd}
              onCutChange={(s, e) => {
                setCutStart(s);
                setCutEnd(e);
              }}
              currentTime={currentTime}
              onSeek={handleSeek}
              lyrics={lyrics}
              themePrimary={currentTheme.primary}
            />

            {/* Export Format Configuration */}
            <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
              <div className="border border-neutral-800 p-2.5 bg-black/40">
                <span className="text-neutral-400 font-bold text-[10px] block mb-1">ASPECT RATIO</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setExportConfig((p) => ({ ...p, aspectRatio: '16:9' }))}
                    className={`flex-1 py-1.5 font-bold ${
                      exportConfig.aspectRatio === '16:9'
                        ? 'bg-[#39c5bb] text-black'
                        : 'bg-neutral-900 text-neutral-400 hover:text-white'
                    }`}
                  >
                    16:9 Widescreen
                  </button>
                  <button
                    type="button"
                    onClick={() => setExportConfig((p) => ({ ...p, aspectRatio: '9:16' }))}
                    className={`flex-1 py-1.5 font-bold ${
                      exportConfig.aspectRatio === '9:16'
                        ? 'bg-[#39c5bb] text-black'
                        : 'bg-neutral-900 text-neutral-400 hover:text-white'
                    }`}
                  >
                    9:16 Shorts / Reel
                  </button>
                </div>
              </div>

              <div className="border border-neutral-800 p-2.5 bg-black/40">
                <span className="text-neutral-400 font-bold text-[10px] block mb-1">EXPORT RESOLUTION</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setExportConfig((p) => ({ ...p, resolution: '1080p' }))}
                    className={`flex-1 py-1.5 font-bold ${
                      exportConfig.resolution === '1080p'
                        ? 'bg-[#39c5bb] text-black'
                        : 'bg-neutral-900 text-neutral-400 hover:text-white'
                    }`}
                  >
                    1080p FHD
                  </button>
                  <button
                    type="button"
                    onClick={() => setExportConfig((p) => ({ ...p, resolution: '4K' }))}
                    className={`flex-1 py-1.5 font-bold ${
                      exportConfig.resolution === '4K'
                        ? 'bg-[#39c5bb] text-black'
                        : 'bg-neutral-900 text-neutral-400 hover:text-white'
                    }`}
                  >
                    4K Ultra HD
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={analyzeViralHook}
                disabled={isViralAnalyzing || !file}
                className="flex-1 bg-[#ff00ff] hover:bg-white hover:text-black text-white py-2.5 font-black uppercase text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                <Flame className="w-4 h-4" />
                <span>{isViralAnalyzing ? 'ANALYZING HOOK...' : 'RUN AI VIRAL HOOK DETECTOR'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSetupModalOpen(false);
                  initializeAudio('EXPORT');
                }}
                className="flex-1 bg-white hover:bg-[#39c5bb] text-black py-2.5 font-black uppercase text-xs cursor-pointer shadow-md"
              >
                RENDER VIDEO CLIP
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Modal for Viral Hook Analysis */}
      <ViralHookModal
        analysis={viralAnalysis}
        isOpen={isViralModalOpen}
        onClose={() => setIsViralModalOpen(false)}
        onApply={(s, e) => {
          setCutStart(s);
          setCutEnd(e);
        }}
        onPreviewHook={(s, e) => {
          setCutStart(s);
          setCutEnd(e);
          initializeAudio('PLAY');
        }}
      />

      {/* Exporting Banner */}
      {isExporting && (
        <div className="absolute top-8 right-8 flex flex-col items-end gap-2 animate-pulse z-30">
          <div className="bg-red-600 text-white font-black px-4 py-2 text-lg shadow-[0_0_20px_red]">
            REC ● {exportConfig.resolution} / 60FPS
          </div>
          <div className="text-right">
            <p className="text-xs text-neutral-400">RENDERING HARDWARE BITRATE STREAM...</p>
            <p className="text-xs text-red-500 font-bold">DO NOT CLOSE TAB</p>
          </div>
        </div>
      )}

      {/* Abort Sequence Button */}
      {isPlaying && !isExporting && (
        <button
          type="button"
          onClick={stopVisualization}
          className="absolute bottom-16 border border-white/40 bg-black/85 text-white hover:bg-white hover:text-black px-6 py-1.5 font-bold tracking-widest backdrop-blur transition-all z-30 text-[10px] uppercase cursor-pointer shadow-lg"
        >
          STOP PLAYBACK
        </button>
      )}
    </div>
  );
};

export default Visualizer;
