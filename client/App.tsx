import { useState } from 'react';
import GameController from './components/game/GameController';
import ScoresDisplay from './components/scores/ScoresDisplay';
import './stylesheets/styles.scss';
import gamemodes from './utils/gamemodes';




export default function App() {
  const [mode, setMode] = useState('EZMode');

  function handleModeChange(mode: string) {
    setMode(mode);
  }

  const difficultyOpts = Object.entries(gamemodes).map(([diff, opts]) =>
    <option key={`ModeOpt_${opts.modeId}`}>{diff}</option>
  );

  return (<>
    <h1>Snakesweeper</h1>
    <GameController onModeChange={handleModeChange} difficulty={gamemodes[mode]}>
        {difficultyOpts}
    </GameController>
    <ScoresDisplay mode={mode} />
  </>);
}
