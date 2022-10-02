import * as React from 'react';
import { TileContent } from '../../types/GridTypes';

type GridSquareProps = {
  index: number,
  content: TileContent,
  isRevealed: boolean,
  isFlagged: boolean,
  onClick: (index: number, event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
}

// TODO? Left + Right click to reveal adjacent tiles
// This is called "chording"
// Left + right click causes all eight adjacent squares to be revealed if the chorded square has the right number of flags
export default function GridSquare({ index, content, isRevealed, isFlagged, onClick }: GridSquareProps) {
  const handleClick = React.useCallback((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.preventDefault();
    onClick(index, event);
  }, [onClick, isRevealed]);

  const display = (isRevealed  && content !== '0' && !isNaN(parseInt(content)) ? content : '');

  let className = `s${content} ` + (isRevealed ? '' : 'hidden');
  if (isFlagged) className += ' F';

  return (
    <div onContextMenu={(e) => e.preventDefault()} onMouseDown={handleClick} onMouseUp={handleClick} className={className}>
      {display}
    </div>
  );
}