import React from "react";
import GameBar from "./GameBar";
import GameBoard from "./GameBoard";
import { BoardOptions } from "../../App";
import { MulticlickHandler, ClickTypeMulti, ClickTypeMulti as CTM } from '../../utils/eventUtils';
import { TileContent } from '../../types/GridTypes';

export type GridSquareState = {
  content: TileContent,
  isRevealed: boolean,
  isFlagged: boolean
};

export type Grid = GridSquareState[];

type GameControllerProps = {
  onScoreSubmit: () => void,
  onModeChange: (mode: string) => void,
  children: JSX.Element[],
  difficulty: BoardOptions
}

const squareClickHandler = new MulticlickHandler();

// TODO: BUG: Occasional issues with negative mines and win condition not being met :/
// TODO: BUG: Flag count and likely revealed tile count does not get reset if restarting by clicking the board
// TODO: Remove game over popup - replace with some other kind of unobtrusive notification
// TODO: Question mark option
export default function GameController({ onScoreSubmit, onModeChange, difficulty, children }: GameControllerProps) {
  const { size, mines: numMines } = difficulty;
  
  const [grid, setGrid] = React.useState<Grid>([], );
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
  const handleValidSquareClick = (index: number, button: ClickTypeMulti): void => {
    const square = grid[index];
    // console.debug('Clicked square', index, ':', square.content);

    // Start timer if first click
    let generatedGrid: Grid | undefined;
    if (!gameActive) {
      // TODO: If board hasn't been reset since last game, prevent clicks until reset
      // TODO: Still show time after won/lost game
      setStartTime(Date.now());
      setGameActive(true);
      generatedGrid = genGrid(...size, numMines, index);
      setGrid(generatedGrid);
    }

    // TODO: Prevent overplacement of flags
    // Update grid state
    const newGrid = !gameActive ? generatedGrid! : [ ...grid ];

    switch (button) {
      case CTM.LEFT:
        if (!square.isRevealed && !square.isFlagged) revealTile(newGrid, index);
        break;
      case CTM.RIGHT:
        if (!square.isRevealed) flagTile(newGrid, index);
        break;
      case CTM.LEFT_RIGHT:
        if (square.isRevealed) {
          const adjFlags = countAdjacent('flags', newGrid, size[0], size[1], index);
          if (adjFlags === Number(square.content)) revealAdjTiles(newGrid, index);
        }
        break;
      default:
        return;
    }
  };

  const handleRawSquareClick = (index: number, event: React.MouseEvent) => {
    squareClickHandler.handleClick(event.nativeEvent, (button, maxButtons) => {
      handleValidSquareClick(index, maxButtons);
    });
  };

  /// Methods
  /** Reveals a tile and updates the board state */
  function revealTile (grid: Grid, index: number) {
    const newGrid = [ ...grid ];
    const newSquare: GridSquareState = { ...newGrid[index] };
    
    newSquare.isRevealed = true;

    // Check for win or loss
    if (newSquare.content === 'M') {
      console.log('Player lost');
      setGameActive(false);
      setGrid(revealMines(newGrid))
      // alert('Sssssssssss 🐍');
    }
    else if (newSquare.content === '0') {
      // Clear adjacent empty squares
      const revealed = cascadeEmpties(newGrid, index, ...size);
      setGrid(newGrid);
      setRemainingTiles((prev) => prev - revealed);
    }
    else {
      setRemainingTiles(prev => prev - 1);
    }

    newGrid[index] = newSquare;
    setGrid(newGrid);
  }

  /** Flags a tile and updates the board state */
  function flagTile(grid: Grid, index: number) {
    const newGrid = [ ...grid ];
    const newSquare = { ...newGrid[index] };

    newSquare.isFlagged = !newSquare.isFlagged;
    setNumFlags((prev) => prev + (newSquare.isFlagged ? 1 : -1));

    newGrid[index] = newSquare;
    setGrid(newGrid);
  }

  function revealAdjTiles(grid: Grid, index: number) {
    const [ width, height ] = size;
    const [ row, col ] = indexToCoord(index, width);

    for (let d_x = -1; d_x <= 1; d_x++) {
      for (let d_y = -1; d_y <= 1; d_y++) {
        if (d_x === 0 && d_y === 0) continue;

        const adjRow = row + d_y;
        const adjCol = col + d_x;
        if (!coordInBounds(adjRow, adjCol, width, height)) continue;

        const adjIndex = (adjRow * width) + adjCol;
        if (!grid[adjIndex].isFlagged && !grid[adjIndex].isRevealed) {
          console.debug(`Revealing [${adjCol}, ${adjRow}] : ${adjIndex}`);
          revealTile(grid, adjIndex);
        }
      }
    }
  }

  /**
   * Resets the grid, remaining squares, and start time
   */
  const startNewGame = () => {
    console.log('Starting new game');
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

      const username = prompt(`You win! :D\nIt took you ${totalTime} seconds\nEnter your name:`);
      if (username && typeof username === 'string') submitScore(username, totalTime, difficulty.modeId).then(onScoreSubmit);
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
        <GameBar onResetClick={startNewGame} startTime={startTime} gameActive={gameActive} remainingFlags={remainingFlags} />
        <GameBoard
          grid={grid}
          width={size[0]}
          height={size[1]}
          onSquareClick={handleRawSquareClick}
        />
      </div>
    </section>
  );
}

/// Auxiliary functions


function cascadeEmpties(grid: Grid, index: number, width: number, height: number, checked: Set<number> = new Set()) {
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

function coordInBounds(row: number, col: number, gridWidth: number, gridHeight: number) {
  return (
    row < 0 || row >= gridHeight ? false
    : col < 0 || col >= gridWidth ? false
    : true
  );
}

function revealMines(grid: Grid): Grid {
  for (const tile of grid) {
    if (tile.content === 'M') tile.isRevealed = true;
  }
  return grid;
}

function genGrid(width: number, height: number, numMines: number, clickIndex?: number) {
  const newGrid = Array.from<unknown, GridSquareState>({ length: width * height }, () => ({ content: '0', isRevealed: false, isFlagged: false }));
  const available = Object.keys(newGrid).filter((_, i) => i !== clickIndex);

  // For num mines, randomly assign to a grid location that has not been occupied yet
  for (let i = 0; i < numMines; i++) {
    const randIndex = Math.floor(Math.random() * available.length);
    const targetIndex = parseInt(available.splice(randIndex, 1)[0]);
    newGrid[targetIndex].content = 'M';
  }

  // Iterate through squares and determine number of adjacent mines
  // row = Math.floor(i / width), col = i % width
  for (let i = 0; i < newGrid.length; i++) {
    if (newGrid[i].content === 'M') continue;
    newGrid[i].content = countAdjacent('mines', newGrid, width, height, i).toString() as TileContent;
  }

  // console.debug('New grid:', newGrid);
  return newGrid;
}

function indexToCoord(index: number, gridWidth: number): [row: number, col: number] {
  const row = Math.floor(index / gridWidth), col = index % gridWidth;
  return [row, col];
}

function countAdjacent(type: 'mines' | 'flags', grid: Grid, gridWidth: number, gridHeight: number, index: number) {
  let adjCount = 0;
  const [ row, col ] = indexToCoord(index, gridWidth);
  // Iterate around adjacent squares
  for (let x = -1; x <= 1; x++) {
    const checkCol = col + x;
    if (checkCol < 0 || checkCol >= gridWidth) continue; // Prevent wrapping behavior

    for (let y = -1; y <= 1; y++) {
      const checkRow = row + y;
      if (x === 0 && y === 0 || checkRow < 0 || checkRow >= gridHeight) continue; // Prevent same square being checked and wrapping behavior

      // Determine index of adjacent square and check if it's a mine
      // i = width * r + c
      const index = checkRow * gridWidth + checkCol;

      if (type === 'mines' && grid[index]?.content === 'M') adjCount++;
      else if (type === 'flags' && grid[index]?.isFlagged) adjCount++;
    }
  }
  return adjCount;
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
