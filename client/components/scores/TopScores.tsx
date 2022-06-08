import * as React from 'react';
import ScoreRow from './ScoreRow';
const { useState, useEffect } = React;
// import styles from './TopScores.scss';

type UserScore = {
  time_seconds: number,
  username: string,
  submitted_at: string // Datetime
};

export default function TopScores() {
  const [scores, setScores] = useState<UserScore[]>([]);

  async function getTopScores() {
    const data = await fetch('/api/scores').then(res => res.json());
    if (data.error) return console.error(data.error);
    setScores(data.scores);
  }

  useEffect(() => {
    getTopScores().catch(err => console.error(err));
  }, []);

  const scoreRows = scores.map((score, i) => <ScoreRow {...score} key={`Score_${score.username}_${i}`} />);

  return (
  <section className="scores">
    <h2>Top Scores</h2>
    <table>{scoreRows}</table>
  </section>
  );
}