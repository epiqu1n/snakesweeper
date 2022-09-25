import React from "react";
import GameBar from "./GameBar";
import GameBoard from "./GameBoard";
import { BoardOptions } from "../../App";

export type GridObject = {
  content: string,
  isRevealed: boolean,
  isFlagged: boolean
};

type GameControllerProps = {
  onScoreSubmit: () => void,
  onModeChange: (mode: string) => void,
  children: JSX.Element[],
  difficulty: BoardOptions
}

// TODO: Show all mines on loss
// TODO: Have restart button instead of automatically restarting on win or loss
export default function GameController({ onScoreSubmit, onModeChange, difficulty, children }: GameControllerProps) {
  const size = difficulty.size;
  const numMines = difficulty.mines;
  
  const [grid, setGrid] = React.useState<GridObject[]>([], );
  /** Number of unrevealed tiles */
  const [remainingTiles, setRemainingTiles] = React.useState(size[0] * size[1]);
  const [startTime, setStartTime] = React.useState(-1);
  const [gameActive, setGameActive] = React.useState(false);
  const [numFlags, setNumFlags] = React.useState(0);


  /// Event handlers
  /**
   * On square click, set new grid state and check if player hit a mine or has won
   * @param index 
   */
  const handleSquareClick = (index: number, event: React.MouseEvent<HTMLDivElement, MouseEvent>): void => {
    console.log('Clicked square', index, ':', grid[index].content);
    // Start timer if first click
    let generatedGrid: GridObject[] | undefined;
    if (!gameActive) {
      setStartTime(Date.now());
      setGameActive(true);
      generatedGrid = genGrid(...size, numMines, index);
      setGrid(generatedGrid);
    }

    // Update grid state
    const newGrid = !gameActive ? generatedGrid! : [ ...grid ];
    const newSquare = { ...newGrid[index] };
    const isLeftClick = event.nativeEvent.button === 0;

    // If left click, reveal square
    // Else, flag square
    if (isLeftClick) newSquare.isRevealed = true;
    else {
      newSquare.isFlagged = !newSquare.isFlagged;
      setNumFlags((prev) => prev + (newSquare.isFlagged ? 1 : -1));
    }

    newGrid[index] = newSquare;
    setGrid(newGrid);

    // No further logic if not a left click
    if (!isLeftClick) return;

    // Decrement remaining squares

    // Check for win or loss
    if (newGrid[index].content === 'M') {
      console.log('Player lost');
      setGameActive(false);
      // setTimeout(() => {
      setGrid(revealMines(newGrid))
      alert('Sssssssssss 🐍');
      // }, 1);
      startNewGame(); // DEBUG
    }
    else if (newGrid[index].content === '0') {
      // Clear adjacent empty squares
      const revealed = cascadeEmpties(newGrid, index, ...size);
      setGrid(newGrid);
      setRemainingTiles((prev) => prev - revealed);
    }
    else {
      setRemainingTiles(prev => prev - 1);
    }
  };

  /// Methods
  /**
   * Resets the grid, remaining squares, and start time
   */
  const startNewGame = () => {
    if (gameActive) setGameActive(false);
    // Set grid here just to fill out spaces when awaiting to start new game
    setGrid(genGrid(...size, numMines));
    setRemainingTiles(size[0] * size[1]);
    setStartTime(-1);
    setNumFlags(0);
  }

  /// Effects
  // Reset grid on grid size change
  React.useEffect(() => {
    startNewGame();
  }, [size]);

  // Check if player has won when remaining number of mines changes
  React.useEffect(() => {
    // console.log('Remaining:', remaining);
    if (remainingTiles === numMines) {
      const totalTime = Math.floor((Date.now() - startTime) / 1000);
      setGameActive(false);
      console.log('Player won!');

      // setTimeout(() => {
        const username = prompt(`You win! :D\nIt took you ${totalTime} seconds\nEnter your name:`);
        if (username && typeof username === 'string') submitScore(username, totalTime, difficulty.modeId).then(onScoreSubmit);
      // }, 1);
      startNewGame(); // DEBUG
    }
  }, [remainingTiles]);

  const remainingFlags = numMines - numFlags;

  /// Render
  return (
    <section className="gameContainer">
      <select onChange={(event) => onModeChange(event.target.value)} className='difficulty'>
        {children}
      </select>
      <div className="boardContainer">
        <GameBar startTime={startTime} gameActive={gameActive} remainingFlags={remainingFlags} />
        <GameBoard
          grid={grid}
          width={size[0]}
          height={size[1]}
          onSquareClick={handleSquareClick}
        />
      </div>
    </section>
  );
}

/// Auxiliary functions


function cascadeEmpties(grid: GridObject[], index: number, width: number, height: number, checked: Set<number> = new Set()) {
  // console.log(index, ':', grid[index].content, ':', grid[index].isRevealed);
  grid[index] = {
    ...grid[index],
    isRevealed: true
  };
  checked.add(index);
  if (grid[index].content !== '0') return 0;
  const row = Math.floor(index / width), col = index % width;
  
  // Iterate around adjacent squares
  for (let x = -1; x <= 1; x++) {
    const checkCol = col + x;
    if (checkCol < 0 || checkCol >= width) continue; // Prevent wrapping behavior

    for (let y = -1; y <= 1; y++) {
      const checkRow = row + y;
      if (x === 0 && y === 0 || checkRow < 0 || checkRow >= height) continue; // Prevent same square being checked and wrapping behavior

      const checkIndex = checkRow * width + checkCol;
      if (!checked.has(checkIndex) && !grid[checkIndex].isRevealed) cascadeEmpties(grid, checkIndex, width, height, checked);
    }
  }

  return checked.size;
}

async function submitScore(username: string, time: number, modeId: number) {
  try {
    const response = await fetch('/api/scores', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: username,
        score: time,
        modeId: modeId
      })
    })
    .then(res => res.json());

    if (response.error) throw new Error(response.error);
  } catch (err) {
    console.error(err);
    alert('Uh oh, something went wrong submitting your score D:');
  }
}

function revealMines(grid: GridObject[]): GridObject[] {
  for (const tile of grid) {
    if (tile.content === 'M') tile.isRevealed = true;
  }
  return grid;
}

function genGrid(width: number, height: number, numMines: number, clickIndex?: number) {
  const newGrid = Array.from<unknown, GridObject>({ length: width * height }, () => ({ content: '-', isRevealed: false, isFlagged: false }));
  const available = Object.keys(newGrid).filter((_, i) => i !== clickIndex);

  // For num mines, randomly assign to a grid location that has not been occupied yet
  for (let i = 0; i < numMines; i++) {
    const randIndex = Math.floor(Math.random() * available.length);
    const targetIndex = parseInt(available.splice(randIndex, 1)[0]);
    newGrid[targetIndex].content = 'M';
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

  // console.debug('New grid:', newGrid);
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
