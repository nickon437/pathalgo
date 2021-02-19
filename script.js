import bfs from './bfs.js';
import dfs from './dfs.js';
import buildBasicRandMaze from './basic-rand-maze.js';
import buildRecursiveMaze from './recursive-division.js';

const CELL_SIZE = 25;

const app = {
  board: $('#board'),
  boardArr: [],
  numRow: 20,
  numCol: 20,

  start: null,
  target: null,
  lastMouseEnteredCell: null,

  INSPECTING_CELL_DURATION: 5,
  LAYING_PATH_DURATION: 50,

  queue: [],
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
};

const pfAlgorithm = $('#path-finding-algorithm');

const delay = async (duration) =>
  await new Promise((resolve) => setTimeout(resolve, duration));

const markCellVisited = (cell) => {
  app.visitedCells.push(cell);
  cell.classList.add('visited');
  cell.isVisited = true;

  app.queue.push(cell);
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
};

const calculateBoardSize = () => {
  const getLength = (cssAttribute) => {
    return app.board.css(cssAttribute).replace('px', '');
  };

  app.numCol = Math.floor(
    (getLength('width') -
      getLength('padding-left') -
      getLength('padding-right')) /
      CELL_SIZE
  );
  app.numRow = Math.floor(
    (getLength('height') -
      getLength('padding-top') -
      getLength('padding-bottom')) /
      CELL_SIZE
  );
};

const buildBoard = () => {
  calculateBoardSize();

  let rowInnerHTML = '';
  for (let i = 0; i < app.numRow; i++) {
    let colInnerHTML = '';
    for (let j = 0; j < app.numCol; j++) {
      colInnerHTML += '<div class="cell"></div>';
    }
    rowInnerHTML += `<div class="row">${colInnerHTML}</div>`;
  }

  app.board.html(rowInnerHTML);
};

const startPathFinding = () => {
  switch (pfAlgorithm.val()) {
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
    clearSearchResult();
    startPathFinding();
  }
};

const buildWall = (cell) => {
  if (cell !== app.start && cell !== app.target) {
    app.wallCells.push(cell);
    cell.isWall = true;
    cell.classList.add('wall');
    rerenderPath();
  }
};

const smashWall = (cell) => {
  cell.isWall = false;
  cell.classList.remove('wall');
  app.wallCells.filter((curCell) => curCell !== cell);
  rerenderPath();
};

const mapBoarArr = () => {
  const rowEls = $('.row').toArray();
  rowEls.forEach((rowEl, rowIndex) => {
    const colEls = rowEl.childNodes;

    app.boardArr[rowIndex] = [];
    colEls.forEach((cell, colIndex) => {
      app.boardArr[rowIndex][colIndex] = cell;
      cell.location = { rowIndex, colIndex };

      cell.oncontextmenu = (e) => {
        e.preventDefault();
      };

      cell.onmousedown = () => {
        app.isMouseDown = true;
        if (cell === app.start) {
          app.isMovingStart = true;
        } else if (cell === app.target) {
          app.isMovingTarget = true;
        } else {
          if (cell.isWall) {
            app.isSmashingWall = true;
            smashWall(cell);
          } else {
            buildWall(cell);
          }
        }
      };

      cell.onmouseup = () => {
        app.isMouseDown = false;
        app.isMovingStart = false;
        app.isMovingTarget = false;
        app.isSmashingWall = false;
      };

      cell.onmouseenter = () => {
        if (app.isMouseDown) {
          if (app.isMovingStart) {
            app.start = cell === app.target ? app.lastMouseEnteredCell : cell;
            app.start.classList.add('start');
            app.start.classList.remove('wall');
            rerenderPath();
          } else if (app.isMovingTarget) {
            app.target = cell === app.start ? app.lastMouseEnteredCell : cell;
            app.target.classList.add('target');
            app.target.classList.remove('wall');
            rerenderPath();
          } else if (app.isSmashingWall) {
            smashWall(cell);
          } else {
            buildWall(cell);
          }
        }
      };

      cell.onmouseleave = () => {
        app.lastMouseEnteredCell = cell;
        if (app.isMovingStart) {
          app.start.classList.remove('start');
          if (app.start.isWall) {
            app.start.classList.add('wall');
          }
          app.start = null;
        } else if (app.isMovingTarget) {
          app.target.classList.remove('target');
          if (app.target.isWall) {
            app.target.classList.add('wall');
          }
          app.target = null;
        }
      };

      cell.ondragstart = () => {
        return false;
      };
    });
  });
};

const mapNeighBours = () => {
  for (let rowIndex = 0; rowIndex < app.numRow; rowIndex++) {
    for (let colIndex = 0; colIndex < app.numCol; colIndex++) {
      const cell = app.boardArr[rowIndex][colIndex];
      cell.neigh = {
        north: rowIndex !== 0 ? app.boardArr[rowIndex - 1][colIndex] : null,
        south:
          rowIndex !== app.numRow - 1
            ? app.boardArr[rowIndex + 1][colIndex]
            : null,
        east:
          colIndex !== app.numCol - 1
            ? app.boardArr[rowIndex][colIndex + 1]
            : null,
        west: colIndex !== 0 ? app.boardArr[rowIndex][colIndex - 1] : null,
      };
    }
  }
};

const addStartAndTarget = () => {
  app.start =
    app.boardArr[Math.floor(app.numRow / 2)][Math.floor(app.numCol / 3)];
  app.target =
    app.boardArr[Math.floor(app.numRow / 2)][Math.floor((app.numCol * 2) / 3)];

  app.start.classList.add('start');
  app.target.classList.add('target');
};

document.querySelector('#start-btn').addEventListener('click', () => {
  if (app.start && app.target) {
    startPathFinding();
  }
});

document.querySelector('#clear-btn').addEventListener('click', () => {
  clearSearchResult();

  while (app.wallCells.length > 0) {
    const cell = app.wallCells.shift();
    cell.isWall = false;
    cell.classList.remove('wall');
  }

  app.isFirstRun = true;
  app.board.removeClass('no-animation');
  clearTimeout(app.removeAnimationTimeout); // For edge case, when board is cleared during board is waiting for no-animation to be added
});

document.querySelector('#basic-rand-maze-btn').addEventListener('click', () => {
  buildBasicRandMaze();
  rerenderPath();
});

buildBoard();
mapBoarArr();
mapNeighBours();
addStartAndTarget();
buildRecursiveMaze();

export { app, delay, markCellVisited };
