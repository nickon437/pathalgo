import { app, delay, markCellVisited } from './script.js';

const layPath = async (cell) => {
  if (app.isFirstRun) {
    await delay(app.LAYING_PATH_DURATION);
  }

  cell.classList.add('path');
  app.path.push(cell);

  if (cell === app.start) {
    app.isFirstRun = false;
  } else {
    layPath(cell.previous);
  }
};

const visitCell = async (previous, cell) => {
  if (cell && !cell.isVisited && (!cell.isWall || cell === app.target)) {
    if (app.isFirstRun) {
      await delay(app.INSPECTING_CELL_DURATION);
    }
    cell.previous = previous;
    markCellVisited(cell);

    if (cell === app.target) {
      app.hasPath = true;
      layPath(app.target);
      return;
    }

    await search(cell);
  }
};

const search = async (cell) => {
  const DIRECTIONS = ['north', 'east', 'south', 'west'];
  for (const dir of DIRECTIONS) {
    const neigh = cell.neigh[dir];
    await visitCell(cell, neigh);

    if (app.hasPath) {
      break;
    }
  }
};

const dfs = async () => {
  markCellVisited(app.start);

  await search(app.start);

  app.removeAnimationTimeout = setTimeout(() => {
    app.board.addClass('no-animation');
  }, 2000);

  if (!app.hasPath) {
    app.isFirstRun = false;
  }
};

export default dfs;
