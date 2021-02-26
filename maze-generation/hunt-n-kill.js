import { app, rand, markCellAsWall, unmarkCellAsWall, delay } from '../helper';

const DIRECTIONS = ['north', 'east', 'south', 'west'];

const randomizeStartingCell = () => {
  const rowIndex = rand(app.numRow) - 1;
  const colIndex = rand(app.numCol) - 1;
  return app.boardArr[rowIndex][colIndex];
}

const isOneWayCell = (cell) => {
  let numSurroundingWalls = 0;

  for (const dir of DIRECTIONS) {
    const neigh = cell.neigh[dir];
    if (!neigh || neigh === app.start || neigh === app.target || neigh.isWall) {
      numSurroundingWalls++;
    }
  }
  
  return numSurroundingWalls === 3;
};

const markAllCellsAsWall = () => {
  for (const cell of $('.row .cell').toArray()) {
    markCellAsWall(cell);
  }
};

const getNeighs = (cell, isWall) => {
  const neighs = [];
  for (const dir of DIRECTIONS) {
    const neigh = cell.neigh[dir];
    if (neigh && neigh.isWall === isWall && isOneWayCell(neigh)) {
      neighs.push(neigh);
    }
  }
  return neighs;
}

const getRandNeigh = (cell, isWall) => {
  const neighs = getNeighs(cell, isWall);
  const selectedIndex = rand(neighs.length) - 1;
  return selectedIndex >= 0 ? neighs[selectedIndex] : null;
}

const walk = async (cell) => {
  await delay(app.INSPECTING_CELL_DURATION);
  unmarkCellAsWall(cell);

  const nextCell = getRandNeigh(cell, true);
  if (nextCell) {
    await walk(nextCell);
  }
}

const hunt = () => {
  for (let rowIndex = 0; rowIndex < app.numRow; rowIndex++) {
    for (let colIndex = 0; colIndex < app.numCol; colIndex++) {
      const cell = app.boardArr[rowIndex][colIndex];
      if (isOneWayCell(cell) && cell.isWall) {
        return cell;
      }
    }
  }
}

const huntNKill = async () => {
  markAllCellsAsWall();

  let startingCell = randomizeStartingCell();
  while (startingCell) {
    await walk(startingCell);
    startingCell = hunt();
  }
}

export default huntNKill;