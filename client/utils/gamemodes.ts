export type Gamemode = {
  size: [width: number, height: number],
  mines: number,
  modeId: number
};

export interface GamemodeOptions {
  [mode: string]: Gamemode
}

export const modes: GamemodeOptions = {
  'EZMode': { size: [9, 9], mines: 3, modeId: 0 },
  'Beginner': { size: [9, 9], mines: 10, modeId: 1 },
  'Intermediate': { size: [16, 16], mines: 40, modeId: 2 },
  'Expert': { size: [30, 16], mines: 99, modeId: 3 },
  'Why': { size: [40, 40], mines: 666, modeId: 4 }
}
export default modes;