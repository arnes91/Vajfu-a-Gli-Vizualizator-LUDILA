import React, { useEffect, useRef, useState, useCallback } from 'react';

// --- Constants ---
const THEME = {
  primary: '#39c5bb',   // Miku Teal
  secondary: '#ff00ff', // Glitch Pink
  background: '#050505',
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
    
    float vortex_anim = uTime * 0.5 + uBass * 2.0;
    float tunnel = sin(10.0 * radius - iTime * 3.0 + uBass * 4.0) * 0.3;
    
    // Twist based on bass
    float spiral = angle + 1.0 / (radius + 0.1) * sin(uTime) + uBass;
    
    vec3 col = mix(color_bg, color_teal, smoothstep(0.2, 1.2, radius + tunnel));

    // 2. Matrix / Digital Rain (Vertical Noise)
    if(uv.x < 0.8 && uv.x > -0.8) {
        float rain_speed = uTime * 2.0 + uMid * 5.0;
        float rain = fract(uv.y * 10.0 + rain_speed + sin(uv.x * 20.0));
        float rain_glow = smoothstep(0.9, 1.0, rain) * (0.3 + uHigh);
        col += color_green * rain_glow * 0.5;
    }

    // 3. Shockwaves (Rings)
    float shock = exp(-10.0 * abs(radius - 0.5 - uBass * 0.5));
    col += color_pink * shock * uBass;

    // 4. Glitch Blocks
    float block = step(0.9, fract(uv.x * 10.0 + uTime)) * step(0.9, fract(uv.y * 10.0 - uTime));
    col += vec3(1.0) * block * uHigh * 0.5;

    // Vignette
    col *= 1.0 - 0.5 * radius;

    gl_FragColor = vec4(col, 1.0);
  }
`.replace(/iTime/g, 'uTime'); // Ensure naming consistency if snippet used iTime

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

const Visualizer: React.FC = () => {
  // --- Refs ---
  const canvasRef = useRef<HTMLCanvasElement>(null);      // 2D Composition Layer
  const glCanvasRef = useRef<HTMLCanvasElement>(null);    // WebGL Background Layer
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Audio
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const animationFrameRef = useRef<number>(0);

  // WebGL
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const uniformLocsRef = useRef<any>({});

  // Particles
  const particlesRef = useRef<Particle[]>([]);

  // Recording
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // State
  const [file, setFile] = useState<File | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [status, setStatus] = useState<string>("SYSTEM READY");

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
  };

  // --- Resize ---
  const handleResize = useCallback(() => {
    if (containerRef.current && canvasRef.current && glCanvasRef.current) {
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      
      canvasRef.current.width = w;
      canvasRef.current.height = h;
      
      glCanvasRef.current.width = w;
      glCanvasRef.current.height = h;

      if (glRef.current) glRef.current.viewport(0, 0, w, h);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    handleResize();
    // Initialize WebGL context early
    initWebGL();
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize, initWebGL]);

  // --- CORE RENDER LOOP ---
  const renderFrame = useCallback(() => {
    const canvas = canvasRef.current;
    const glCanvas = glCanvasRef.current;
    const gl = glRef.current;
    const analyser = analyserRef.current;

    if (!canvas || !glCanvas || !gl || !analyser) return;

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
    // Lower freq range for bass
    for(let i=0; i<10; i++) bass += dataArray[i];
    for(let i=10; i<100; i++) mid += dataArray[i];
    for(let i=100; i<bufferLength; i++) high += dataArray[i];

    bass = bass / 10 / 255; // 0.0 - 1.0
    mid = mid / 90 / 255;
    high = high / (bufferLength - 100) / 255;

    const isBassHit = bass > 0.7; // Hard hit threshold

    // 2. Render WebGL Background
    const locs = uniformLocsRef.current;
    gl.uniform1f(locs.uTime, time);
    gl.uniform2f(locs.uResolution, w, h);
    gl.uniform1f(locs.uBass, bass);
    gl.uniform1f(locs.uMid, mid);
    gl.uniform1f(locs.uHigh, high);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    // 3. Composite WebGL -> 2D Canvas
    // We draw the WebGL output as the background image
    ctx.drawImage(glCanvas, 0, 0);

    // 4. Update & Draw Particles (Debris)
    if (isBassHit) {
        // Spawn particles
        const count = Math.floor(bass * 5);
        for(let k=0; k<count; k++) {
            particlesRef.current.push({
                x: Math.random() * w,
                y: Math.random() * h,
                w: Math.random() * 5 + 2,
                h: Math.random() * 20 + 2, // Elongated debris
                vx: (Math.random() - 0.5) * 20,
                vy: (Math.random() - 0.5) * 20,
                life: 1.0,
                color: Math.random() > 0.5 ? THEME.primary : THEME.secondary
            });
        }
    }

    // Process particles
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

    // 5. Draw Spectrum with "Web" Effect
    const radius = Math.min(w, h) * 0.2 + (bass * 50);
    ctx.lineWidth = 2;
    ctx.strokeStyle = THEME.primary;
    ctx.beginPath();
    
    const sliceCount = 120; // Reduced for style
    const step = (Math.PI * 2) / sliceCount;

    for(let i=0; i<sliceCount; i++) {
        const freqIdx = Math.floor((i / sliceCount) * (bufferLength / 2));
        const val = dataArray[freqIdx] / 255;
        const barH = val * 100 * (1 + bass);

        const angle = i * step + (isBassHit ? (Math.random()-0.5)*0.1 : 0);
        
        const x1 = cx + Math.cos(angle) * radius;
        const y1 = cy + Math.sin(angle) * radius;
        const x2 = cx + Math.cos(angle) * (radius + barH);
        const y2 = cy + Math.sin(angle) * (radius + barH);

        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);

        // "Web" Connection Effect: Connect loud bars to center
        if (bass > 0.8 && val > 0.6 && i % 8 === 0) {
            ctx.moveTo(x2, y2);
            ctx.lineTo(cx, cy); // Lightning bolt to center
        }
    }
    ctx.stroke();

    // 6. Glitch Text (MIKU VAJFUŠA)
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    let fontSize = Math.min(w, h) * 0.08;
    
    if (isBassHit) {
        // Skew & shake transform
        const skew = (Math.random() - 0.5);
        const shakeX = (Math.random() - 0.5) * 20;
        const shakeY = (Math.random() - 0.5) * 20;
        ctx.translate(cx + shakeX, cy + shakeY);
        ctx.transform(1, skew, 0, 1, 0, 0);
        
        // Chromatic Aberration Text
        ctx.font = `900 ${fontSize}px monospace`;
        ctx.fillStyle = '#ff0000';
        ctx.fillText("MIKU", -5, -40);
        ctx.fillStyle = '#00ffff';
        ctx.fillText("MIKU", 5, -40);
        
        ctx.fillStyle = '#ff00ff';
        ctx.fillText("VAJFUŠA", 0, 40);
    } else {
        ctx.translate(cx, cy);
        ctx.font = `900 ${fontSize}px monospace`;
        ctx.fillStyle = THEME.primary;
        ctx.shadowBlur = 10;
        ctx.shadowColor = THEME.primary;
        ctx.fillText("MIKU", 0, -40);
        ctx.fillStyle = '#fff';
        ctx.fillText("VAJFUŠA", 0, 40);
    }
    ctx.restore();

    // 7. Scanlines Overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    for (let y = 0; y < h; y += 4) {
        ctx.fillRect(0, y, w, 1);
    }

    animationFrameRef.current = requestAnimationFrame(renderFrame);
  }, []);

  // --- Audio Init ---
  const initializeAudio = async (mode: 'PLAY' | 'EXPORT') => {
    if (!file) return;
    stopVisualization();
    initWebGL(); // Ensure GL is ready

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
                // Capture the 2D canvas (which has the WebGL composition)
                const stream = canvasRef.current.captureStream(60);
                const track = dest.stream.getAudioTracks()[0];
                stream.addTrack(track);

                const types = ['video/mp4', 'video/webm;codecs=vp9', 'video/webm'];
                const mime = types.find(t => MediaRecorder.isTypeSupported(t)) || '';

                if (!mime) { alert("No rec support"); return; }

                const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 8000000 });
                mediaRecorderRef.current = rec;
                recordedChunksRef.current = [];
                
                rec.ondataavailable = e => { if(e.data.size>0) recordedChunksRef.current.push(e.data); };
                rec.onstop = () => {
                    const blob = new Blob(recordedChunksRef.current, {type: mime});
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `glitch_core_${Date.now()}.${mime.includes('mp4')?'mp4':'webm'}`;
                    a.click();
                    setIsExporting(false);
                    setStatus("EXPORT_DONE");
                };
                rec.start();
                setStatus("RECORDING...");
            }
        } else {
            setStatus("VISUAL_CORE_ONLINE");
        }

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
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  return (
    <div ref={containerRef} className="relative w-full h-full bg-black overflow-hidden select-none font-mono text-white">
      {/* Hidden WebGL Layer */}
      <canvas ref={glCanvasRef} className="absolute inset-0 w-full h-full invisible pointer-events-none" />
      
      {/* Visible Composition Layer */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-10">
         <div className="absolute top-4 left-4 text-[#39c5bb] text-xs border-l-2 border-[#39c5bb] pl-2">
            <p>STATUS: {status}</p>
            <p>ENGINE: HYBRID WEBGL+2D</p>
         </div>

         {!isPlaying && (
            <div className="pointer-events-auto bg-black/90 border border-[#39c5bb] p-10 text-center shadow-[0_0_50px_rgba(57,197,187,0.2)]">
                <h1 className="text-5xl font-bold mb-2 tracking-tighter text-white" style={{textShadow: '3px 3px #ff00ff'}}>
                    MIKU PROTOCOL
                </h1>
                <p className="text-[#39c5bb] tracking-[0.5em] text-sm mb-8">V.9.0 HYBRID CORE</p>
                
                <input type="file" ref={fileInputRef} onChange={handleFile} accept="audio/*" className="hidden" />
                
                {!file ? (
                    <button onClick={() => fileInputRef.current?.click()} className="border border-[#39c5bb] px-8 py-3 hover:bg-[#39c5bb] hover:text-black transition-colors font-bold tracking-widest text-[#39c5bb]">
                        INITIALIZE FILE
                    </button>
                ) : (
                    <div className="flex gap-4 justify-center">
                        <button onClick={() => initializeAudio('PLAY')} className="bg-[#39c5bb] text-black px-6 py-3 font-bold tracking-widest hover:scale-105 transition-transform">
                            ENGAGE
                        </button>
                        <button onClick={() => initializeAudio('EXPORT')} className="border border-[#ff00ff] text-[#ff00ff] px-6 py-3 font-bold tracking-widest hover:bg-[#ff00ff] hover:text-white transition-colors">
                            RENDER MP4
                        </button>
                    </div>
                )}
            </div>
         )}
         
         {isExporting && (
             <div className="absolute top-4 right-4 flex items-center gap-2">
                 <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
                 <span className="text-red-500 font-bold tracking-widest text-xs">REC</span>
             </div>
         )}
         
         {isPlaying && !isExporting && (
             <button onClick={stopVisualization} className="absolute bottom-8 pointer-events-auto border border-gray-700 bg-black/50 text-gray-500 hover:text-white px-6 py-2 text-xs tracking-widest">
                 TERMINATE
             </button>
         )}
      </div>
    </div>
  );
};

export default Visualizer;
