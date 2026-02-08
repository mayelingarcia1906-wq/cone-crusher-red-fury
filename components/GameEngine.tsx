
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  GAME_WIDTH, GAME_HEIGHT, CAR_WIDTH, CAR_HEIGHT, 
  CONE_WIDTH, CONE_HEIGHT, INITIAL_CONE_SPEED, 
  SPEED_INCREMENT, CONE_SPAWN_CHANCE 
} from '../constants';
import { GameState, Cone, Player } from '../types';

interface GameEngineProps {
  onGameOver: (score: number) => void;
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

const GameEngine: React.FC<GameEngineProps> = ({ onGameOver, gameState, setGameState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [player, setPlayer] = useState<Player>({
    x: GAME_WIDTH / 2 - CAR_WIDTH / 2,
    y: GAME_HEIGHT - CAR_HEIGHT - 40,
    width: CAR_WIDTH,
    height: CAR_HEIGHT,
  });
  const [cones, setCones] = useState<Cone[]>([]);
  const [currentSpeed, setCurrentSpeed] = useState(INITIAL_CONE_SPEED);
  
  const requestRef = useRef<number | undefined>(undefined);
  const playerXRef = useRef(GAME_WIDTH / 2 - CAR_WIDTH / 2);
  const playerVelX = useRef(0);
  const roadOffset = useRef(0);
  const carTilt = useRef(0); 
  const keysPressed = useRef<{ [key: string]: boolean }>({});

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { keysPressed.current[e.code] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { keysPressed.current[e.code] = false; };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const update = useCallback(() => {
    if (gameState.isGameOver || gameState.isPaused) return;

    // Física con Inercia
    const accel = 0.95;
    const friction = 0.84;
    const maxVel = 9.5;

    if (keysPressed.current['ArrowLeft'] || keysPressed.current['KeyA']) {
      playerVelX.current -= accel;
      carTilt.current = Math.max(-0.15, carTilt.current - 0.025);
    } else if (keysPressed.current['ArrowRight'] || keysPressed.current['KeyD']) {
      playerVelX.current += accel;
      carTilt.current = Math.min(0.15, carTilt.current + 0.025);
    } else {
      playerVelX.current *= friction;
      carTilt.current *= 0.88; 
    }

    if (playerVelX.current > maxVel) playerVelX.current = maxVel;
    if (playerVelX.current < -maxVel) playerVelX.current = -maxVel;

    playerXRef.current += playerVelX.current;

    // Límites de pantalla
    if (playerXRef.current < 15) {
      playerXRef.current = 15;
      playerVelX.current = 0;
    }
    if (playerXRef.current > GAME_WIDTH - CAR_WIDTH - 15) {
      playerXRef.current = GAME_WIDTH - CAR_WIDTH - 15;
      playerVelX.current = 0;
    }

    setPlayer(prev => ({ ...prev, x: playerXRef.current }));

    // Scroll de carretera para dar sensación de movimiento
    roadOffset.current = (roadOffset.current + currentSpeed) % 80;

    setCurrentSpeed(s => Math.min(s + SPEED_INCREMENT, 18));

    if (Math.random() < CONE_SPAWN_CHANCE) {
      const newCone: Cone = {
        id: Date.now() + Math.random(),
        x: 25 + Math.random() * (GAME_WIDTH - CONE_WIDTH - 50),
        y: -CONE_HEIGHT,
        speed: currentSpeed,
        width: CONE_WIDTH,
        height: CONE_HEIGHT,
        hit: false,
        missed: false,
      };
      setCones(prev => [...prev, newCone]);
    }

    setCones(prevCones => {
      const updatedCones: Cone[] = [];
      let livesLost = 0;
      let scoreGained = 0;

      for (const cone of prevCones) {
        const nextY = cone.y + cone.speed;
        
        if (cone.hit || cone.missed) {
          if (nextY < GAME_HEIGHT + 100) updatedCones.push({ ...cone, y: nextY });
          continue;
        }

        const hit = (
          playerXRef.current < cone.x + cone.width &&
          playerXRef.current + CAR_WIDTH > cone.x &&
          player.y < cone.y + cone.height &&
          player.y + CAR_HEIGHT > cone.y
        );

        if (hit) {
          scoreGained += 1;
          updatedCones.push({ ...cone, y: nextY, hit: true });
          continue;
        }

        if (nextY > player.y + CAR_HEIGHT && !cone.hit && !cone.missed) {
          livesLost += 1;
          updatedCones.push({ ...cone, y: nextY, missed: true });
          continue;
        }

        if (nextY > GAME_HEIGHT) continue;
        updatedCones.push({ ...cone, y: nextY });
      }

      if (livesLost > 0 || scoreGained > 0) {
        setGameState(prev => {
          const newLives = Math.max(0, prev.lives - livesLost);
          const newScore = prev.score + scoreGained;
          if (newLives === 0 && !prev.isGameOver) {
             onGameOver(newScore);
          }
          return { ...prev, lives: newLives, score: newScore };
        });
      }

      return updatedCones;
    });

    requestRef.current = requestAnimationFrame(update);
  }, [gameState.isGameOver, gameState.isPaused, player.y, onGameOver, setGameState, currentSpeed]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [update]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Asfalto
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    
    // Bordes carretera
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 10, GAME_HEIGHT);
    ctx.fillRect(GAME_WIDTH - 10, 0, 10, GAME_HEIGHT);

    // Líneas carretera dinámicas
    ctx.strokeStyle = '#475569';
    ctx.setLineDash([40, 40]);
    ctx.lineDashOffset = -roadOffset.current;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(GAME_WIDTH / 2, 0);
    ctx.lineTo(GAME_WIDTH / 2, GAME_HEIGHT);
    ctx.stroke();
    ctx.setLineDash([]);

    // Dibujar Conos
    cones.forEach(cone => {
      if (cone.hit) {
        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.ellipse(cone.x + cone.width/2, cone.y + cone.height - 4, cone.width/2 + 15, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        return;
      }

      const color = cone.missed ? '#334155' : '#f97316';
      ctx.fillStyle = color;
      ctx.fillRect(cone.x, cone.y + cone.height - 8, cone.width, 8);
      ctx.beginPath();
      ctx.moveTo(cone.x + 4, cone.y + cone.height - 8);
      ctx.lineTo(cone.x + cone.width - 4, cone.y + cone.height - 8);
      ctx.lineTo(cone.x + cone.width/2, cone.y);
      ctx.fill();
      if (!cone.missed) {
        ctx.fillStyle = 'white';
        ctx.fillRect(cone.x + 12, cone.y + 12, cone.width - 24, 4);
      }
    });

    // Dibujar Auto
    ctx.save();
    ctx.translate(player.x + CAR_WIDTH/2, player.y + CAR_HEIGHT/2);
    ctx.rotate(carTilt.current);
    ctx.translate(-(player.x + CAR_WIDTH/2), -(player.y + CAR_HEIGHT/2));

    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(player.x + 5, player.y + 5, CAR_WIDTH, CAR_HEIGHT);

    ctx.fillStyle = '#dc2626'; 
    ctx.fillRect(player.x, player.y, CAR_WIDTH, CAR_HEIGHT);
    
    ctx.fillStyle = '#851414';
    ctx.fillRect(player.x + 6, player.y + 18, CAR_WIDTH - 12, 42);

    ctx.fillStyle = '#7dd3fc';
    ctx.fillRect(player.x + 10, player.y + 22, CAR_WIDTH - 20, 14);

    ctx.fillStyle = '#450a0a';
    ctx.fillRect(player.x - 4, player.y + CAR_HEIGHT - 6, CAR_WIDTH + 8, 8);

    ctx.fillStyle = '#ff0000';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ff0000';
    ctx.fillRect(player.x + 2, player.y + CAR_HEIGHT - 3, 12, 4);
    ctx.fillRect(player.x + CAR_WIDTH - 14, player.y + CAR_HEIGHT - 3, 12, 4);
    
    ctx.restore();

  }, [player, cones, carTilt]);

  return (
    <div className="relative border-4 border-slate-700 rounded-3xl shadow-2xl overflow-hidden bg-slate-800 ring-8 ring-slate-900/50">
      <canvas ref={canvasRef} width={GAME_WIDTH} height={GAME_HEIGHT} className="block" />
      
      <div className="md:hidden absolute bottom-6 left-0 right-0 flex justify-between px-10 gap-6 pointer-events-none">
        <button 
          className="w-24 h-24 bg-red-600/30 backdrop-blur-xl rounded-full pointer-events-auto active:bg-red-600/60 flex items-center justify-center border-2 border-white/20 active:scale-90 transition-all shadow-2xl"
          onTouchStart={() => { keysPressed.current['ArrowLeft'] = true; }}
          onTouchEnd={() => { keysPressed.current['ArrowLeft'] = false; }}
        >
          <svg className="w-10 h-10 rotate-180 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M10 17l5-5-5-5v10z" /></svg>
        </button>
        <button 
          className="w-24 h-24 bg-red-600/30 backdrop-blur-xl rounded-full pointer-events-auto active:bg-red-600/60 flex items-center justify-center border-2 border-white/20 active:scale-90 transition-all shadow-2xl"
          onTouchStart={() => { keysPressed.current['ArrowRight'] = true; }}
          onTouchEnd={() => { keysPressed.current['ArrowRight'] = false; }}
        >
          <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M10 17l5-5-5-5v10z" /></svg>
        </button>
      </div>
    </div>
  );
};

export default GameEngine;
