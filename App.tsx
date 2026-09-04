import React, { useState, useRef, useEffect, useCallback } from 'react';
import Visualizer from './components/Visualizer';
import { PersistentHUD } from './components/PersistentHUD';
import { SidebarNavigation, AppTab } from './components/SidebarNavigation';
import { KnowledgeGraphPanel } from './components/KnowledgeGraphPanel';
import { TelemetryDrawer } from './components/TelemetryDrawer';
import { DeveloperDiagnostics, DiagnosticStats } from './components/DeveloperDiagnostics';
import { EvolutionEngine } from './components/EvolutionEngine';
import { WebMidiController } from './components/WebMidiController';
import { EvolutionReport } from './types';

const App: React.FC = () => {
  // Shared Singleton Engines
  const evolutionEngineRef = useRef<EvolutionEngine>(new EvolutionEngine());
  const midiControllerRef = useRef<WebMidiController>(new WebMidiController());

  // Navigation & Drawer States
  const [activeTab, setActiveTab] = useState<AppTab>('VISUALIZER');
  const [isKnowledgeGraphOpen, setIsKnowledgeGraphOpen] = useState<boolean>(false);
  const [isTelemetryDrawerOpen, setIsTelemetryDrawerOpen] = useState<boolean>(false);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState<boolean>(false);

  // Evolution State
  const [evolutionReport, setEvolutionReport] = useState<EvolutionReport>(() =>
    evolutionEngineRef.current.getReport()
  );
  const [isEvolving, setIsEvolving] = useState<boolean>(false);
  const [isAISpeaking, setIsAISpeaking] = useState<boolean>(false);

  // MIDI Hardware Status State
  const [midiConnected, setMidiConnected] = useState<boolean>(false);
  const [midiDeviceName, setMidiDeviceName] = useState<string>('Standby');

  // Real-time Diagnostic Performance Stats (from requestAnimationFrame)
  const [diagnosticStats, setDiagnosticStats] = useState<DiagnosticStats>({
    fps: 60,
    frameTimeMs: 16.6,
    audioSampleRate: 48000,
    audioState: 'running',
    audioLatencyMs: 8.5,
    jsHeapUsedMB: undefined,
    jsHeapTotalMB: undefined,
    activeParticles: 40,
    canvasResolution: '1920x1080',
    glslShaderMode: 'ORGANIC_CONTOUR',
  });

  // Run Evolution Cycle Automation Handler
  const handleRunEvolutionCycle = useCallback(() => {
    setIsEvolving(true);
    const { report } = evolutionEngineRef.current.runEvolutionCycle();
    setEvolutionReport(report);
    setTimeout(() => {
      setIsEvolving(false);
    }, 1200);
  }, []);

  // Keyboard shortcuts (F2 / Backquote for Dev Diagnostics)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle Diagnostics on backtick ` or F2
      if (e.key === '`' || e.key === 'F2') {
        setIsDiagnosticsOpen((prev) => !prev);
      }
      // Toggle Telemetry Drawer with Alt+T
      if (e.altKey && (e.key === 't' || e.key === 'T')) {
        setIsTelemetryDrawerOpen((prev) => !prev);
      }
      // Toggle Evolution Knowledge Graph with Alt+E
      if (e.altKey && (e.key === 'e' || e.key === 'E')) {
        setActiveTab((prev) => (prev === 'VISUALIZER' ? 'EVOLUTION' : 'VISUALIZER'));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="w-full h-screen bg-black text-white font-mono overflow-hidden flex flex-col select-none">
      {/* 1. Persistent HUD (Autonomous Evolution Engine metrics, MIDI, Quick Triggers) */}
      <PersistentHUD
        evolutionReport={evolutionReport}
        isEvolving={isEvolving}
        onRunEvolutionCycle={handleRunEvolutionCycle}
        onOpenKnowledgeGraph={() => {
          setActiveTab('EVOLUTION');
          setIsKnowledgeGraphOpen(true);
        }}
        onOpenTelemetryDrawer={() => setIsTelemetryDrawerOpen(true)}
        onToggleDiagnostics={() => setIsDiagnosticsOpen((prev) => !prev)}
        isDiagnosticsOpen={isDiagnosticsOpen}
        midiConnected={midiConnected}
        midiDeviceName={midiDeviceName}
        isAISpeaking={isAISpeaking}
      />

      {/* 2. Main Content Workspace: Sidebar + Visualizer / Evolution Tab */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Cyberpunk Sidebar Navigation */}
        <SidebarNavigation
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            if (tab === 'EVOLUTION') {
              setIsKnowledgeGraphOpen(true);
            }
          }}
          onOpenTelemetryDrawer={() => setIsTelemetryDrawerOpen(true)}
          onToggleDiagnostics={() => setIsDiagnosticsOpen((prev) => !prev)}
          isDiagnosticsOpen={isDiagnosticsOpen}
          midiConnected={midiConnected}
          memoryNodesCount={evolutionReport.memoryNodes}
          syncScore={evolutionReport.crossModuleSyncScore}
        />

        {/* Primary Viewport Area */}
        <main className="flex-1 relative overflow-hidden bg-black flex items-center justify-center">
          {/* Always mount Visualizer so audio graph and render loop remain uninterrupted */}
          <div className={`w-full h-full ${activeTab === 'VISUALIZER' ? 'block' : 'hidden'}`}>
            <Visualizer
              evolutionEngine={evolutionEngineRef.current}
              evolutionReport={evolutionReport}
              isEvolving={isEvolving}
              onRunEvolutionCycle={handleRunEvolutionCycle}
              midiController={midiControllerRef.current}
              midiConnected={midiConnected}
              midiDeviceName={midiDeviceName}
              onUpdateDiagnosticStats={setDiagnosticStats}
              onOpenKnowledgeGraph={() => {
                setActiveTab('EVOLUTION');
                setIsKnowledgeGraphOpen(true);
              }}
              onOpenTelemetryDrawer={() => setIsTelemetryDrawerOpen(true)}
              isDiagnosticsOpen={isDiagnosticsOpen}
              onToggleDiagnostics={() => setIsDiagnosticsOpen((prev) => !prev)}
              isAISpeaking={isAISpeaking}
              onAISpeakingChange={setIsAISpeaking}
            />
          </div>

          {/* Evolution Knowledge Graph Dedicated Full Tab View */}
          {activeTab === 'EVOLUTION' && (
            <div className="absolute inset-0 bg-[#05060b] z-20 flex flex-col">
              <KnowledgeGraphPanel
                isOpen={true}
                onClose={() => setActiveTab('VISUALIZER')}
                evolutionReport={evolutionReport}
                onRunEvolutionCycle={handleRunEvolutionCycle}
                isEvolving={isEvolving}
                evolutionEngine={evolutionEngineRef.current}
              />
            </div>
          )}
        </main>
      </div>

      {/* 3. Dedicated Knowledge Graph Modal (when opened from HUD while on Visualizer tab) */}
      {isKnowledgeGraphOpen && activeTab !== 'EVOLUTION' && (
        <div className="absolute inset-0 bg-black/85 flex items-center justify-center z-50 p-4 backdrop-blur-md">
          <div className="w-full max-w-5xl h-[85vh] bg-[#07080f] border-2 border-[#00ff66] shadow-[0_0_80px_rgba(0,255,102,0.25)] relative overflow-hidden flex flex-col">
            <KnowledgeGraphPanel
              isOpen={true}
              onClose={() => setIsKnowledgeGraphOpen(false)}
              evolutionReport={evolutionReport}
              onRunEvolutionCycle={handleRunEvolutionCycle}
              isEvolving={isEvolving}
              evolutionEngine={evolutionEngineRef.current}
            />
          </div>
        </div>
      )}

      {/* 4. Slide-Out Telemetry Drawer */}
      <TelemetryDrawer
        isOpen={isTelemetryDrawerOpen}
        onClose={() => setIsTelemetryDrawerOpen(false)}
        evolutionReport={evolutionReport}
        adaptations={evolutionEngineRef.current.getAppliedAdaptations()}
        onRunEvolutionCycle={handleRunEvolutionCycle}
        isEvolving={isEvolving}
      />

      {/* 5. Developer Diagnostics Performance & Web MIDI Overlay */}
      <DeveloperDiagnostics
        isOpen={isDiagnosticsOpen}
        onClose={() => setIsDiagnosticsOpen(false)}
        stats={diagnosticStats}
        midiController={midiControllerRef.current}
        onTriggerMidiNote={(note, vel) => midiControllerRef.current.triggerVirtualNote(note, vel)}
        onTriggerMidiCC={(cc, val) => midiControllerRef.current.triggerVirtualCC(cc, val)}
      />
    </div>
  );
};

export default App;