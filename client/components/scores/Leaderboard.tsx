import { UserScore } from '../../types/Scores';
import ScoreRow from './ScoreRow';
import styles from './Leaderboard.module.scss';

interface LeaderboardProps {
  title: string,
  scores: UserScore[]
}

export default function Leaderboard({ title, scores }: LeaderboardProps) {
  const scoreRows = scores.map((score) => <ScoreRow {...score} key={`Score_${score.score_id}`} />);

  return (
  <div className={styles['leaderboard']}>
    <h3>{title}</h3>
    <div className={styles['container']}>
      <table>
        <thead><tr>
          <th className={styles['name']}>Player</th>
          <th className={styles['score']}>Time</th>
          <th className={styles['date']}>Date</th>
        </tr></thead>
        <tbody>{scoreRows}</tbody>
      </table>
    </div>
  </div>
  );
}