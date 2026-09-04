import React, { useEffect, useRef } from 'react';
import { ThemeColors } from '../types';

interface FrequencyBarsProps {
  analyser: AnalyserNode | null;
  theme: ThemeColors;
  sensitivity: number;
}

export const FrequencyBars: React.FC<FrequencyBarsProps> = ({
  analyser,
  theme,
  sensitivity,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const peaksRef = useRef<number[]>([]);
  const reqIdRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const barCount = 36;
    if (peaksRef.current.length !== barCount) {
      peaksRef.current = new Array(barCount).fill(0);
    }

    const render = () => {
      reqIdRef.current = requestAnimationFrame(render);
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      if (!analyser) return;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(dataArray);

      // Gradient fill based on active theme
      const grad = ctx.createLinearGradient(0, h, 0, 0);
      grad.addColorStop(0, theme.spectrumGradient[0]);
      grad.addColorStop(0.5, theme.spectrumGradient[1]);
      grad.addColorStop(1, theme.spectrumGradient[2]);

      const barWidth = Math.max(2, (w / barCount) - 2);
      const step = Math.floor((bufferLength * 0.7) / barCount);

      for (let i = 0; i < barCount; i++) {
        const binIndex = i * step;
        const rawVal = dataArray[binIndex] || 0;
        const normalized = Math.min(1.0, (rawVal / 255) * sensitivity);
        const barHeight = Math.max(2, normalized * (h - 6));

        const x = i * (barWidth + 2);
        const y = h - barHeight;

        // Draw bar
        ctx.fillStyle = grad;
        ctx.fillRect(x, y, barWidth, barHeight);

        // Peak hold decay
        if (barHeight >= peaksRef.current[i]) {
          peaksRef.current[i] = barHeight;
        } else {
          peaksRef.current[i] = Math.max(0, peaksRef.current[i] - 1.2);
        }

        // Draw peak cap
        const peakY = h - peaksRef.current[i] - 2;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x, peakY, barWidth, 1.5);
      }
    };

    reqIdRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(reqIdRef.current);
    };
  }, [analyser, theme, sensitivity]);

  return (
    <canvas
      ref={canvasRef}
      width={480}
      height={54}
      className="pointer-events-none w-full max-w-md h-12 block"
    />
  );
};
