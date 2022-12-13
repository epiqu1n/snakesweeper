import { useMemo, useState } from 'react';
import GameController from './components/game/GameController';
import ScoresDisplay from './components/scores/ScoresDisplay';
import userContext, { UserInfo } from './contexts/userContext';
import './stylesheets/styles.scss';
import gamemodes from './utils/gamemodes';

export default function App() {
  const [ mode, setMode ] = useState('EZMode');
  const [ authUser, setAuthUser ] = useState<UserInfo | null>(null);
  const userContextValue = useMemo(() => ({ user: authUser, setUser: setAuthUser }), [authUser, setAuthUser]);

  function handleModeChange(mode: string) {
    setMode(mode);
  }

  const difficultyOpts = Object.entries(gamemodes).map(([diff, opts]) =>
    <option key={`ModeOpt_${opts.modeId}`}>{diff}</option>
  );

  return (<>
    <userContext.Provider value={userContextValue}>
      <h1>Snakesweeper</h1>
      <GameController onModeChange={handleModeChange} difficulty={gamemodes[mode]}>
          {difficultyOpts}
      </GameController>
      <ScoresDisplay mode={mode} />
    </userContext.Provider>
  </>);
}
