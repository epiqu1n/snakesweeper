import { GameState as GS } from '../../types/GridTypes';
import FlagsDisplay from './MinesDisplay';
import TimeDisplay from './TimeDisplay';
// import restartImg from '../../assets/restart.png';

type GameBarProps = {
  gameState: GS,
  startTime: number,
  remainingFlags: number,
  onResetClick: () => void
};

export default function GameBar({ startTime, gameState, remainingFlags, onResetClick }: GameBarProps) {
  let classes = ['reset'];
  classes.push(
    gameState === GS.IN_GAME ? 'active'
    : gameState === GS.POST_GAME_WIN ? 'win'
    : gameState === GS.POST_GAME_LOSS ? 'loss'
    : 'pre'
  );
  const className = classes.join(' ');

  return (
    <div className='gameBar'>
      <FlagsDisplay remaining={remainingFlags} />
      <button className={className} onClick={onResetClick}></button>
      <TimeDisplay startTime={startTime} gameState={gameState} />
    </div>
  )
}
