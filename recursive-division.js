import { app, delay } from './script.js';

const rand = (max) => Math.floor(Math.random() * max + 1);
const randInRange = (min, max) => rand(max - min) + min - 1;

const ORIENTATION = {
  VERTICAL: 'vertical',
  HORIZONTAL: 'horizontal',
};

const setCellAsWall = (cell) => {
  cell.isWall = true;
  cell.classList.add('wall');
  app.wallCells.push(cell);
}

// TODO: Set minimum row and col.. maybe 7 ???
const buildRecursiveMaze = async () => {
  for (let rowIndex = 0; rowIndex < app.numRow; rowIndex++) {
    for (let colIndex = 0; colIndex < app.numCol; colIndex++) {
      if (
        rowIndex === 0 ||
        rowIndex === app.numRow - 1 ||
        colIndex === 0 ||
        colIndex === app.numCol - 1
      ) {
        await delay(app.INSPECTING_CELL_DURATION);
        const cell = app.boardArr[rowIndex][colIndex];
        setCellAsWall(cell);
      }
    }
  }

  buildWall(1, app.numCol - 2, 1, app.numRow - 2, true);
};

const isConnectedWithAWall = (
  wallIndex,
  headIndex,
  tailIndex,
  isVerticalWall
) => {
  if (isVerticalWall) {
    if (
      app.boardArr[headIndex - 1][wallIndex].isWall ||
      app.boardArr[tailIndex + 1][wallIndex].isWall
    ) {
      return true;
    }
  } else {
    if (
      app.boardArr[wallIndex][headIndex - 1].isWall ||
      app.boardArr[wallIndex][tailIndex + 1].isWall
    ) {
      return true;
    }
  }
  return false;
};

const generateWallIndex = (
  lowerBoundIndex,
  upperBoundIndex,
  headIndex,
  tailIndex,
  isVerticalWall
) => {
  let hasPotentialWall = false;
  for (let i = lowerBoundIndex; i < upperBoundIndex; i++) {
    hasPotentialWall = isConnectedWithAWall(
      i,
      headIndex,
      tailIndex,
      isVerticalWall
    );
    if (hasPotentialWall) {
      break;
    }
  }

  if (!hasPotentialWall) {
    return -1;
  }

  let wallIndex = randInRange(lowerBoundIndex, upperBoundIndex);
  while (
    !isConnectedWithAWall(wallIndex, headIndex, tailIndex, isVerticalWall)
  ) {
    wallIndex = randInRange(lowerBoundIndex, upperBoundIndex);
  }

  return wallIndex;
};

const orientWall = async (
  lowerBoundIndex,
  upperBoundIndex,
  headIndex,
  tailIndex,
  isParentVerticalWall
) => {
  if (isParentVerticalWall) {
    console.log('top down left right', headIndex, tailIndex, lowerBoundIndex, upperBoundIndex);
  } else {
    console.log('top down left right', lowerBoundIndex, upperBoundIndex, headIndex, tailIndex);
  }

  const boundLength = upperBoundIndex - lowerBoundIndex;
  const wallLength = tailIndex - headIndex;

  let sameOrientationAsParent = true;
  if (boundLength < wallLength) {
    sameOrientationAsParent = false;
  } else if(boundLength === wallLength) {
    sameOrientationAsParent = rand(2) === 1;
  }

  if (sameOrientationAsParent) {
    await buildWall(lowerBoundIndex, upperBoundIndex, headIndex, tailIndex, isParentVerticalWall);
  } else {
    await buildWall(headIndex, tailIndex, lowerBoundIndex, upperBoundIndex, !isParentVerticalWall);
  }
};

const getCell = (wallIndex, boundIndex, isVerticalWall) => {
  if (isVerticalWall) {
    // console.log('rowInd, colIndex', boundIndex, wallIndex);
    return app.boardArr[boundIndex][wallIndex];
  }
  // console.log('rowInd, colIndex', wallIndex, boundIndex);
  return app.boardArr[wallIndex][boundIndex];
}

const buildWall = async (
  lowerBoundIndex,
  upperBoundIndex,
  headIndex,
  tailIndex,
  isVerticalWall
) => {
  if (upperBoundIndex - lowerBoundIndex - 2 < 0 || tailIndex - headIndex < 1) {
    console.log('termniate: no available space')
    return false;
  }

  // if (num >= 50) return;
  // if (bottomIndex - topIndex - 2 < 1) {
  //   return false;
  // }

  let wallIndex = generateWallIndex(
    lowerBoundIndex + 1,
    upperBoundIndex - 1,
    headIndex,
    tailIndex,
    isVerticalWall
  );
  const doorIndex = randInRange(headIndex, tailIndex);

  if (wallIndex === -1) {
    console.log('terminate: no valid wall');
    return false;
  }

  // num++;
  if (isVerticalWall) {
    console.log('top down left right', headIndex, tailIndex, lowerBoundIndex, upperBoundIndex, 'wallIndex', wallIndex, 'doorIndex', doorIndex, isVerticalWall);
  } else {
    console.log('top down left right', lowerBoundIndex, upperBoundIndex, headIndex, tailIndex, 'wallIndex', wallIndex, 'doorIndex', doorIndex, isVerticalWall);
  }
  // console.log('left right top bottom', lowerBoundIndex, upperBoundIndex, headIndex, tailIndex, 'wallIndex', wallIndex, 'doorIndex', doorIndex);
  for (let i = headIndex; i <= tailIndex; i++) {
    if (
      i === doorIndex ||
      (i === app.start.location.rowIndex &&
        wallIndex === app.start.location.colIndex) || // Current cell is start cell
      (i === app.target.location.rowIndex &&
        wallIndex === app.target.location.colIndex)// Current cell is target cell
      
    ) {
      continue;
    }

    if ((i === headIndex && !getCell(wallIndex, headIndex - 1, isVerticalWall).isWall) || // Head is next to a door
      (i === tailIndex && !getCell(wallIndex, tailIndex + 1, isVerticalWall).isWall) // Tail is next to a door)
    ) {
      await delay(100);
      const cell = isVerticalWall
        ? app.boardArr[doorIndex][wallIndex]
        : app.boardArr[wallIndex][doorIndex];
      setCellAsWall(cell);
      continue;
    }

    await delay(100);
    const cell = isVerticalWall
      ? app.boardArr[i][wallIndex]
      : app.boardArr[wallIndex][i];
    setCellAsWall(cell);
  }

  await orientWall(lowerBoundIndex, wallIndex - 1, headIndex, tailIndex, isVerticalWall);
  await orientWall(wallIndex + 1, upperBoundIndex, headIndex, tailIndex, isVerticalWall);
  // await buildWall(
  //   headIndex,
  //   tailIndex,
  //   lowerBoundIndex,
  //   wallIndex - 1,
  //   !isVerticalWall
  // );

  // await buildWall(
  //   headIndex,
  //   tailIndex,
  //   wallIndex + 1,
  //   upperBoundIndex,
  //   !isVerticalWall
  // );

  return true;
};

export default buildRecursiveMaze;
