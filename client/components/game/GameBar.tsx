import React from 'react';
import FlagsDisplay from './MinesDisplay';
import TimeDisplay from './TimeDisplay';

type GameBarProps = {
  gameActive: boolean,
  startTime: number,
  remainingFlags: number
};

export default function GameBar({ startTime, gameActive, remainingFlags: remaining }: GameBarProps) {
  return (
    <div className='gameBar'>
      <FlagsDisplay remaining={remaining} />
      <TimeDisplay startTime={startTime} gameActive={gameActive} />
    </div>
  )
}