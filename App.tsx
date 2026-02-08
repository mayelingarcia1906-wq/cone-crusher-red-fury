import React, { useState, useEffect, useCallback, useMemo } from 'react';
import GameEngine from './components/GameEngine';
import Menu from './components/Menu';
import Leaderboard from './components/Leaderboard';
import { GameState, HighScore } from './types';
import { INITIAL_LIVES, LOCAL_STORAGE_KEY } from './constants';
import { getGameOverCommentary } from './services/gemini';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    lives: INITIAL_LIVES,
    isGameOver: false,
    isPaused: false,
    gameStarted: false,
  });

  const [highScores, setHighScores] = useState<HighScore[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [commentary, setCommentary] = useState<string>('');
  const [isLoadingCommentary, setIsLoadingCommentary] = useState(false);

  // --- LÓGICA DE VELOCIDAD PROGRESIVA (Cada 30 puntos) ---
  const { gameSpeed, level } = useMemo(() => {
    const currentLevel = Math.floor(gameState.score / 30);
    // Empezamos en 1.0 y sumamos 0.6 por cada nivel alcanzado
    return {
      gameSpeed: 1.0 + (currentLevel * 0.6),
      level: currentLevel + 1
    };
  }, [gameState.score]);

  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      try {
        setHighScores(JSON.parse(stored));
      } catch (e) {
        setHighScores([]);
      }
    }
  }, []);

  useEffect(() => {
    if (gameState.gameStarted && gameState.lives <= 0) {
      handleGameOver(gameState.score);
    }
  }, [gameState.lives, gameState.gameStarted, gameState.score]);

  const saveScore = useCallback((name: string) => {
    const playerName = name.trim() || 'Piloto Anónimo';
    const newScore: HighScore = {
      name: playerName,
      score: gameState.score,
      date: new Date().toLocaleDateString(),
    };
    
    const updated = [...highScores, newScore]
      .sort((a, b) => b.score - a.score)
      .slice(0, 3); 
    
    setHighScores(updated);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    setShowLeaderboard(true);
  }, [gameState.score, highScores]);

  const startGame = () => {
    setGameState({
      score: 0,
      lives: INITIAL_LIVES,
      isGameOver: false,
      isPaused: false,
      gameStarted: true,
    });
    setCommentary('');
    setShowLeaderboard(false);
  };

  const resetToMenu = () => {
    setGameState(prev => ({ 
      ...prev, 
      gameStarted: false,
      isGameOver: false,
      score: 0,
      lives: INITIAL_LIVES 
    }));
    setCommentary('');
    setShowLeaderboard(false);
  };

  const handleGameOver = useCallback(async (finalScore: number) => {
    setIsLoadingCommentary(true);
    setGameState(prev => ({ ...prev, gameStarted: false, isGameOver: true }));
    
    try {
      const text = await getGameOverCommentary(finalScore);
      setCommentary(text);
    } catch (error) {
      setCommentary("¡Vuelve a intentarlo, piloto!");
    } finally {
      setIsLoadingCommentary(false);
    }
  }, []);

  return (
    <div className="relative w-full h-screen bg-slate-900 flex items-center justify-center text-white overflow-hidden">
      {/* Fondo dinámico: El color cambia sutilmente con cada nivel usando rotación de hue */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none transition-all duration-1000"
        style={{ filter: `hue-rotate(${level * 45}deg)` }}
      >
        <div className="absolute top-10 left-10 w-96 h-96 bg-red-600 rounded-full blur-[160px]" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-orange-600 rounded-full blur-[160px]" />
      </div>

      {!gameState.gameStarted && !showLeaderboard && (
        <Menu 
          onStart={startGame} 
          onShowLeaderboard={() => setShowLeaderboard(true)}
          gameOverData={gameState.isGameOver ? { 
            score: gameState.score, 
            commentary, 
            isLoading: isLoadingCommentary 
          } : undefined}
          onSaveScore={saveScore}
        />
      )}

      {gameState.gameStarted && (
        <GameEngine 
          onGameOver={handleGameOver} 
          gameState={gameState} 
          setGameState={setGameState}
          speed={gameSpeed} 
        />
      )}

      {showLeaderboard && (
        <Leaderboard 
          scores={highScores} 
          onBack={resetToMenu} 
          onPlay={startGame}
        />
      )}

      {gameState.gameStarted && (
        <div className="absolute top-8 left-8 right-8 flex justify-between items-start pointer-events-none z-10">
          <div className="bg-slate-800/90 backdrop-blur-md px-6 py-4 rounded-3xl border border-slate-700 shadow-2xl flex flex-col items-center min-w-[120px]">
            <p className="text-[10px] text-red-500 uppercase font-black tracking-[0.3em] mb-1">SCORE</p>
            <p className="text-4xl font-orbitron font-black text-white leading-none">{gameState.score}</p>
            
            {/* Indicador de Nivel Actual */}
            <div className="mt-2 px-3 py-1 bg-red-600/20 rounded-full border border-red-600/30">
               <p className="text-[9px] text-red-400 font-bold uppercase tracking-widest">
                Nivel {level}
               </p>
            </div>
          </div>
          
          <div className="bg-slate-800/90 backdrop-blur-md px-6 py-4 rounded-3xl border border-slate-700 shadow-2xl flex flex-col items-center">
            <p className="text-[10px] text-red-500 uppercase font-black tracking-[0.3em] mb-2">VIDAS</p>
            <div className="flex gap-2.5">
              {[...Array(INITIAL_LIVES)].map((_, i) => (
                <div 
                  key={i} 
                  className={`w-7 h-7 transition-all duration-500 ${i < gameState.lives ? 'text-red-600 drop-shadow-[0_0_12px_rgba(220,38,38,0.8)] scale-110' : 'text-slate-900 opacity-20 scale-90'}`}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;