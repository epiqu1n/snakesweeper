import * as React from 'react';
import { UserScore } from '../../App';
import TopScores from './TopScores';

type ScoresDisplayProps = {
  topScores: UserScore[]
};

export default function ScoresDisplay({ topScores }: ScoresDisplayProps) {
  return <TopScores scores={topScores} />;
}