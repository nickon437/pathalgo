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

  buildWall(1, app.numCol - 2, 1, app.numRow - 2, true);
};

const buildWall = async (
  lowerBoundIndex,
  upperBoundIndex,
  headIndex,
  tailIndex,
  isVerticalWall,
) => {
  if (upperBoundIndex - lowerBoundIndex - 2 < 1) {
    return false;
  }
  // if (bottomIndex - topIndex - 2 < 1) {
  //   return false;
  // }

  let wallIndex = randInRange(lowerBoundIndex + 1, upperBoundIndex - 1);
  const doorIndex = randInRange(headIndex, tailIndex);

  // num++;
  // console.log('left right top bottom', lowerBoundIndex, upperBoundIndex, headIndex, tailIndex, 'wallIndex', wallIndex, 'doorIndex', doorIndex);
  for (let i = headIndex; i <= tailIndex; i++) {
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
    const cell = isVerticalWall ? app.boardArr[i][wallIndex] : app.boardArr[wallIndex][i];
    cell.isWall = true;
    cell.classList.add('wall');
  }

  await buildWall(headIndex, tailIndex, lowerBoundIndex, wallIndex - 1, !isVerticalWall);
  await buildWall(headIndex, tailIndex, wallIndex + 1, upperBoundIndex, !isVerticalWall);

  return true;
};

export default buildRecursiveMaze;
