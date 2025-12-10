import React, { useState } from 'react';
import { Scene } from './components/Scene';
import { TreeState } from './types';

const App = () => {
  const [treeState, setTreeState] = useState<TreeState>(TreeState.TREE_SHAPE);

  const toggleState = () => {
    setTreeState((prev) => 
      prev === TreeState.TREE_SHAPE ? TreeState.SCATTERED : TreeState.TREE_SHAPE
    );
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black font-sans selection:bg-emerald-500 selection:text-white">
      {/* 3D Scene Layer */}
      <Scene treeState={treeState} />

      {/* UI Overlay Layer */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none flex flex-col justify-between p-8 md:p-12 z-10">
        
        {/* Header */}
        <header className="flex justify-between items-start">
            <div className="pointer-events-auto">
                <h1 className="text-4xl md:text-6xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-600 drop-shadow-[0_0_15px_rgba(255,215,0,0.5)] tracking-tighter">
                    ARIX
                </h1>
                <p className="text-emerald-400 text-sm md:text-base tracking-[0.3em] uppercase mt-2 font-medium opacity-80">
                    Signature Collection
                </p>
            </div>
            
            <div className="hidden md:block text-right">
                <p className="text-yellow-100/50 text-xs tracking-widest uppercase border-b border-yellow-100/20 pb-1 mb-1">
                    Interactive Experience
                </p>
                <p className="text-emerald-500 font-mono text-xs">
                    V.24.12 // GLOW_MODE_ON
                </p>
            </div>
        </header>

        {/* Center Interaction Hint (Only if scattered) */}
        {treeState === TreeState.SCATTERED && (
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none opacity-60 mix-blend-screen">
                <p className="text-emerald-200 text-lg font-light italic tracking-wide animate-pulse">
                    "Chaos precedes form..."
                </p>
             </div>
        )}

        {/* Footer Controls */}
        <footer className="flex flex-col md:flex-row items-center justify-between gap-6 pointer-events-auto">
            <div className="order-2 md:order-1 flex gap-8 text-yellow-100/40 text-xs uppercase tracking-widest">
                <span>Three.js</span>
                <span>R3F</span>
                <span>WebGL</span>
            </div>

            <div className="order-1 md:order-2">
                <button 
                    onClick={toggleState}
                    className={`
                        group relative px-8 py-3 bg-black/40 backdrop-blur-md border border-yellow-500/30 
                        hover:border-yellow-400 hover:bg-emerald-900/30 transition-all duration-500 ease-out
                        overflow-hidden rounded-sm
                    `}
                >
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-yellow-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    
                    <span className="relative flex items-center gap-3 text-yellow-100 font-light tracking-[0.2em] text-sm group-hover:text-white transition-colors">
                        {treeState === TreeState.TREE_SHAPE ? 'SCATTER ESSENCE' : 'CONJURE FORM'}
                        <span className={`block w-1.5 h-1.5 rounded-full ${treeState === TreeState.TREE_SHAPE ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-yellow-500 shadow-[0_0_10px_#eab308]'} transition-colors duration-500`} />
                    </span>
                </button>
            </div>
        </footer>
      </div>
      
      {/* Decorative Frame Lines */}
      <div className="absolute inset-0 pointer-events-none border-[1px] border-yellow-500/10 m-4 rounded-sm" />
      <div className="absolute inset-0 pointer-events-none border-t border-b border-yellow-500/5 my-12 mx-0" />
    </div>
  );
};

export default App;
