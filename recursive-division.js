import { app, delay } from './script.js';

const rand = (max) => Math.floor(Math.random() * max + 1);
const randInRange = (min, max) => rand(max - min) + min - 1;
let num = 0;
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
        cell.isWall = true;
        cell.classList.add('wall');
      }
    }
  }

  buildVerticalWall(1, app.numCol - 2, 1, app.numRow - 2);
};

const buildVerticalWall = async (
  leftIndex,
  rightIndex,
  topIndex,
  bottomIndex
) => {
  if (rightIndex - leftIndex - 2 < 1) {
    return false;
  }
  // if (bottomIndex - topIndex - 2 < 1) {
  //   return false;
  // }

  let wallIndex = randInRange(leftIndex + 1, rightIndex - 1);
  const doorIndex = randInRange(topIndex, bottomIndex);

  num++;
  console.log('left right top bottom', leftIndex, rightIndex, topIndex, bottomIndex, 'wallIndex', wallIndex, 'doorIndex', doorIndex);
  for (let i = topIndex; i <= bottomIndex; i++) {
    if (
      i === doorIndex ||
      (i === app.start.location.rowIndex &&
        wallIndex === app.start.location.colIndex) ||
      (i === app.target.location.rowIndex &&
        wallIndex === app.target.location.colIndex)
    ) {
      continue;
    }

    await delay(100);
    const cell = app.boardArr[i][wallIndex];
    cell.isWall = true;
    cell.classList.add('wall');

  }

  await buildHorizontallWall(topIndex, bottomIndex, leftIndex, wallIndex - 1);
  await buildHorizontallWall(topIndex, bottomIndex, wallIndex + 1, rightIndex);

  return true;
};


const buildHorizontallWall = async (
  topIndex,
  bottomIndex,
  leftIndex,
  rightIndex,
) => {
  if (num >= 100) return;
  if (bottomIndex - topIndex - 2 < 1) {
    return false;
  }

  // if (rightIndex - leftIndex - 2 < 1) {
  //   return false;
  // }
  let wallIndex = randInRange(topIndex + 1, bottomIndex - 1);
  const doorIndex = randInRange(leftIndex, rightIndex);
  
  num++;
  console.log('top bottom left right', topIndex, bottomIndex, leftIndex, rightIndex, 'wallIndex', wallIndex, 'doorIndex', doorIndex);
  for (let i = leftIndex; i <= rightIndex; i++) {
    if (
      i === doorIndex ||
      (i === app.start.location.rowIndex &&
        wallIndex === app.start.location.colIndex) ||
      (i === app.target.location.rowIndex &&
        wallIndex === app.target.location.colIndex)
    ) {
      continue;
    }

    await delay(100);
    const cell = app.boardArr[wallIndex][i];
    cell.isWall = true;
    cell.classList.add('wall');

  }

  await buildVerticalWall(leftIndex, rightIndex, topIndex, wallIndex - 1);
  await buildVerticalWall(leftIndex, rightIndex, wallIndex + 1, bottomIndex);

  return true;
};

export default buildRecursiveMaze;
