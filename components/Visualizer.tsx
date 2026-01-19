import React, { useEffect, useRef, useState, useCallback } from 'react';

// --- Configuration & Constants ---
const THEME = {
  primary: '#39c5bb',   // Miku Teal
  secondary: '#ff00ff', // Glitch Pink
  tertiary: '#f0f',     // Neon Magenta
  background: '#050505',
};

// Helper to check supported mime types for recording
const getSupportedMimeType = () => {
  const types = [
    'video/mp4',
    'video/webm;codecs=h264',
    'video/webm;codecs=vp9',
    'video/webm',
  ];
  return types.find(type => MediaRecorder.isTypeSupported(type)) || '';
};

const Visualizer: React.FC = () => {
  // --- Refs ---
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Audio Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const animationFrameRef = useRef<number>(0);

  // Recording Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // --- State ---
  const [file, setFile] = useState<File | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [status, setStatus] = useState<string>("SYSTEM READY");

  // --- Cleanup ---
  useEffect(() => {
    return () => {
      stopVisualization();
    };
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

  // --- Resize Handler ---
  const handleResize = useCallback(() => {
    if (canvasRef.current && containerRef.current) {
      canvasRef.current.width = containerRef.current.clientWidth;
      canvasRef.current.height = containerRef.current.clientHeight;
    }
  }, []);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  // --- Render Loop ( The Core Visuals ) ---
  const renderFrame = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext('2d', { alpha: false }); // Optimize for no transparency
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;

    // Get Data
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    // Calculate Metrics
    let bassTotal = 0;
    let midTotal = 0;
    let highTotal = 0;
    
    for (let i = 0; i < bufferLength; i++) {
        if (i < 10) bassTotal += dataArray[i];
        else if (i < 100) midTotal += dataArray[i];
        else highTotal += dataArray[i];
    }
    
    const bassAvg = bassTotal / 10;
    const bassNorm = bassAvg / 255;
    const isBassHit = bassAvg > 200;
    const isGlitchFrame = Math.random() < (bassNorm * 0.3);

    // 1. Trails / Fade Effect
    // Use 'destination-out' or fillRect with opacity to create trails
    ctx.fillStyle = `rgba(0, 0, 0, ${isBassHit ? 0.3 : 0.15})`;
    ctx.fillRect(0, 0, w, h);

    // --- Shake Effect on Bass ---
    ctx.save();
    if (isBassHit) {
        const shake = (bassNorm * 20) * (Math.random() - 0.5);
        ctx.translate(shake, shake);
    }

    // 2. Central Pulse / Geometry
    const radius = 100 + (bassAvg * 0.5);
    
    // Draw Concentric glitch circles
    if (bassAvg > 100) {
        ctx.lineWidth = 2;
        ctx.strokeStyle = `rgba(57, 197, 187, ${bassNorm * 0.5})`; // Teal
        ctx.beginPath();
        ctx.arc(cx, cy, radius * 1.5, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.strokeStyle = `rgba(255, 0, 255, ${bassNorm * 0.3})`; // Pink
        ctx.beginPath();
        ctx.arc(cx, cy, radius * 2.0 + (Math.random() * 20), 0, Math.PI * 2);
        ctx.stroke();
    }

    // 3. Frequency Spectrum (Circular & Mirrored)
    // RGB Split Effect for the spectrum
    const drawSpectrum = (color: string, offset: number) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        const slices = 180;
        const step = (Math.PI * 2) / slices;

        for (let i = 0; i < slices; i++) {
            // Map circle index to frequency index (logarithmic-ish)
            const freqIndex = Math.floor((i / slices) * (bufferLength / 2));
            const value = dataArray[freqIndex];
            const barHeight = value * (0.8 + bassNorm);
            
            const r = radius + offset;
            const angle = i * step;
            
            // Modulation for "spiky" look
            const mod = isBassHit && i % 2 === 0 ? 1.5 : 1.0;
            
            const x1 = cx + Math.cos(angle) * r;
            const y1 = cy + Math.sin(angle) * r;
            const x2 = cx + Math.cos(angle) * (r + barHeight * mod);
            const y2 = cy + Math.sin(angle) * (r + barHeight * mod);

            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
        }
        ctx.stroke();
    };

    // Draw RGB layers slightly offset
    if (isBassHit) {
        ctx.globalCompositeOperation = 'screen';
        drawSpectrum('#ff0000', 5); // Red
        drawSpectrum('#00ff00', 0); // Green
        drawSpectrum('#0000ff', -5); // Blue
        ctx.globalCompositeOperation = 'source-over';
    } else {
        drawSpectrum(THEME.primary, 0);
    }

    // 4. Center Text (MIKU VAJFUŠA)
    // We draw this on canvas so it gets recorded
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Glitch Text Parameters
    const textBaseSize = Math.min(w, h) * 0.1;
    let fontSize = textBaseSize;
    let textX = cx;
    let textY = cy;
    let textBlur = 0;

    if (isBassHit) {
        fontSize += Math.random() * 10;
        textX += (Math.random() - 0.5) * 10;
        textY += (Math.random() - 0.5) * 10;
        textBlur = 4;
    }

    const drawGlitchText = (text: string, x: number, y: number, color: string) => {
        ctx.font = `900 ${fontSize}px monospace`;
        ctx.fillStyle = color;
        if (textBlur > 0) ctx.shadowBlur = textBlur;
        ctx.shadowColor = color;
        ctx.fillText(text, x, y);
        ctx.shadowBlur = 0; // Reset
    };

    // RGB Text Split
    if (isBassHit) {
        ctx.globalCompositeOperation = 'lighten';
        drawGlitchText("MIKU", textX - 5, textY - 40, '#ff0000');
        drawGlitchText("MIKU", textX + 5, textY - 40, '#00ffff');
        
        drawGlitchText("VAJFUŠA", textX, textY + 40, '#ffffff'); // Anchor
        ctx.globalCompositeOperation = 'source-over';
    } else {
        drawGlitchText("MIKU", textX, textY - 40, THEME.primary);
        drawGlitchText("VAJFUŠA", textX, textY + 40, '#ffffff');
    }

    // 5. Digital Rain / Glitch Blocks
    if (bassNorm > 0.4) {
        const blockCount = Math.floor(bassNorm * 10);
        for (let i = 0; i < blockCount; i++) {
            const bx = Math.random() * w;
            const by = Math.random() * h;
            const bw = Math.random() * 100;
            const bh = 2 + Math.random() * 20;
            
            ctx.fillStyle = Math.random() > 0.5 ? THEME.primary : THEME.secondary;
            ctx.fillRect(bx, by, bw, bh);
        }
    }

    // 6. Scanlines
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    for (let y = 0; y < h; y += 4) {
        ctx.fillRect(0, y, w, 1);
    }

    // 7. Vignette / Frame
    const gradient = ctx.createRadialGradient(cx, cy, radius, cx, cy, Math.max(w, h));
    gradient.addColorStop(0, 'transparent');
    gradient.addColorStop(0.8, 'rgba(0,0,0,0.4)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.9)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    ctx.restore(); // Restore shake transform

    // Loop
    animationFrameRef.current = requestAnimationFrame(renderFrame);
  }, []);

  // --- Core Audio Logic ---
  const initializeAudio = async (mode: 'PLAY' | 'EXPORT') => {
    if (!file) return;
    
    // Stop previous
    stopVisualization();

    // Init Context
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContextClass();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.85;

    // Decode Audio
    setStatus("DECODING_AUDIO_DATA...");
    try {
        const arrayBuffer = await file.arrayBuffer();
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
        
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        
        // Routing
        // 1. Source -> Analyser
        source.connect(analyser);
        
        // 2. Analyser -> Destination (Speakers)
        // If exporting, we might still want to hear it, or we can mute. Let's keep it audible.
        analyser.connect(ctx.destination);

        // --- Export Specific Logic ---
        if (mode === 'EXPORT') {
            setIsExporting(true);
            setStatus("INITIALIZING_RECORDER...");

            // Create a MediaStreamDestination for clean audio capture
            const dest = ctx.createMediaStreamDestination();
            source.connect(dest);
            
            // Capture Canvas Stream
            if (canvasRef.current) {
                // 60 FPS capture
                const canvasStream = canvasRef.current.captureStream(60);
                
                // Add Audio Track
                const audioTrack = dest.stream.getAudioTracks()[0];
                canvasStream.addTrack(audioTrack);

                const mimeType = getSupportedMimeType();
                if (!mimeType) {
                    alert("MediaRecorder not supported or no valid mimeTypes found.");
                    return;
                }

                // Setup Recorder
                const recorder = new MediaRecorder(canvasStream, {
                    mimeType: mimeType,
                    videoBitsPerSecond: 8000000 // 8 Mbps high quality
                });

                mediaRecorderRef.current = recorder;
                recordedChunksRef.current = [];

                recorder.ondataavailable = (e) => {
                    if (e.data.size > 0) recordedChunksRef.current.push(e.data);
                };

                recorder.onstop = () => {
                    finalizeExport(mimeType);
                };

                recorder.start();
                setStatus(`RECORDING_ACTIVE [${mimeType}]`);
            }
        } else {
            setStatus("VISUAL_CORE_ACTIVE");
        }

        // Start Playback
        source.start(0);
        
        // State updates
        audioContextRef.current = ctx;
        analyserRef.current = analyser;
        sourceRef.current = source;
        setIsPlaying(true);

        // Start Loop
        renderFrame();

        // End Handler
        source.onended = () => {
            if (mode === 'EXPORT' && mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                mediaRecorderRef.current.stop();
            }
            setIsPlaying(false);
            setStatus("PROTOCOL_ENDED");
        };

    } catch (err) {
        console.error(err);
        setStatus("ERROR_CORRUPT_DATA");
    }
  };

  const finalizeExport = (mimeType: string) => {
    setStatus("SAVING_ARTIFACT...");
    const blob = new Blob(recordedChunksRef.current, { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    // Auto download
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    
    const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
    a.download = `glitch_core_export_${Date.now()}.${ext}`;
    
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        setIsExporting(false);
        setStatus("EXPORT_COMPLETE");
    }, 100);
  };

  // --- Handlers ---
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        setFile(e.target.files[0]);
        setStatus("FILE_LOADED: AWAITING_COMMAND");
    }
  };

  const triggerFileSelect = () => fileInputRef.current?.click();

  return (
    <div ref={containerRef} className="relative w-full h-full bg-black font-mono overflow-hidden select-none">
      
      {/* 1. Canvas Layer */}
      <canvas ref={canvasRef} className="block w-full h-full object-cover" />

      {/* 2. UI Overlay Layer */}
      <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-20">
        
        {/* Status Header */}
        <div className="absolute top-4 left-4 text-[#39c5bb] text-xs md:text-sm tracking-widest border-l-2 border-[#39c5bb] pl-2 opacity-80">
            <p>STATUS: {status}</p>
            <p>FPS: 60 // CORE: ONLINE</p>
        </div>

        {/* Start / Menu Screen */}
        {!isPlaying && (
            <div className="pointer-events-auto bg-black/90 border border-[#39c5bb] p-8 md:p-12 text-center shadow-[0_0_30px_rgba(57,197,187,0.3)] backdrop-blur-md max-w-lg w-full mx-4">
                
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tighter" style={{ textShadow: '2px 2px #ff00ff' }}>
                    MIKU PROTOCOL
                </h1>
                <p className="text-[#39c5bb] text-sm tracking-[0.3em] mb-8">AUDIO VISUALIZER SYSTEM</p>

                {/* File Selection */}
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileSelect} 
                    accept="audio/*" 
                    className="hidden" 
                />
                
                {!file ? (
                    <button 
                        onClick={triggerFileSelect}
                        className="group relative px-8 py-4 bg-transparent border border-[#39c5bb] text-[#39c5bb] 
                                   hover:bg-[#39c5bb] hover:text-black transition-all duration-200 w-full"
                    >
                        <span className="relative z-10 font-bold tracking-widest">LOAD AUDIO FILE</span>
                    </button>
                ) : (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="text-gray-400 text-xs uppercase tracking-widest mb-4 border-b border-gray-800 pb-2">
                            TARGET: {file.name.substring(0, 30)}...
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <button 
                                onClick={() => initializeAudio('PLAY')}
                                className="px-6 py-3 bg-[#39c5bb]/10 border border-[#39c5bb] text-[#39c5bb] 
                                           hover:bg-[#39c5bb] hover:text-black transition-all duration-200 font-bold text-sm tracking-widest"
                            >
                                VISUALIZE
                            </button>
                            <button 
                                onClick={() => initializeAudio('EXPORT')}
                                className="px-6 py-3 bg-[#ff00ff]/10 border border-[#ff00ff] text-[#ff00ff] 
                                           hover:bg-[#ff00ff] hover:text-black transition-all duration-200 font-bold text-sm tracking-widest"
                            >
                                EXPORT MP4
                            </button>
                        </div>
                        <button 
                            onClick={() => { setFile(null); setStatus("SYSTEM READY"); }}
                            className="text-xs text-gray-500 hover:text-white mt-4 underline decoration-dotted"
                        >
                            [RESET SELECTION]
                        </button>
                    </div>
                )}
            </div>
        )}

        {/* Recording Indicator */}
        {isExporting && (
            <div className="absolute top-4 right-4 flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <span className="text-red-500 font-bold text-xs tracking-widest">REC</span>
            </div>
        )}

        {/* Playback Controls (Corner) */}
        {isPlaying && !isExporting && (
            <div className="absolute bottom-8 flex gap-4 pointer-events-auto">
                 <button 
                    onClick={stopVisualization}
                    className="px-6 py-2 bg-black/50 border border-gray-600 text-gray-400 hover:text-white hover:border-white text-xs tracking-widest transition-all"
                >
                    ABORT
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default Visualizer;