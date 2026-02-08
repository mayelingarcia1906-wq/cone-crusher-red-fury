
import React from 'react';
import { HighScore } from '../types';

interface LeaderboardProps {
  scores: HighScore[];
  onBack: () => void;
  onPlay: () => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ scores, onBack, onPlay }) => {
  return (
    <div className="z-20 w-full max-w-md bg-slate-800/95 backdrop-blur-xl border-2 border-slate-700 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
      <div className="p-8 bg-gradient-to-r from-red-600/20 to-transparent flex items-center justify-between border-b border-slate-700">
        <h2 className="text-3xl font-orbitron font-black text-white italic">TOP DRIVERS</h2>
        <button onClick={onBack} className="text-slate-400 hover:text-white transition-colors">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-6 max-h-[60vh] overflow-y-auto">
        {scores.length === 0 ? (
          <div className="text-center py-12 text-slate-500 italic">No hay récords aún... ¡Sé el primero!</div>
        ) : (
          <div className="space-y-3">
            {scores.map((s, i) => (
              <div 
                key={i} 
                className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                  i === 0 ? 'bg-red-600/10 border-red-500/50 scale-[1.02]' : 'bg-slate-700/30 border-slate-700'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className={`w-8 h-8 flex items-center justify-center font-black rounded-lg ${
                    i === 0 ? 'bg-red-500 text-white' : 
                    i === 1 ? 'bg-slate-400 text-slate-900' : 
                    i === 2 ? 'bg-amber-700 text-amber-100' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-bold text-white uppercase">{s.name}</p>
                    <p className="text-[10px] text-slate-500 uppercase font-bold">{s.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-orbitron font-black text-red-500">{s.score}</p>
                  <p className="text-[10px] text-red-500/50 uppercase font-black tracking-tighter">pts</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-6 bg-slate-900/50 flex flex-col gap-3">
        <button 
          onClick={onPlay}
          className="w-full py-4 bg-red-600 hover:bg-red-500 transition-all rounded-xl font-orbitron font-black text-lg uppercase tracking-widest shadow-lg shadow-red-900/40"
        >
          ¡Aplastarlos Ya!
        </button>
      </div>
    </div>
  );
};

export default Leaderboard;
