import * as React from 'react';
import { GridObject } from './GameController';
import GridSquare from './GridSquare';

type GameBoardProps = {
  grid: GridObject[],
  width: number,
  height: number,
  onSquareClick: (index: number, event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
}

export default function GameBoard(props: GameBoardProps) {
  // console.log("Board rerender")
/*   const handleSquareClick = React.useCallback<typeof props.onSquareClick>((index, event) => {
    // console.log("Clicked square:", index);
    props.onSquareClick(index, event);
  }, [props.onSquareClick]); */

  const squares = props.grid.map((square, i) => 
    <GridSquare
      index={i}
      onClick={props.onSquareClick} key={`GridSquare_${i}`}
      {...square}
    />
  );
  return (
    <div className="gameBoard" style={{gridTemplateColumns: `repeat(${props.width}, 50px)`}}>
      {squares}
    </div>
  );
}