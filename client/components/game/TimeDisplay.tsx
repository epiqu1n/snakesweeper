import { useEffect, useState } from 'react';
import { GameState as GS } from '../../types/GridTypes';

type TimeDisplayProps = {
  gameState: GS,
  startTime: number
};

export default function TimeDisplay({ startTime, gameState }: TimeDisplayProps) {
  const [intervalId, setIntervalId] = useState<NodeJS.Timer | null>(null);
  const [currTime, setCurrTime] = useState(0);

  useEffect(() => {
    if (intervalId !== null) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    if (gameState === GS.IN_GAME) {
      const newIntervalId = setInterval(() => {
        setCurrTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      setIntervalId(newIntervalId);
    }
    else if (gameState === GS.PRE_GAME) setCurrTime(0);

    return () => {
      if (intervalId !== null) clearInterval(intervalId);
    }
  }, [startTime, gameState]);

  return (
    <span className='timer'>{currTime} s</span>
  )
}