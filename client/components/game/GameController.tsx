import GameBar from "./GameBar";
import GameBoard from "./GameBoard";
import { Gamemode } from '../../utils/gamemodes';
import { MulticlickHandler, ClickTypeMulti, ClickTypeMulti as CTM } from '../../utils/eventUtils';
import { GameState as GS, TileContent } from '../../types/GridTypes';
import promptModal from '../shared/modalHelper';
import { useEffect, useState, MouseEvent } from 'react';

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
  difficulty: Gamemode
}

const squareClickHandler = new MulticlickHandler();

export default function GameController({ onScoreSubmit, onModeChange, difficulty, children }: GameControllerProps) {
  const { size, mines: numMines } = difficulty;
  
  const [grid, setGrid] = useState<Grid>([], );
  /** Number of unrevealed tiles */
  const [remainingTiles, setRemainingTiles] = useState(size[0] * size[1]);
  const [startTime, setStartTime] = useState(-1);
  const [numFlags, setNumFlags] = useState(0);
  const [gameState, setGameState] = useState(GS.PRE_GAME);
  const [badRevealIndex, setBadRevealIndex] = useState(-1);


  /// Event handlers
  /**
   * On square click, set new grid state and check if player hit a mine or has won
   * @param index 
   */
  const handleValidSquareClick = (index: number, button: ClickTypeMulti): void => {
    const square = grid[index];
    // console.debug('Clicked square', index, ':', square.content);

    // Start timer and generate new board if first click
    const isPreGame = gameState === GS.PRE_GAME;
    let generatedGrid: Grid | undefined;
    if (isPreGame) {
      setStartTime(Date.now());
      setGameState(GS.IN_GAME);
      generatedGrid = genGrid(size[0], size[1], numMines, index);
      setGrid(generatedGrid);
    }

    // Update grid state
    const newGrid = (isPreGame ? generatedGrid! : [ ...grid ]);

    switch (button) {
      case CTM.LEFT:
        if (!square.isRevealed && !square.isFlagged) revealTile(index);
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

  const handleRawSquareClick = (index: number, event: MouseEvent) => {
    if (gameState === GS.POST_GAME_LOSS || gameState === GS.POST_GAME_WIN) return;
    
    squareClickHandler.handleClick(event.nativeEvent, (button, maxButtons) => {
      handleValidSquareClick(index, maxButtons);
    });
  };

  /// Methods
  /** Reveals a tile and updates the board state */
  function revealTile(index: number) {
    setGrid((prevGrid) => {
      if (prevGrid[index].isRevealed) return prevGrid;

      const newSquare: GridSquareState = { ...prevGrid[index] };
      
      newSquare.isRevealed = true;

      // Check for win or loss
      if (newSquare.content === 'M') {
        console.log('Player lost');
        setGameState(GS.POST_GAME_LOSS);
        setGrid((prevGrid) => revealMines(prevGrid, index))
        setBadRevealIndex(index);
      }
      else if (newSquare.content === '0') {
        // Clear adjacent empty squares
        const revealed = cascadeEmpties(prevGrid, index, ...size);
        setRemainingTiles((prev) => prev - revealed);
      }
      else {
        setRemainingTiles(prev => prev - 1);
      }

      const newGrid = [ ...prevGrid ];
      newGrid[index] = newSquare;
      return newGrid;
    });
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
          // console.debug(`Revealing [${adjCol}, ${adjRow}] : ${adjIndex}`);
          revealTile(adjIndex);
        }
      }
    }
  }

  /**
   * Resets the grid, remaining squares, and start time
   */
  const startNewGame = () => {
    console.log('Starting new game');
    // Set grid here just to fill out spaces when awaiting to start new game
    setGrid(genGrid(...size, numMines));
    setRemainingTiles(size[0] * size[1]);
    setStartTime(-1);
    setNumFlags(0);
    setGameState(GS.PRE_GAME);
  }

  /// Effects
  // Reset grid on grid size change
  useEffect(() => {
    startNewGame();
  }, [size]);

  // Check if player has won when remaining number of mines changes
  useEffect(() => {
    // console.debug('Remaining:', remainingTiles);
    if (remainingTiles === numMines) {
      console.log('Player won!');

      const totalTime = Math.floor((Date.now() - startTime) / 1000);
      setGameState(GS.POST_GAME_WIN);

      promptModal(`You win! :D\nIt took you ${totalTime} seconds\nEnter your name:`)
      .then(({ input: username, cancelled }) => {
        // console.debug('Submitting score:', { username, totalTime, difficulty: difficulty.modeId });
        if (username && typeof username === 'string') submitScore(username, totalTime, difficulty.modeId).then(onScoreSubmit);
      });
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
        <GameBar onResetClick={startNewGame} startTime={startTime} gameState={gameState} remainingFlags={remainingFlags} />
        <GameBoard
          grid={grid}
          width={size[0]}
          height={size[1]}
          onSquareClick={handleRawSquareClick}
          badRevealIndex={badRevealIndex}
        />
      </div>
    </section>
  );
}

/// Auxiliary functions


function cascadeEmpties(grid: Grid, index: number, width: number, height: number) {
  // console.log(index, ':', grid[index].content, ':', grid[index].isRevealed);
  const checked: Set<number> = new Set();
  let revealed = 0;

  function cascadeHelper(index: number) {
    if (!grid[index].isFlagged) {
      grid[index] = {
        ...grid[index],
        isRevealed: true
      };
      revealed++;
    }

    checked.add(index);
    if (grid[index].content !== '0') return;

    const row = Math.floor(index / width), col = index % width;
    
    // Iterate around adjacent squares
    for (let x = -1; x <= 1; x++) {
      const checkCol = col + x;
      if (checkCol < 0 || checkCol >= width) continue; // Prevent wrapping behavior
  
      for (let y = -1; y <= 1; y++) {
        const checkRow = row + y;
        if (x === 0 && y === 0 || checkRow < 0 || checkRow >= height) continue; // Prevent same square being checked and wrapping behavior
  
        const checkIndex = checkRow * width + checkCol;
        if (!checked.has(checkIndex) && !grid[checkIndex].isRevealed) cascadeHelper(checkIndex);
      }
    }
  }
  cascadeHelper(index);

  return revealed;
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

function revealMines(grid: Grid, clickIndex?: number): Grid {
  for (const tile of grid) {
    // Reveal all of both mines and falsely flagged non-mines
    if ((tile.content !== 'M' && tile.isFlagged) || tile.content === 'M') tile.isRevealed = true;
  }
  return grid;
}

function genGrid(width: number, height: number, numMines: number, clickIndex = 0) {
  const newGrid = Array.from<unknown, GridSquareState>({ length: width * height }, () => ({ content: '0', isRevealed: false, isFlagged: false }));

  // Clear a 3x3 zone around where the player clicks to give better starts
  /** Whether or not the clear line should be vertical or horizontal */
  const [ clickRow, clickCol ] = indexToCoord(clickIndex, width);

  const zoneTiles = new Set<number>();

  // Determine the ideal boundaries for the zone, and how much of it would remain out of bounds
  const idealMinY = clickRow - 1;
  const idealMaxY = clickRow + 1;
  const idealMinX = clickCol - 1;
  const idealMaxX = clickCol + 1;
  const topRemain = Math.max(0, 0 - idealMinY);
  const bottomRemain = Math.max(0, idealMaxY - height);
  const leftRemain = Math.max(0, 0 - idealMinX);
  const rightRemain = Math.max(0, idealMaxX - width);

  // If line top would be below 0, use 0
  // Try to add any part of the line that is out of bounds to the other side
  const zoneTop = Math.max(0, idealMinY - bottomRemain);
  const zoneBottom = Math.min(height - 1, idealMaxY + topRemain);
  const zoneLeft = Math.max(0, idealMinX - rightRemain);
  const zoneRight = Math.min(width - 1, idealMaxX + leftRemain);

  // Push indexes of tiles within line bounds
  for (let x = zoneLeft; x <= zoneRight; x++)
    for (let y = zoneTop; y <= zoneBottom; y++)
      zoneTiles.add(coordToIndex(x, y, width));

  // Add the clickIndex just for safe measure
  zoneTiles.add(clickIndex);
  
  // Create an array of which tiles (indexes) are still available
  const available = Object.keys(newGrid).filter((_, i) => {
    return !zoneTiles.has(i);
  });

  // For num mines, randomly assign to a grid location that has not been occupied yet
  // To have random clear around starting click:
    // At starting index, create a shape of size X and remove from available tiles
      // Add 1 layer of padding around the edge 
  for (let i = 0; i < numMines; i++) {
    const randIndex = Math.floor(Math.random() * available.length);
    const targetIndex = parseInt(available.splice(randIndex, 1)[0]);
    newGrid[targetIndex].content = 'M';
  }

  // Iterate through squares and determine the number of adjacent mines to each tile
  // row = Math.floor(i / width), col = i % width
  for (let i = 0; i < newGrid.length; i++) {
    if (newGrid[i].content === 'M') continue;
    newGrid[i].content = countAdjacent('mines', newGrid, width, height, i).toString() as TileContent;
  }

  // console.debug('New grid:', newGrid);
  return newGrid;
}

function indexToCoord(index: number, gridWidth: number): [row: number, col: number] {
  const row = Math.floor(index / gridWidth);
  const col = index % gridWidth;
  return [row, col];
}

function coordToIndex(x: number, y: number, gridWidth: number): number {
  return gridWidth * y + x;
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
