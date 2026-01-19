import React from 'react';
import Visualizer from './components/Visualizer';

const App: React.FC = () => {
  return (
    <div className="w-full h-screen bg-black text-white font-mono overflow-hidden">
      <Visualizer />
    </div>
  );
};

export default App;