
import React, { useState } from 'react';

interface MenuProps {
  onStart: () => void;
  onShowLeaderboard: () => void;
  gameOverData?: {
    score: number;
    commentary: string;
    isLoading: boolean;
  };
  onSaveScore?: (name: string) => void;
}

const Menu: React.FC<MenuProps> = ({ onStart, onShowLeaderboard, gameOverData, onSaveScore }) => {
  const [name, setName] = useState('');

  return (
    <div className="z-20 flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-500 max-w-sm w-full px-6">
      
      {gameOverData ? (
        // UI DE GAME OVER (Integrada en el inicio)
        <div className="text-center w-full space-y-6">
          <div className="space-y-1">
            <h2 className="text-6xl font-orbitron font-black text-red-500 italic tracking-tighter drop-shadow-lg">GAME OVER</h2>
            <p className="text-slate-400 font-orbitron tracking-[0.2em] uppercase text-xs">Carrera terminada</p>
          </div>

          <div className="py-4">
             <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Puntos Finales</p>
             <p className="text-8xl font-orbitron font-black text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">{gameOverData.score}</p>
          </div>

          <div className="p-5 bg-slate-800/80 backdrop-blur rounded-2xl border border-slate-700 italic text-slate-300 min-h-[80px] flex items-center justify-center leading-relaxed text-sm shadow-xl">
            {gameOverData.isLoading ? (
              <div className="flex gap-2">
                <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-bounce" />
                <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-bounce [animation-delay:-.15s]" />
                <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-bounce [animation-delay:-.3s]" />
              </div>
            ) : (
              `"${gameOverData.commentary}"`
            )}
          </div>

          <div className="space-y-3">
            <input 
              type="text" 
              placeholder="Tu nombre de piloto..." 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-900/90 border-2 border-slate-700 p-4 rounded-xl text-white text-center focus:outline-none focus:border-red-500 transition-all font-bold placeholder:text-slate-600"
            />
            <button 
              onClick={() => onSaveScore?.(name)}
              className="w-full py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-orbitron font-bold uppercase tracking-widest text-sm transition-all active:scale-95 shadow-lg"
            >
              Guardar en Ranking
            </button>
            <button 
              onClick={onStart}
              className="w-full py-5 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-orbitron font-black text-xl uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl shadow-red-900/40"
            >
              NUEVO INTENTO
            </button>
          </div>
        </div>
      ) : (
        // UI DE INICIO NORMAL
        <div className="text-center w-full space-y-12">
          <div className="space-y-2">
            <h1 className="text-7xl font-orbitron font-black text-transparent bg-clip-text bg-gradient-to-b from-red-400 to-red-600 drop-shadow-2xl italic leading-none">
              CONE<br/>CRUSHER
            </h1>
            <p className="text-slate-400 font-orbitron tracking-[0.4em] uppercase text-xs">Red Fury Challenge</p>
          </div>

          <div className="space-y-4 w-full">
            <div className="relative group">
              <div className="absolute inset-0 bg-red-600 rounded-2xl blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
              <button 
                onClick={onStart}
                className="relative w-full py-6 bg-red-600 hover:bg-red-500 active:scale-95 transition-all rounded-2xl font-orbitron font-black text-2xl uppercase tracking-[0.2em] shadow-2xl shadow-red-900/50"
              >
                ARRANCAR
              </button>
            </div>

            <button 
              onClick={onShowLeaderboard}
              className="w-full py-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl font-bold text-slate-300 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-3"
            >
              <svg className="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              Ver Ranking
            </button>
          </div>

          <div className="p-4 bg-slate-800/40 border border-slate-700/50 rounded-2xl">
            <h3 className="text-[10px] font-black uppercase text-red-500 mb-2 tracking-widest">Reglas del Piloto</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              Choca contra <span className="text-white">TODOS</span> los conos.<br/>
              Si esquivas uno, <span className="text-red-400">pierdes una vida</span>.<br/>
              Usa <span className="text-slate-200">Flechas / WASD</span> para controlar la furia roja.
              Creator: MG
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Menu;
