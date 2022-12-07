import { useEffect, useState } from 'react';
import GameController from './components/game/GameController';
import ScoresDisplay from './components/scores/ScoresDisplay';
import './stylesheets/styles.scss';
import { UserScore } from './types/Scores';
import gamemodes from './utils/gamemodes';




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

      const scores: UserScore[] = data.scores.map((score: UserScore & { submitted_at: string }) => ({
        ...score,
        submitted_at: new Date(score.submitted_at)
      }));
      setTopScores(scores);
    } catch (err) {
      alert('Something went wrong retrieving top scores');
      return console.error(err);
    }
  }

  useEffect(() => {
    getTopScores(gamemodes[mode].modeId);
  }, [mode]);

  function handleScoreSubmit() {
    getTopScores(gamemodes[mode].modeId);
  }

  function handleModeChange(mode: string) {
    setMode(mode);
  }

  const difficultyOpts = Object.entries(gamemodes).map(([diff, opts]) =>
    <option key={`ModeOpt_${opts.modeId}`}>{diff}</option>
  );

  return (<>
    <h1>Snakesweeper</h1>
    <GameController onScoreSubmit={handleScoreSubmit} onModeChange={handleModeChange} difficulty={gamemodes[mode]}>
        {difficultyOpts}
    </GameController>
    <ScoresDisplay topScores={topScores} mode={mode} />
  </>);
}