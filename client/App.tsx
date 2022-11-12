import { useEffect, useState } from 'react';
import GameController from './components/game/GameController';
import ScoresDisplay from './components/scores/ScoresDisplay';
import './stylesheets/styles.scss';

export type UserScore = {
  time_seconds: number,
  username: string,
  submitted_at: string, // Datetime
  score_id: number
};

export type BoardOptions = {
  size: [width: number, height: number],
  mines: number,
  modeId: number
};

export const difficulties: {[d: string]: BoardOptions} = {
  'EZMode': { size: [9, 9], mines: 3, modeId: 0 },
  'Beginner': { size: [9, 9], mines: 10, modeId: 1 },
  'Intermediate': { size: [16, 16], mines: 40, modeId: 2 },
  'Expert': { size: [30, 16], mines: 99, modeId: 3 },
  'Why': { size: [40, 40], mines: 666, modeId: 4 }
}

export default function App() {
  const [topScores, setTopScores] = useState<UserScore[]>([]);
  const [mode, setMode] = useState('EZMode');

  async function getTopScores(modeId?: number) {
    console.log('Getting top scores');
    let url = '/api/scores';
    if (typeof modeId === 'number') url += `?modeId=${modeId}`;
    try {
      const data = await fetch(url).then(res => res.json());
      if (data.error) return console.error(data.error);
      setTopScores(data.scores);
    } catch (err) {
      alert('Something went wrong retrieving top scores');
      return console.error(err);
    }
  }

  useEffect(() => {
    getTopScores(difficulties[mode].modeId);
  }, [mode]);

  function handleScoreSubmit() {
    getTopScores(difficulties[mode].modeId);
  }

  function handleModeChange(mode: string) {
    setMode(mode);
  }

  const difficultyOpts = Object.entries(difficulties).map(([diff, opts]) =>
    <option key={`ModeOpt_${opts.modeId}`}>{diff}</option>
  );

  return (<>
    <h1>Snakesweeper</h1>
    <GameController onScoreSubmit={handleScoreSubmit} onModeChange={handleModeChange} difficulty={difficulties[mode]}>
        {difficultyOpts}
    </GameController>
    <ScoresDisplay topScores={topScores} mode={mode} />
  </>);
}