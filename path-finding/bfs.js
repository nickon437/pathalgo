import { app, delay, markCellVisited, clearSearchResult } from '../helper';

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
    }
    return true;
  }
  return false;
};

const search = async (cell) => {
  const DIRECTIONS = ['north', 'east', 'south', 'west'];
  for (const dir of DIRECTIONS) {
    const neigh = cell.neigh[dir];
    const isVisitable = await visitCell(cell, neigh);
    if (isVisitable) {
      app.queue.push(neigh);
    }
  }

  if (app.hasPath || app.queue.length <= 0) {
    return;
  }

  // Early termination if user clear while searching
  if (app.state !== 'searching') {
    clearSearchResult();
    return;
  }

  await search(app.queue.shift());
};

const bfs = async () => {
  markCellVisited(app.start);

  await search(app.queue.shift());

  if (app.state !== 'searching') {
    return;
  }

  app.removeAnimationTimeout = setTimeout(() => {
    app.board.addClass('no-animation');
  }, 2000);

  if (!app.hasPath) {
    app.isFirstRun = false;
  }

  app.state = 'finished';
};

export default bfs;
