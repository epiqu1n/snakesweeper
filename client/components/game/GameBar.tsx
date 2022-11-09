import React from 'react';
import { GameState } from '../../types/GridTypes';
import FlagsDisplay from './MinesDisplay';
import TimeDisplay from './TimeDisplay';
// import restartImg from '../../assets/restart.png';

type GameBarProps = {
  gameState: GameState,
  startTime: number,
  remainingFlags: number,
  onResetClick: () => void
};

export default function GameBar({ startTime, gameState, remainingFlags, onResetClick }: GameBarProps) {
  return (
    <div className='gameBar'>
      <FlagsDisplay remaining={remainingFlags} />
      <button className='reset' onClick={onResetClick}></button>
      <TimeDisplay startTime={startTime} gameState={gameState} />
    </div>
  )
}