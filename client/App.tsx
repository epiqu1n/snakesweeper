import React, { useEffect, useState } from 'react';
import GameController from './components/game/GameController';
import ScoresDisplay from './components/scores/ScoresDisplay';
import './stylesheets/styles.scss';

export type UserScore = {
  time_seconds: number,
  username: string,
  submitted_at: string, // Datetime
  score_id: number
};

export default function App() {
  const [topScores, setTopScores] = useState<UserScore[]>([]);

  async function getTopScores() {
    const data = await fetch('/api/scores').then(res => res.json());
    if (data.error) return console.error(data.error);
    setTopScores(data.scores);
  }

  useEffect(() => {
    getTopScores().catch(err => console.error(err));
  }, []);

  function handleScoreSubmit() {
    getTopScores().catch(err => console.error(err));
  }

  return (<>
    <h1>Minesweeper</h1>
    <GameController onScoreSubmit={handleScoreSubmit} />
    <ScoresDisplay topScores={topScores} />
  </>);
}