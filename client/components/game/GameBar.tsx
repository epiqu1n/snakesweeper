import React from 'react';
import FlagsDisplay from './MinesDisplay';
import TimeDisplay from './TimeDisplay';
// import restartImg from '../../assets/restart.png';

type GameBarProps = {
  gameActive: boolean,
  startTime: number,
  remainingFlags: number,
  onResetClick: () => void
};

export default function GameBar({ startTime, gameActive, remainingFlags, onResetClick }: GameBarProps) {
  return (
    <div className='gameBar'>
      <FlagsDisplay remaining={remainingFlags} />
      <button className='reset' onClick={onResetClick}></button>
      <TimeDisplay startTime={startTime} gameActive={gameActive} />
    </div>
  )
}