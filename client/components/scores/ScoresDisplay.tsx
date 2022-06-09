import * as React from 'react';
import { UserScore } from '../../App';
import TopScores from './TopScores';

type ScoresDisplayProps = {
  topScores: UserScore[],
  mode: string
};

export default function ScoresDisplay({ topScores, mode }: ScoresDisplayProps) {
  return <TopScores scores={topScores} mode={mode} />;
}