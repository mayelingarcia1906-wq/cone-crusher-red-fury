
export interface GameState {
  score: number;
  lives: number;
  isGameOver: boolean;
  isPaused: boolean;
  gameStarted: boolean;
}

export interface Cone {
  id: number;
  x: number;
  y: number;
  speed: number;
  width: number;
  height: number;
  hit: boolean;
  missed: boolean;
}

export interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface HighScore {
  name: string;
  score: number;
  date: string;
}
