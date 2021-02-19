import { app, delay } from './script.js';

const rand = (max) => Math.floor(Math.random() * max + 1);
const randInRange = (min, max) => rand(max - min) + min - 1;

const setCellAsWall = (cell) => {
  cell.isWall = true;
  cell.classList.add('wall');
  app.wallCells.push(cell);
};

const buildSurroundingWalls = async () => {
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
};

const buildRecursiveMaze = async () => {
  await buildSurroundingWalls();

  const room = {
    lowerBoundIndex: 1,
    upperBoundIndex: app.numCol - 2,
    headIndex: 1,
    tailIndex: app.numRow - 2,
    isVerticalWall: true,
  };
  await buildWall(room);
};

const hasFoundation = (wallIndex, headIndex, tailIndex, isVerticalWall) => {
  return (
    getCell(wallIndex, headIndex - 1, isVerticalWall).isWall ||
    getCell(wallIndex, tailIndex + 1, isVerticalWall).isWall
  );
};

const generateWallIndex = (room) => {
  const {
    lowerBoundIndex,
    upperBoundIndex,
    headIndex,
    tailIndex,
    isVerticalWall,
  } = room;
  let hasPotentialWall = false;
  for (let i = lowerBoundIndex + 1; i < upperBoundIndex; i += 2) {
    hasPotentialWall = hasFoundation(i, headIndex, tailIndex, isVerticalWall);
    if (hasPotentialWall) {
      break;
    }
  }

  if (!hasPotentialWall) {
    return -1;
  }

  let wallIndex =
    rand((upperBoundIndex - lowerBoundIndex) / 2) * 2 + lowerBoundIndex - 1;
  while (!hasFoundation(wallIndex, headIndex, tailIndex, isVerticalWall)) {
    wallIndex =
      rand((upperBoundIndex - lowerBoundIndex) / 2) * 2 + lowerBoundIndex - 1;
  }

  return wallIndex;
};

const orientWall = async (room) => {
  const {
    lowerBoundIndex,
    upperBoundIndex,
    headIndex,
    tailIndex,
    isVerticalWall,
  } = room;

  const boundLength = upperBoundIndex - lowerBoundIndex;
  const wallLength = tailIndex - headIndex;

  let sameOrientationAsParent = true;
  if (boundLength < wallLength) {
    sameOrientationAsParent = false;
  } else if (boundLength === wallLength) {
    sameOrientationAsParent = rand(2) === 1;
  }

  if (sameOrientationAsParent) {
    await buildWall(room);
  } else {
    await buildWall({
      lowerBoundIndex: headIndex,
      upperBoundIndex: tailIndex,
      headIndex: lowerBoundIndex,
      tailIndex: upperBoundIndex,
      isVerticalWall: !isVerticalWall,
    });
  }
};

const getCell = (wallIndex, boundIndex, isVerticalWall) => {
  return isVerticalWall
    ? app.boardArr[boundIndex][wallIndex]
    : app.boardArr[wallIndex][boundIndex];
};

const buildWall = async (room) => {
  const {
    lowerBoundIndex,
    upperBoundIndex,
    headIndex,
    tailIndex,
    isVerticalWall,
  } = room;

  if (upperBoundIndex - lowerBoundIndex - 2 < 0 || tailIndex - headIndex < 1) {
    return false;
  }

  let wallIndex = generateWallIndex(room);
  const doorIndex = randInRange(headIndex, tailIndex);

  if (wallIndex === -1) {
    return false;
  }

  for (let i = headIndex; i <= tailIndex; i++) {
    if (
      i === doorIndex ||
      (i === app.start.location.rowIndex &&
        wallIndex === app.start.location.colIndex) || // Current cell is start cell
      (i === app.target.location.rowIndex &&
        wallIndex === app.target.location.colIndex) // Current cell is target cell
    ) {
      continue;
    }

    await delay(app.INSPECTING_CELL_DURATION);
    let cell = getCell(wallIndex, i, isVerticalWall);

    if (
      (i === headIndex &&
        !getCell(wallIndex, headIndex - 1, isVerticalWall).isWall) || // Head is next to a door
      (i === tailIndex &&
        !getCell(wallIndex, tailIndex + 1, isVerticalWall).isWall) // Tail is next to a door)
    ) {
      cell = getCell(wallIndex, doorIndex, isVerticalWall);
    }

    setCellAsWall(cell);
  }

  await orientWall({ ...room, upperBoundIndex: wallIndex - 1 });
  await orientWall({ ...room, lowerBoundIndex: wallIndex + 1 });

  return true;
};

export default buildRecursiveMaze;
