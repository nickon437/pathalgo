import {
  app,
  delay,
  markCellAsWall,
  rand,
  unmarkCellAsWall,
} from '../helper';

const DIRECTIONS = ['north', 'east', 'south', 'west'];

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
  for (const cell of $('.cell').toArray()) {
    markCellAsWall(cell);
  }
};

const mgDfs = async () => {
  markAllCellsAsWall();

  const cell = app.boardArr[rand(app.numRow) - 1][rand(app.numCol) - 1];
  const stack = [cell];
  unmarkCellAsWall(cell);

  while (stack.length > 0) {
    const curCell = stack.pop();

    const unvisitedNeigh = [];
    for (const dir of DIRECTIONS) {
      const neigh = curCell.neigh[dir];
      if (neigh?.isWall && isOneWayCell(neigh)) {
        unvisitedNeigh.push(neigh);
      }
    }

    if (unvisitedNeigh.length > 0) {
      await delay(app.INSPECTING_CELL_DURATION);
      const neigh = unvisitedNeigh[rand(unvisitedNeigh.length) - 1];
      stack.push(curCell, neigh);
      unmarkCellAsWall(neigh);
    }
  }
};

export default mgDfs;
