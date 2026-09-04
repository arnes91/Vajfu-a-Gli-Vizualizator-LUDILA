// Custom Hook: useEvolutionVoiceAnnounce
// Triggers the Gemini voice-synthesis engine to audibly announce the Evolution Report telemetry summary
// whenever an evolution cycle completes, routing voice harmonics directly to the visualizer canvas.

import { useCallback, useRef, useState } from 'react';
import { EvolutionReport } from '../types';
import { AIDJVoiceEngine } from './AIDJVoiceEngine';
import { GoogleGenAI } from '@google/genai';

interface UseEvolutionVoiceAnnounceProps {
  voiceEngineRef: React.MutableRefObject<AIDJVoiceEngine>;
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
}

export function useEvolutionVoiceAnnounce({
  voiceEngineRef,
  onSpeechStart,
  onSpeechEnd,
}: UseEvolutionVoiceAnnounceProps) {
  const [isAnnouncing, setIsAnnouncing] = useState(false);
  const [lastAnnouncement, setLastAnnouncement] = useState<string>('');
  const isCanceledRef = useRef(false);

  const announceEvolutionReport = useCallback(
    async (report: EvolutionReport, fallbackSummary?: string) => {
      setIsAnnouncing(true);
      isCanceledRef.current = false;

      let announcementText = fallbackSummary || report.telemetrySummary;

      // Check if Gemini API is available to generate a custom energetic voice report
      const apiKey = process.env.API_KEY;
      if (apiKey) {
        try {
          const ai = new GoogleGenAI({ apiKey });
          const prompt = `
You are the cybernetic AI System Voice of BRZI_STUDIO.
An Autonomous Evolution Cycle has just completed with the following telemetry:
- Version: ${report.version}
- Cross-Module Sync Score: ${report.crossModuleSyncScore}%
- Hydrated Memory Nodes: ${report.memoryNodes}
- Summary: ${report.telemetrySummary}

Generate a sharp, high-tech, confident spoken telemetry announcement (2 to 3 punchy sentences max).
Include: cycle completion, memory node status, sync score, and sovereign alignment confirmation.
Tone: futuristic, authoritative, cyberpunk, clear.
Output plain text only without quotes or asterisks.
`;
          const res = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
          });

          if (res.text?.trim() && !isCanceledRef.current) {
            announcementText = res.text.trim();
          }
        } catch (e) {
          console.warn('Gemini voice prompt fallback to standard telemetry summary:', e);
        }
      }

      setLastAnnouncement(announcementText);

      if (voiceEngineRef.current) {
        await voiceEngineRef.current.speakText(
          announcementText,
          () => {
            setIsAnnouncing(true);
            onSpeechStart?.();
          },
          () => {
            setIsAnnouncing(false);
            onSpeechEnd?.();
          }
        );
      } else {
        setIsAnnouncing(false);
        onSpeechEnd?.();
      }
    },
    [voiceEngineRef, onSpeechStart, onSpeechEnd]
  );

  const cancelAnnouncement = useCallback(() => {
    isCanceledRef.current = true;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsAnnouncing(false);
    onSpeechEnd?.();
  }, [onSpeechEnd]);

  return {
    isAnnouncing,
    lastAnnouncement,
    announceEvolutionReport,
    cancelAnnouncement,
  };
}
