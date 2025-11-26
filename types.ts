export enum GameMode {
  MENU = 'MENU',
  ZEN = 'ZEN',
  SPEED = 'SPEED',
  GAME_OVER = 'GAME_OVER'
}

export interface TissueData {
  id: string;
  rotation: number;
  text?: string;
  offsetX: number;
  offsetY: number;
}

export interface GameStats {
  count: number;
  startTime: number | null;
  elapsedTime: number;
}