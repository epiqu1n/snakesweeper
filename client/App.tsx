import * as React from 'react';
import GameController from './components/game/GameController';
import ScoresDisplay from './components/scores/ScoresDisplay';
import './stylesheets/styles.scss';

export default function App() {
  return (<>
    <h1>Minesweeper</h1>
    <GameController />
    <ScoresDisplay />
  </>);
}