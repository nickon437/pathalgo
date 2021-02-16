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

const visitCell = (previous, cell) => {
  if (cell && !cell.isVisited && (!cell.isWall || cell === app.target)) {
    cell.previous = previous;
    markCellVisited(cell);

    if (cell === app.target) {
      app.hasPath = true;
      layPath(app.target);
    }
  }
};

const visitNeighCells = (cell) => {
  const { north, east, south, west } = cell.neigh;
  visitCell(cell, north);
  visitCell(cell, east);
  visitCell(cell, south);
  visitCell(cell, west);
};

const bfs = async () => {
  if (app.isFirstRun) {
    await delay(app.INSPECTING_CELL_DURATION);
  }

  const cell = app.queue.shift();
  if (!cell) {
    return null;
  }
  visitNeighCells(cell);

  // Allow rerendering when there is no path in first run
  if (app.queue.length <= 0) {
    app.isFirstRun = false;
  }

  if (app.queue.length <= 0 || app.hasPath) {
    app.removeAnimationTimeout = setTimeout(() => {
      app.board.addClass('no-animation');
    }, 2000);
  } else {
    bfs();
  }
};

export default bfs;
