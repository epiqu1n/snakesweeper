import * as React from 'react';

type GridSquareProps = {
  index: number,
  content: string,
  isRevealed: boolean,
  isFlagged: boolean,
  onClick: (index: number, event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
}

// TODO: Tile hover effect
// TODO: Prevent clicking flagged tile
// TODO? Left + Right click to reveal adjacent tiles
export default function GridSquare({ index, content, isRevealed, isFlagged, onClick }: GridSquareProps) {
  const handleClick = React.useCallback<typeof onClick>((index, event) => {
    event.preventDefault();
    if (isRevealed) return;
    onClick(index, event);
  }, [onClick, isRevealed]);

  const display = (isRevealed  && content !== '0' && !isNaN(parseInt(content)) ? content : '');

  let className = `s${content} ` + (isRevealed ? '' : 'hidden');
  if (isFlagged) className += ' F';

  return (
    <div onContextMenu={(e) => e.preventDefault()} onMouseUp={(event) => handleClick(index, event)} className={className}>
      {display}
    </div>
  );
}