import { useEffect, useMemo, useState } from 'react';
import { getUserInfo } from './api/users/methods';
import GameController from './components/game/GameController';
import ScoresDisplay from './components/scores/ScoresDisplay';
import NavBar from './components/shared/NavBar';
import userContext, { UserInfo } from './contexts/userContext';
import './stylesheets/styles.scss';
import gamemodes from './utils/gamemodes';

export default function App() {
  const [ mode, setMode ] = useState('EZMode');
  const [ authUser, setAuthUser ] = useState<UserInfo | null>(null);
  const userContextValue = useMemo(() => ({ user: authUser, setUser: setAuthUser }), [authUser, setAuthUser]);

  // Get user info if logged in
  useEffect(() => {
    getUserInfo()
    .then(setAuthUser)
    .catch(() => null);
  }, []);

  function handleModeChange(mode: string) {
    setMode(mode);
  }

  const difficultyOpts = Object.entries(gamemodes).map(([diff, opts]) =>
    <option key={`ModeOpt_${opts.modeId}`}>{diff}</option>
  );

  return (<>
    <userContext.Provider value={userContextValue}>
      <NavBar />
      <GameController onModeChange={handleModeChange} difficulty={gamemodes[mode]}>
          {difficultyOpts}
      </GameController>
      <ScoresDisplay mode={mode} />
    </userContext.Provider>
  </>);
}
