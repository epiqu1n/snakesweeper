import * as React from 'react';
import { TileContent } from '../../types/GridTypes';

type GridSquareProps = {
  index: number,
  content: TileContent,
  isRevealed: boolean,
  isFlagged: boolean,
  onClick: (index: number, event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void,
  wasBadReveal: boolean
}

export default function GridSquare({ index, content, isRevealed, isFlagged, onClick, wasBadReveal }: GridSquareProps) {
  const handleClick = React.useCallback((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.preventDefault();
    onClick(index, event);
  }, [onClick, isRevealed]);

  const isMine = (content === 'M');
  const isNeutral = (content === '0');
  const display = (
    isRevealed && !isNeutral ? (
      isMine || isFlagged ? ''
      : content
    )
    : ''
  );
  const className = makeCssClass(content, isFlagged, isRevealed, wasBadReveal);

  return (
    <div onContextMenu={(e) => e.preventDefault()} onMouseDown={handleClick} onMouseUp={handleClick} className={className}>
      {display}
    </div>
  );
}

/** Assembles a CSS class string for the tile based on its state and contents */
function makeCssClass(content: TileContent, isFlagged: boolean, isRevealed: boolean, wasBadReveal: boolean): string {
  // On game over, all mines and falsely flagged mines will be revealed
  // Styling behavior:
  // (isMine, isFlagged, isRevealed)
  /*
    Mine  Flag  Rev          Result
     Y     Y     Y    ->  Flag and hide
     Y     Y     N    ->  Flag and hide
     Y     N     Y    ->  Reveal
     Y     N     N    ->  Hide
     N     Y     Y    ->  Flag, but still hide and show X over it
     N     Y     N    ->  Flag and hide
     N     N     Y    ->  Reveal
     N     N     N    ->  Hide
  */

  // If tile is revealed, add its corresponding content class (s-*)
  // If the tile is not revealed or it's flagged, add the hidden class
  // If the tile is flagged, add the flag class
  const classes = [];

  if (isRevealed) classes.push(`s-${content}`);
  if (!isRevealed || isFlagged) classes.push('hidden');
  if (isFlagged) classes.push('F');
  if (wasBadReveal) classes.push('bad')

  return classes.join(' ');
}