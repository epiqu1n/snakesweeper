export type TileContent = 'M' | '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8';

export enum GameState {
  PRE_GAME,
  IN_GAME,
  POST_GAME_LOSS,
  POST_GAME_WIN
}