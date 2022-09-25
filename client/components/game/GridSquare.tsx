import * as React from 'react';

type GridSquareProps = {
  index: number,
  content: string,
  isRevealed: boolean,
  isFlagged: boolean,
  onClick: (index: number, event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
}

// TODO? Left + Right click to reveal adjacent tiles
// This is called "chording"
// Left + right click causes all eight adjacent squares to be revealed if the chorded square has the right number of flags
export default function GridSquare({ index, content, isRevealed, isFlagged, onClick }: GridSquareProps) {
  const handleClick = React.useCallback<typeof onClick>((index, event) => {
    event.preventDefault();

    // Return if space is already revealed or if attempting to left click a flagged tile
    const { button } = event.nativeEvent;
    if (isRevealed || (isFlagged && button === 0)) return;

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