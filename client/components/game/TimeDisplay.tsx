import React, { useEffect, useState } from 'react';

type TimeDisplayProps = {
  gameActive: boolean,
  startTime: number
};

export default function TimeDisplay({ startTime, gameActive }: TimeDisplayProps) {
  const [intervalId, setIntervalId] = useState<NodeJS.Timer | null>(null);
  const [currTime, setCurrTime] = useState(0);

  useEffect(() => {
    if (intervalId) clearInterval(intervalId);
    if (gameActive) {
      const newIntervalId = setInterval(() => {
        setCurrTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      setIntervalId(newIntervalId);
    }
    else setCurrTime(0);

    return () => {
      if (intervalId !== null) clearInterval(intervalId);
    }
  }, [startTime, gameActive]);

  return (
    <span className='timer'>{currTime} s</span>
  )
}