import React from 'react';

interface FlagsDisplayProps {
  remaining: number
}

export default function FlagsDisplay({ remaining: remainingFlags }: FlagsDisplayProps) {
  return (
    <span className='flagsDisplay'>{remainingFlags}</span>
  )
}