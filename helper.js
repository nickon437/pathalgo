import dfs from './dfs.js';
import bfs from './bfs.js';
import { trimUserPath } from './manual-control.js';

const app = {
  board: $('#board'),
  boardArr: [],
  numRow: 20,
  numCol: 20,

  start: null,
  target: null,
  lastMouseEnteredCell: null,
  userPathHead: null,

  INSPECTING_CELL_DURATION: 5,
  LAYING_PATH_DURATION: 50,

  queue: [],
  userPath: [],
  path: [],
  visitedCells: [],
  wallCells: [],

  isMouseDown: false,
  isMovingStart: false,
  isMovingTarget: false,
  isSmashingWall: false,
  isFirstRun: true,
  hasPath: false,

  removeAnimationTimeout: null,

  selectedPathfindingAlgo: 'bfs',
};

const delay = async (duration) =>
  await new Promise((resolve) => setTimeout(resolve, duration));

const markCellVisited = (cell) => {
  app.visitedCells.push(cell);
  cell.classList.add('visited');
  cell.isVisited = true;

  app.queue.push(cell);
};

const markCellAsWall = (cell, shouldRerender = false) => {
  if (cell !== app.start && cell !== app.target) {
    cell.isWall = true;
    cell.classList.add('wall');
    app.wallCells.push(cell);

    if (app.userPath.includes(cell)) {
      const newHead = cell.previousUserPath;
      trimUserPath(newHead);
      newHead.classList.add('head');
    }

    if (shouldRerender) {
      rerenderPath();
    }
  }
};

const unmarkCellAsWall = (cell) => {
  cell.isWall = false;
  cell.classList.remove('wall');
  app.wallCells.filter((curCell) => curCell !== cell);
  rerenderPath();
};

const clearWalls = () => {
  while (app.wallCells.length > 0) {
    const cell = app.wallCells.shift();
    cell.isWall = false;
    cell.classList.remove('wall');
  }
};

const clearSearchResult = () => {
  app.queue = [];

  app.hasPath = false;
  while (app.path.length > 0) {
    const cell = app.path.shift();
    cell.classList.remove('path');
  }

  while (app.visitedCells.length > 0) {
    const cell = app.visitedCells.shift();
    cell.isVisited = false;
    cell.classList.remove('visited');
  }

  clearUserPath();
};

const clearUserPath = () => {
  while (app.userPath.length > 0) {
    const cell = app.userPath.shift();
    cell.classList.remove('user-path');
    cell.classList.remove('head');
    cell.previousUserPath = null;
  }
  app.userPath = [app.start];
  app.userPathHead = app.start;
};

const startPathFinding = () => {
  clearSearchResult();

  switch (app.selectedPathfindingAlgo) {
    case 'bfs':
      bfs();
      break;
    case 'dfs':
      dfs();
      break;
    default:
      break;
  }
};

const rerenderPath = () => {
  if (!app.isFirstRun) {
    startPathFinding();
  }
};

const rand = (max) => Math.floor(Math.random() * max + 1);
const randInRange = (min, max) => rand(max - min) + min - 1;

const getLast = (array) => {
  return array[array.length - 1];
};

export {
  app,
  delay,
  markCellVisited,
  markCellAsWall,
  unmarkCellAsWall,
  startPathFinding,
  rerenderPath,
  clearWalls,
  clearSearchResult,
  clearUserPath,
  rand,
  randInRange,
  getLast,
};
