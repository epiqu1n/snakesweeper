import { UserScore } from '../../types/Scores';
import Leaderboard from './Leaderboard';

type ScoresDisplayProps = {
  topScores: UserScore[],
  mode: string
};

export default function ScoresDisplay({ topScores, mode }: ScoresDisplayProps) {
  return (
    <section>
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