import * as React from "react";
import GameBoard from "./GameBoard";

export type GridObject = {
  content: string,
  isRevealed: boolean,
  isFlagged: boolean
};

// Beginner: 9 × 9 board with 10 mines
// Intermediate: 16 × 16 board with 40 mines
// Expert: 16 × 30 board with 99 mines
export default function GameController() {
  const [size, setSize] = React.useState([3, 3]);
  const [grid, setGrid] = React.useState<GridObject[]>([]);
  const [remaining, setRemaining] = React.useState(size[0] * size[1]);
  const [numMines, setNumMines] = React.useState(1);
  const [startTime, setStartTime] = React.useState<number>(-1);

  // TODO: Prevent user losing on first click
  /**
   * On square click, set new grid state and check if player hit a mine or has won
   * @param index 
   */
  const handleSquareClick = (index: number, event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    console.log('Clicked square', index, ':', grid[index].content);
    // Start timer if first click
    if (startTime <= 0) {
      setStartTime(Date.now());
    }

    // Update grid state
    const newGrid = [ ...grid ];
    const newSquare = { ...grid[index] };
    if (event.type === 'click') newSquare.isRevealed = true;
    else {
      event.preventDefault();
      newSquare.isFlagged = !newSquare.isFlagged;
    }
    newGrid[index] = newSquare;
    setGrid(newGrid);

    // No further logic if not a regular click
    if (event.type !== 'click') return;

    // Decrement remaining squares
    const newRemaining = remaining - 1;
    setRemaining(newRemaining);

    // Check for win or loss
    if (grid[index].content === 'M') {
      console.log('Player lost');
      alert('You lose :(');
      startNewGame();
    }
    else if (newRemaining === numMines) {
      const totalTime = Math.floor((Date.now() - startTime) / 1000);
      console.log('Player won!');
      alert(`You win! :D\nIt took you ${totalTime} seconds`);
      startNewGame();
    }
  };

  /**
   * Resets the grid, remaining squares, and start time
   */
  const startNewGame = () => {
    setGrid(genGrid(size[0], size[1], numMines));
    setRemaining(size[0] * size[1]);
    setStartTime(-1);
  }

  // Reset grid on grid size change
  React.useEffect(() => {
    setGrid(genGrid(size[0], size[1], numMines));
    setRemaining(size[0] * size[1]);
  }, [size]);

  return (
    <GameBoard
      grid={grid}
      width={size[0]}
      height={size[1]}
      onSquareClick={handleSquareClick}
    />
  );
}

/// Auxiliary functions
function genGrid(width: number, height: number, numMines: number) {
  const newGrid = Array.from({ length: width * height }, () => ({ content: '-', isRevealed: false, isFlagged: false }));
  const available = Object.keys(newGrid);

  // For num mines, randomly assign to a grid location that has not been occupied yet
  for (let i = 0; i < numMines; i++) {
    const randIndex = Math.floor(Math.random() * available.length);
    available.splice(randIndex, 1);
    newGrid[randIndex].content = 'M';
  }

  function countAdjacentMines(row: number, col: number) {
    

    let mineCount = 0;
    // Iterate around adjacent squares
    for (let x = -1; x <= 1; x++) {
      const checkCol = col + x;
      if (checkCol < 0 || checkCol >= width) continue; // Prevent wrapping behavior

      for (let y = -1; y <= 1; y++) {
        const checkRow = row + y;
        if (x === 0 && y === 0 || checkRow < 0 || checkRow >= height) continue; // Prevent same square being checked and wrapping behavior

        // Determine index of adjacent square and check if it's a mine
        // i = width * r + c
        const index = checkRow * width + checkCol;
        if (newGrid[index]?.content === 'M') mineCount++;
      }
    }
    return mineCount;
  }

  // Iterate through squares and determine number of adjacent mines
  // row = Math.floor(i / width), col = i % width
  for (let i = 0; i < newGrid.length; i++) {
    if (newGrid[i].content === 'M') continue;
    const row = Math.floor(i / width), col = i % width;
    newGrid[i].content = countAdjacentMines(row, col).toString();
  }

  console.log('New grid:', newGrid);
  return newGrid;
}

/*
  Example grid:
               4              9              14             19             24
  [-, -, -, M, -, M, -, -, -, M, M, -, M, -, -, -, -, -, -, -, -, -, -, -, -]

    0 1 2 3 4
  0 - - - M -   i = width * r + c           ex. r = 1, c = 4, w = 5 -> i = 5 * 1 + 4 = 9
  1 M - - - M   r = Math.floor(i / width)   ex. i = 9, w = 5 -> r = floor(9 / 5) = 1
  2 M - M - -   c = i % width                                   c = 9 % 5 = 4
  3 - - - - - 
  4 - - - - -
*/
