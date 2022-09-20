import React from 'react';
import TimeDisplay from './TimeDisplay';

type GameBarProps = {
  gameActive: boolean,
  startTime: number
};

// TODO: Show mines remaining
export default function GameBar({ startTime, gameActive }: GameBarProps) {
  return (
    <div className='gameBar'>
      <TimeDisplay startTime={startTime} gameActive={gameActive} />
    </div>
  )
}