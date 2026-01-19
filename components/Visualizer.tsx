import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";

// --- Constants ---
const THEME = {
  primary: '#39c5bb',   // Miku Teal
  secondary: '#ff00ff', // Glitch Pink
  background: '#050505',
  wave: '#00ffcc',      // Oscilloscope Cyan
  matrix: '#00ff41',    // Matrix Green
  textGlow: '#ffffff',
};

// --- Shader Source (The "Brzi Arzi" / Cyberpunk Core) ---
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

  // Noise function
  float hash(vec2 p) { return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) * (0.1 + abs(sin(p.y * 13.0 + p.x)))); }

  void main() {
    vec2 uv = gl_FragCoord.xy / uResolution.xy;
    uv = uv * 2.0 - 1.0;
    uv.x *= uResolution.x / uResolution.y;

    // Palette
    vec3 color_bg = vec3(0.02, 0.05, 0.1);
    vec3 color_teal = vec3(0.2, 0.9, 1.0);
    vec3 color_pink = vec3(1.0, 0.0, 0.8);
    vec3 color_green = vec3(0.0, 1.0, 0.4);

    // 1. Vortex / Tunnel
    float radius = length(uv);
    float angle = atan(uv.y, uv.x);
    
    // Twist based on bass
    float tunnel = sin(10.0 * radius - uTime * 3.0 + uBass * 4.0) * 0.3;
    
    vec3 col = mix(color_bg, color_teal, smoothstep(0.2, 1.2, radius + tunnel));

    // 2. Shockwaves (Rings)
    float shock = exp(-10.0 * abs(radius - 0.5 - uBass * 0.5));
    col += color_pink * shock * uBass;

    // 3. Glitch Blocks
    float block = step(0.9, fract(uv.x * 10.0 + uTime)) * step(0.9, fract(uv.y * 10.0 - uTime));
    col += vec3(1.0) * block * uHigh * 0.5;

    // 4. CRT Scanline & Grain
    float scanline = sin(uv.y * 800.0) * 0.04;
    col -= scanline;
    float noise = hash(uv + uTime) * 0.1;
    col += noise;

    // Vignette
    col *= 1.0 - 0.5 * radius;

    gl_FragColor = vec4(col, 1.0);
  }
`;

// --- Types ---
interface Particle {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

interface LyricLine {
  time: number;
  text: string;
}

interface ExportConfig {
  resolution: '1080p' | '4K';
  aspectRatio: '16:9' | '9:16';
}

const Visualizer: React.FC = () => {
  // --- Refs ---
  const canvasRef = useRef<HTMLCanvasElement>(null);      // 2D Composition Layer
  const glCanvasRef = useRef<HTMLCanvasElement>(null);    // WebGL Background Layer
  const matrixCanvasRef = useRef<HTMLCanvasElement | null>(null); // Offscreen Matrix Layer
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Audio
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const animationFrameRef = useRef<number>(0);
  const audioStartTimeRef = useRef<number>(0);

  // WebGL
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const uniformLocsRef = useRef<any>({});

  // Visual State Refs
  const particlesRef = useRef<Particle[]>([]);
  const matrixDropsRef = useRef<number[]>([]); 
  const currentLyricIndexRef = useRef<number>(-1);
  const lyricDecodedCharsRef = useRef<number>(0); // For Matrix decoding effect on lyrics

  // Recording
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // State
  const [file, setFile] = useState<File | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [status, setStatus] = useState<string>("SYSTEM READY");
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [exportConfig, setExportConfig] = useState<ExportConfig>({ resolution: '1080p', aspectRatio: '16:9' });

  // --- Helpers ---
  const createShader = (gl: WebGLRenderingContext, type: number, source: string) => {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compile error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
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

    // Buffer
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1, 1, -1, -1, 1,
      -1, 1, 1, -1, 1, 1
    ]), gl.STATIC_DRAW);

    const positionLoc = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

    // Uniforms
    uniformLocsRef.current = {
      uTime: gl.getUniformLocation(program, 'uTime'),
      uResolution: gl.getUniformLocation(program, 'uResolution'),
      uBass: gl.getUniformLocation(program, 'uBass'),
      uMid: gl.getUniformLocation(program, 'uMid'),
      uHigh: gl.getUniformLocation(program, 'uHigh'),
    };
  }, []);

  // --- Cleanup ---
  useEffect(() => {
    return () => stopVisualization();
  }, []);

  const stopVisualization = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (sourceRef.current) {
        try { sourceRef.current.stop(); } catch(e) {}
        sourceRef.current.disconnect();
    }
    if (audioContextRef.current) audioContextRef.current.close();
    
    setIsPlaying(false);
    setIsExporting(false);
    audioContextRef.current = null;
    analyserRef.current = null;
    sourceRef.current = null;
    currentLyricIndexRef.current = -1;
  };

  // --- Resize / Config Resolution ---
  const getDimensions = useCallback(() => {
    if (isPlaying || isExporting) {
       // Force resolution based on config
       let w = 1920;
       let h = 1080;
       
       if (exportConfig.resolution === '4K') {
         w = 3840;
         h = 2160;
       }

       if (exportConfig.aspectRatio === '9:16') {
         // Swap for vertical
         const temp = w;
         w = h;
         h = temp;
       }
       return { w, h };
    }
    // Default preview mode
    if (containerRef.current) {
       return { 
         w: containerRef.current.clientWidth,
         h: containerRef.current.clientHeight
       };
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

    // Setup Matrix Canvas
    if (!matrixCanvasRef.current) {
      matrixCanvasRef.current = document.createElement('canvas');
    }
    matrixCanvasRef.current.width = w;
    matrixCanvasRef.current.height = h;

    const fontSize = exportConfig.resolution === '4K' ? 32 : 16;
    const columns = Math.ceil(w / fontSize);
    matrixDropsRef.current = new Array(columns).fill(0).map(() => Math.random() * -100);

  }, [getDimensions, exportConfig]);

  useEffect(() => {
    // Only bind window resize if NOT exporting/playing specific resolution
    if (!isPlaying) {
      window.addEventListener('resize', handleResize);
      handleResize();
      initWebGL();
      return () => window.removeEventListener('resize', handleResize);
    } else {
      handleResize(); // Set fixed size once
      initWebGL();
    }
  }, [handleResize, initWebGL, isPlaying]);

  // --- AI LYRICS GENERATION ---
  const generateLyrics = async (audioFile: File) => {
    if (!process.env.API_KEY) {
      console.warn("No API KEY found");
      return;
    }

    setIsAnalyzing(true);
    setStatus("AI_CORE_ANALYZING_LYRICS...");

    try {
      // 1. Convert File to Base64
      const arrayBuffer = await audioFile.arrayBuffer();
      const base64Audio = btoa(
        new Uint8Array(arrayBuffer)
          .reduce((data, byte) => data + String.fromCharCode(byte), '')
      );

      // 2. Call Gemini
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const prompt = `
        Listen to this audio file. It contains music with lyrics which may be in Bosnian, English, or Japanese.
        Transcribe the lyrics and provide precise timestamps for each line.
        
        Return STRICTLY a JSON array of objects. Do not wrap in markdown code blocks.
        Format:
        [
          { "time": 0.5, "text": "First line of lyrics" },
          { "time": 3.2, "text": "Second line..." }
        ]
        If instrumental, return an empty array.
      `;

      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: {
            parts: [
                { text: prompt },
                {
                    inlineData: {
                        mimeType: audioFile.type || "audio/mp3",
                        data: base64Audio
                    }
                }
            ]
        }
      });

      const responseText = result.text;
      
      if (!responseText) {
          throw new Error("Empty response from AI");
      }

      // Clean up markdown if Gemini adds it despite instructions
      const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      
      const parsedLyrics = JSON.parse(jsonStr);
      setLyrics(parsedLyrics);
      setStatus("LYRICS_ACQUIRED");

    } catch (e) {
      console.error("AI Error:", e);
      setStatus("AI_ANALYSIS_FAILED_PROCEEDING_WITHOUT_LYRICS");
      setLyrics([]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // --- LYRICS RENDERER ---
  const renderTextEffect = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, bass: number, w: number) => {
    // Determine font size based on resolution
    const baseSize = exportConfig.resolution === '4K' ? 120 : 60;
    const fontSize = baseSize + (bass * 20);
    
    ctx.font = `900 ${fontSize}px "Courier New", monospace`; // Fallback to monospace for consistency
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 1. Chromatic Aberration (RGB Split)
    const offset = bass * 15;
    
    // Red Channel
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
    ctx.fillText(text, x - offset, y + offset);

    // Blue Channel
    ctx.fillStyle = 'rgba(0, 255, 255, 0.8)';
    ctx.fillText(text, x + offset, y - offset);

    // Main Text (White/Teal)
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 20 * bass;
    ctx.shadowColor = THEME.secondary;
    ctx.fillText(text, x, y);
    ctx.shadowBlur = 0;

    // Japanese/Kanji specific glow if detected
    if (/[一-龯]/.test(text)) {
         ctx.strokeStyle = THEME.secondary;
         ctx.lineWidth = 2;
         ctx.strokeText(text, x, y);
    }
  };

  // --- CORE RENDER LOOP ---
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
    const cx = w / 2;
    const cy = h / 2;
    const time = performance.now() / 1000;

    // 1. Audio Data
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    // Frequency Bands
    let bass = 0, mid = 0, high = 0;
    for(let i=0; i<10; i++) bass += dataArray[i];
    for(let i=10; i<100; i++) mid += dataArray[i];
    for(let i=100; i<bufferLength; i++) high += dataArray[i];

    bass = bass / 10 / 255; // 0.0 - 1.0
    mid = mid / 90 / 255;
    high = high / (bufferLength - 100) / 255;

    const isBassHit = bass > 0.7; 

    // 2. Render WebGL Background
    const locs = uniformLocsRef.current;
    gl.uniform1f(locs.uTime, time);
    gl.uniform2f(locs.uResolution, w, h);
    gl.uniform1f(locs.uBass, bass);
    gl.uniform1f(locs.uMid, mid);
    gl.uniform1f(locs.uHigh, high);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    // 3. Composite WebGL -> 2D Canvas
    ctx.drawImage(glCanvas, 0, 0);

    // 4. MATRIX RAIN EFFECT
    const matrixCanvas = matrixCanvasRef.current;
    if (matrixCanvas) {
        const mCtx = matrixCanvas.getContext('2d');
        if (mCtx) {
            mCtx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            mCtx.globalCompositeOperation = 'destination-out';
            mCtx.fillRect(0, 0, w, h);
            mCtx.globalCompositeOperation = 'source-over';

            const fontSize = exportConfig.resolution === '4K' ? 32 : 16;
            mCtx.font = `${fontSize}px monospace`;
            
            const drops = matrixDropsRef.current;
            for (let i = 0; i < drops.length; i++) {
                // Include Katakana for Miku vibes
                const char = String.fromCharCode(0x30A0 + Math.random() * 96);
                
                if (isBassHit) {
                    mCtx.fillStyle = Math.random() > 0.5 ? '#ffffff' : THEME.wave;
                } else {
                    mCtx.fillStyle = THEME.matrix;
                }

                const x = i * fontSize;
                const y = drops[i] * fontSize;
                mCtx.fillText(char, x, y);

                if (y > h && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i] += (isBassHit ? 1.0 : 0.5) + (Math.random() * 0.2);
            }
            ctx.drawImage(matrixCanvas, 0, 0);
        }
    }

    // 5. Oscilloscope Waveform (Neural Link)
    const timeDomain = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(timeDomain);

    ctx.lineWidth = exportConfig.resolution === '4K' ? 6 : 3;
    ctx.strokeStyle = THEME.wave;
    ctx.shadowBlur = 15;
    ctx.shadowColor = THEME.wave;
    ctx.beginPath();

    const sliceW = w * 1.0 / bufferLength;
    let wx = 0;

    for(let i = 0; i < bufferLength; i++) {
        const v = timeDomain[i] / 128.0;
        const y = v * (h / 2);

        let gx = wx;
        let gy = y;
        if(bass > 0.8) {
            gx += (Math.random() * 20 - 10);
            gy += (Math.random() * 50 - 25);
        }

        if(i === 0) ctx.moveTo(gx, gy);
        else ctx.lineTo(gx, gy);

        wx += sliceW;
    }
    ctx.stroke();
    ctx.shadowBlur = 0; 

    // 6. Particles
    if (isBassHit) {
        const count = Math.floor(bass * 5);
        for(let k=0; k<count; k++) {
            particlesRef.current.push({
                x: Math.random() * w,
                y: Math.random() * h,
                w: Math.random() * (w * 0.005) + 2,
                h: Math.random() * (h * 0.02) + 2,
                vx: (Math.random() - 0.5) * (w * 0.02),
                vy: (Math.random() - 0.5) * (h * 0.02),
                life: 1.0,
                color: Math.random() > 0.5 ? THEME.primary : THEME.secondary
            });
        }
    }

    for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.05;
        
        if (p.life <= 0) {
            particlesRef.current.splice(i, 1);
        } else {
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.life;
            ctx.fillRect(p.x, p.y, p.w, p.h);
            ctx.globalAlpha = 1.0;
        }
    }

    // 7. Spectrum Web
    const radius = Math.min(w, h) * 0.2 + (bass * (Math.min(w,h) * 0.1));
    ctx.lineWidth = exportConfig.resolution === '4K' ? 4 : 2;
    ctx.strokeStyle = THEME.primary;
    ctx.beginPath();
    
    const sliceCount = 120;
    const step = (Math.PI * 2) / sliceCount;

    for(let i=0; i<sliceCount; i++) {
        const freqIdx = Math.floor((i / sliceCount) * (bufferLength / 2));
        const val = dataArray[freqIdx] / 255;
        const barH = val * (Math.min(w,h) * 0.3) * (1 + bass);

        const angle = i * step + (isBassHit ? (Math.random()-0.5)*0.1 : 0);
        
        const x1 = cx + Math.cos(angle) * radius;
        const y1 = cy + Math.sin(angle) * radius;
        const x2 = cx + Math.cos(angle) * (radius + barH);
        const y2 = cy + Math.sin(angle) * (radius + barH);

        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
    }
    ctx.stroke();

    // 8. LYRICS DISPLAY (AI INTEGRATED)
    // Calculate current song time
    const currentTime = ac.currentTime - audioStartTimeRef.current;
    
    // Find current lyric
    const lyricIdx = lyrics.findIndex((l, i) => {
        const next = lyrics[i+1];
        return currentTime >= l.time && (!next || currentTime < next.time);
    });

    if (lyricIdx !== -1) {
        const lyric = lyrics[lyricIdx];
        
        // Reset decoding if changed
        if (currentLyricIndexRef.current !== lyricIdx) {
            currentLyricIndexRef.current = lyricIdx;
            lyricDecodedCharsRef.current = 0;
        }

        // Increment decoded chars logic (Matrix reveal)
        if (lyricDecodedCharsRef.current < lyric.text.length) {
            lyricDecodedCharsRef.current += 0.5; // Speed of reveal
        }

        const visibleChars = Math.floor(lyricDecodedCharsRef.current);
        let displayText = lyric.text.substring(0, visibleChars);
        
        // Add random glitch chars at the end of the reveal
        if (visibleChars < lyric.text.length) {
             displayText += String.fromCharCode(0x30A0 + Math.random() * 50);
        }

        // Apply Heavy Shake on Bass
        let tx = cx;
        let ty = h * 0.85; // Position at bottom
        
        if (bass > 0.6) {
             tx += (Math.random() - 0.5) * 20;
             ty += (Math.random() - 0.5) * 20;
        }

        renderTextEffect(ctx, displayText, tx, ty, bass, w);
    }

    // 9. Status / Glitch Overlay Text
    ctx.save();
    ctx.textAlign = 'left';
    ctx.font = `bold ${w * 0.015}px monospace`;
    ctx.fillStyle = THEME.textGlow;
    ctx.fillText(`AUDIO: ${bass > 0.8 ? 'CRITICAL' : 'STABLE'}`, 40, h - 40);
    ctx.fillText(`LYRICS: ${lyrics.length > 0 ? 'AI_LINKED' : 'OFFLINE'}`, 40, h - 70);
    ctx.restore();

    animationFrameRef.current = requestAnimationFrame(renderFrame);
  }, [exportConfig, lyrics]);

  // --- Audio Init ---
  const initializeAudio = async (mode: 'PLAY' | 'EXPORT') => {
    if (!file) return;
    
    // AI check
    if (lyrics.length === 0 && !isAnalyzing) {
        const confirmNoLyrics = window.confirm("AI Lyrics not generated yet. Do you want to generate them now? (Cancel to proceed without)");
        if (confirmNoLyrics) {
            await generateLyrics(file);
        }
    }

    stopVisualization();
    
    // Resize for Export needs to happen BEFORE context creation to ensure buffer size
    handleResize();

    const CtxClass = window.AudioContext || (window as any).webkitAudioContext;
    const actx = new CtxClass();
    const analyser = actx.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.8;

    setStatus("DECODING_CORE...");
    try {
        const ab = await file.arrayBuffer();
        const decoded = await actx.decodeAudioData(ab);
        const source = actx.createBufferSource();
        source.buffer = decoded;
        
        source.connect(analyser);
        analyser.connect(actx.destination);

        if (mode === 'EXPORT') {
            setIsExporting(true);
            setStatus("INIT_RECORDER...");
            
            const dest = actx.createMediaStreamDestination();
            source.connect(dest);

            if (canvasRef.current) {
                // Ensure the stream captures the high-res canvas
                const stream = canvasRef.current.captureStream(60);
                const track = dest.stream.getAudioTracks()[0];
                stream.addTrack(track);

                // High bitrate for 4K
                const options = {
                    mimeType: 'video/webm;codecs=vp9',
                    videoBitsPerSecond: exportConfig.resolution === '4K' ? 25000000 : 8000000 
                };
                
                if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                     options.mimeType = 'video/mp4'; // Fallback
                }

                const rec = new MediaRecorder(stream, options);
                mediaRecorderRef.current = rec;
                recordedChunksRef.current = [];
                
                rec.ondataavailable = e => { if(e.data.size>0) recordedChunksRef.current.push(e.data); };
                rec.onstop = () => {
                    const blob = new Blob(recordedChunksRef.current, {type: options.mimeType});
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `glitch_core_${exportConfig.resolution}_${Date.now()}.webm`;
                    a.click();
                    setIsExporting(false);
                    setStatus("EXPORT_DONE");
                    setIsPlaying(false);
                };
                rec.start();
                setStatus("RECORDING...");
            }
        } else {
            setStatus("VISUAL_CORE_ONLINE");
        }

        audioStartTimeRef.current = actx.currentTime;
        source.start(0);
        
        audioContextRef.current = actx;
        analyserRef.current = analyser;
        sourceRef.current = source;
        setIsPlaying(true);
        renderFrame();

        source.onended = () => {
             if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop();
             setIsPlaying(false);
             setStatus("ENDED");
        };

    } catch (e) {
        console.error(e);
        setStatus("ERR_DECODE");
    }
  };

  // --- Handlers ---
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
        setFile(e.target.files[0]);
        setLyrics([]); // Reset lyrics for new file
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-full bg-black overflow-hidden select-none font-mono text-white flex items-center justify-center">
      {/* Hidden WebGL Layer */}
      <canvas ref={glCanvasRef} className="absolute top-0 left-0 w-full h-full invisible pointer-events-none" />
      
      {/* Visible Composition Layer - Scaled down via CSS if larger than screen, but intrinsic size remains high */}
      <canvas 
        ref={canvasRef} 
        className="block max-w-full max-h-full object-contain shadow-[0_0_50px_rgba(0,255,204,0.1)]"
        style={{
             aspectRatio: exportConfig.aspectRatio === '16:9' ? '16/9' : '9/16'
        }}
      />

      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-10">
         <div className="absolute top-4 left-4 text-[#39c5bb] text-xs border-l-2 border-[#39c5bb] pl-2 bg-black/50 p-2">
            <p>STATUS: {status}</p>
            <p>RES: {exportConfig.resolution} // {exportConfig.aspectRatio}</p>
            <p>AI LYRICS: {lyrics.length > 0 ? "LOADED" : "NULL"}</p>
         </div>

         {!isPlaying && (
            <div className="pointer-events-auto bg-black/90 border border-[#39c5bb] p-8 text-center shadow-[0_0_50px_rgba(57,197,187,0.2)] max-w-2xl w-full backdrop-blur-md">
                <h1 className="text-5xl font-bold mb-2 tracking-tighter text-white glitch-text" style={{textShadow: '3px 3px #ff00ff'}}>
                    MIKU PROTOCOL
                </h1>
                <p className="text-[#39c5bb] tracking-[0.5em] text-sm mb-6">V.11.0 AI INTEGRATED</p>
                
                <input type="file" ref={fileInputRef} onChange={handleFile} accept="audio/*" className="hidden" />
                
                {!file ? (
                    <button onClick={() => fileInputRef.current?.click()} className="w-full border border-[#39c5bb] px-8 py-4 hover:bg-[#39c5bb] hover:text-black transition-colors font-bold tracking-widest text-[#39c5bb] mb-4">
                        INITIALIZE FILE
                    </button>
                ) : (
                    <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
                             <div className="border border-gray-700 p-2 text-left">
                                 <p className="text-gray-500 mb-1">ASPECT RATIO</p>
                                 <div className="flex gap-2">
                                     <button 
                                        onClick={() => setExportConfig(p => ({...p, aspectRatio: '16:9'}))}
                                        className={`px-2 py-1 ${exportConfig.aspectRatio === '16:9' ? 'bg-[#39c5bb] text-black' : 'text-gray-400'}`}>
                                        16:9 (WIDE)
                                     </button>
                                     <button 
                                        onClick={() => setExportConfig(p => ({...p, aspectRatio: '9:16'}))}
                                        className={`px-2 py-1 ${exportConfig.aspectRatio === '9:16' ? 'bg-[#39c5bb] text-black' : 'text-gray-400'}`}>
                                        9:16 (MOBILE)
                                     </button>
                                 </div>
                             </div>
                             <div className="border border-gray-700 p-2 text-left">
                                 <p className="text-gray-500 mb-1">RESOLUTION</p>
                                 <div className="flex gap-2">
                                     <button 
                                        onClick={() => setExportConfig(p => ({...p, resolution: '1080p'}))}
                                        className={`px-2 py-1 ${exportConfig.resolution === '1080p' ? 'bg-[#39c5bb] text-black' : 'text-gray-400'}`}>
                                        1080p
                                     </button>
                                     <button 
                                        onClick={() => setExportConfig(p => ({...p, resolution: '4K'}))}
                                        className={`px-2 py-1 ${exportConfig.resolution === '4K' ? 'bg-[#39c5bb] text-black' : 'text-gray-400'}`}>
                                        4K (UHD)
                                     </button>
                                 </div>
                             </div>
                        </div>

                        {lyrics.length === 0 && (
                            <button 
                                onClick={() => file && generateLyrics(file)} 
                                disabled={isAnalyzing}
                                className="border border-dashed border-[#ff00ff] text-[#ff00ff] px-6 py-3 font-bold tracking-widest hover:bg-[#ff00ff]/10 transition-colors disabled:opacity-50">
                                {isAnalyzing ? "ANALYZING NEURAL DATA..." : "GENERATE AI LYRICS"}
                            </button>
                        )}

                        <div className="flex gap-4 mt-4">
                            <button onClick={() => initializeAudio('PLAY')} className="flex-1 bg-[#39c5bb] text-black px-6 py-4 font-bold tracking-widest hover:scale-105 transition-transform text-lg">
                                ENGAGE
                            </button>
                            <button onClick={() => initializeAudio('EXPORT')} className="flex-1 border border-[#ff00ff] text-[#ff00ff] px-6 py-4 font-bold tracking-widest hover:bg-[#ff00ff] hover:text-white transition-colors">
                                RENDER VIDEO
                            </button>
                        </div>
                    </div>
                )}
            </div>
         )}
         
         {isExporting && (
             <div className="absolute top-4 right-4 flex flex-col items-end gap-1">
                 <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-600 rounded-full animate-pulse shadow-[0_0_20px_red]" />
                    <span className="text-red-500 font-bold tracking-widest text-lg">REC // {exportConfig.resolution}</span>
                 </div>
                 <span className="text-xs text-gray-400">DO NOT CLOSE TAB</span>
             </div>
         )}
         
         {isPlaying && !isExporting && (
             <button onClick={stopVisualization} className="absolute bottom-8 pointer-events-auto border border-gray-700 bg-black/50 text-gray-500 hover:text-white px-6 py-2 text-xs tracking-widest backdrop-blur">
                 TERMINATE
             </button>
         )}
      </div>
    </div>
  );
};

export default Visualizer;