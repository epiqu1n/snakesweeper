import React from 'react';
import TimeDisplay from './TimeDisplay';

type GameBarProps = {
  gameActive: boolean,
  startTime: number
};

export default function GameBar({ startTime, gameActive }: GameBarProps) {
  return (
    <div className='gameBar'>
      <TimeDisplay startTime={startTime} gameActive={gameActive} />
    </div>
  )
}