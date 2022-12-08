import { QueryFunctionContext, useQuery } from '@tanstack/react-query';
import { CSSProperties } from 'react';
import { UserScore } from '../../types/Scores';
import gamemodes from '../../utils/gamemodes';
import Leaderboard from './Leaderboard';

type ScoresDisplayProps = {
  topScores: UserScore[],
  mode: string
};

export default function ScoresDisplay({ /* topScores, */ mode }: ScoresDisplayProps) {
  const modeId = gamemodes[mode].modeId;
  const scoresQuery = useQuery({
    queryKey: ['scores', { modeId }],
    queryFn: () => getTopScores(modeId),
    refetchInterval: false
  });

  const topScores = scoresQuery.data || [];

  return (
    <section style={sectionStyle}>
      <h2>Leaderboards – {mode}</h2>
      <Leaderboard
        title={`Top scores`}
        scores={topScores}
      />
      <Leaderboard
        title={`Your scores`}
        scores={topScores}
      />
    </section>
  );
}

const sectionStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexFlow: 'column nowrap'
}

async function getTopScores(modeId?: number) {
  console.log('Getting top scores');

  let url = '/api/scores';
  if (typeof modeId === 'number') url += `?modeId=${modeId}`;
  
  const data = await fetch(url).then(res => res.json());
  if (data.error) {
    console.error(data.error);
    throw new Error('An error occurred getting top scores:', data.error);
  }

  const scores: UserScore[] = data.scores.map((score: UserScore & { submitted_at: string }) => ({
    ...score,
    submitted_at: new Date(score.submitted_at)
  }));
  return scores;
}