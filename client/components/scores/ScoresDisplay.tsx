import { CSSProperties } from 'react';
import { useGetScores } from '../../api/scores';
import gamemodes from '../../utils/gamemodes';
import Leaderboard from './Leaderboard';

type ScoresDisplayProps = {
  mode: string
};

export default function ScoresDisplay({ mode }: ScoresDisplayProps) {
  const modeId = gamemodes[mode].modeId;
  const [ scores ] = useGetScores({ modeId }, { refetchInterval: false });

  return (
    <section style={sectionStyle}>
      <h2>Leaderboards – {mode}</h2>
      <Leaderboard
        title={`Top scores`}
        scores={scores}
      />
      <Leaderboard
        title={`Your scores`}
        scores={scores}
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
