import { UserScore } from '../../types/Scores';
import ScoreRow from './ScoreRow';
import styles from './Leaderboard.module.scss';
import { UIEventHandler } from 'react';

interface LeaderboardProps {
  title: string,
  scores?: UserScore[],
  onScrollBottom: () => void
}

export default function Leaderboard({ title, scores, onScrollBottom }: LeaderboardProps) {
  const scoreRows = scores?.map((score, i) => <ScoreRow {...score} position={i+1} key={`Score_${score.score_id}`} />);

  const handleScroll: UIEventHandler<HTMLDivElement> = (event) => {
    const el = event.target as HTMLDivElement;
    const endDist = el.scrollHeight - (el.scrollTop + el.clientHeight);
    if (endDist < 875) onScrollBottom();
  }

  return (
  <div className={styles['leaderboard']}>
    <h3>{title}</h3>
    <div className={styles['container']} onScroll={handleScroll}>
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
