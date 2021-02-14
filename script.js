const board = $('#board');
const boardArr = [];

let numRow = 20;
let numCol = 20;

let start;
let target;
let lastMouseEnteredCell;

const DIR = {
  NORTH: 'north',
  SOUTH: 'south',
  WEST: 'west',
  EAST: 'ease',
};

const INSPECTING_CELL_DURATION = 10;
const LAYING_PATH_DURATION = 50;

let hasPath = false;
let queue = [];
let path = [];
let visitedCells = [];
let wallCells = []

let isMouseDown = false;
let isMovingStart = false;
let isMovingTarget = false;
let isFirstRun = true;

let searchInterval;
let backTrackInterval;

const clearSearchResult = () => {
  queue = [start];

  for (const cell of path) {
    cell.classList.remove('path');
  }
  hasPath = false;
  path = [];

  for (const cell of visitedCells) {
    cell.isVisited = false;
    cell.classList.remove('visited');
  }
  visitedCells = [];
};

const layPath = (cell) => {
  cell.classList.add('path');
  path.push(cell);
  if (cell === start) {
    isFirstRun = false;
    board[0].classList.add('no-animation');
  } else {
    backTrack(cell.previous);
  }
};

const backTrack = (cell) => {
  if (isFirstRun) {
    setTimeout(() => layPath(cell), LAYING_PATH_DURATION);
  } else {
    layPath(cell);
  }
};

const visitCell = (previous, cell) => {
  if (cell && !cell.isVisited && (!cell.isWall || cell === target)) {
    cell.previous = previous;
    cell.isVisited = true;
    cell.classList.add('visited');
    visitedCells.push(cell);
    queue.push(cell);

    if (cell === target) {
      clearInterval(search);
      hasPath = true;
      backTrack(target);
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

const search = () => {
  if (queue.length > 0 && !hasPath) {
    visitNeighCells(queue[0]);
    queue.shift();
  } else {
    clearInterval(searchInterval);
  }
};

const calculateBoardSize = () => {
  const getLength = (cssAttribute) => {
    return jBoard.css(cssAttribute).replace('px', '');
  };

  const jBoard = $('#board');
  numCol = Math.floor(
    (getLength('width') -
      getLength('padding-left') -
      getLength('padding-right')) /
      30
  );
  numRow = Math.floor(
    (getLength('height') -
      getLength('padding-top') -
      getLength('padding-bottom')) /
      30
  );
};

const buildBoard = () => {
  calculateBoardSize();

  let rowInnerHTML = '';
  for (let i = 0; i < numRow; i++) {
    let colInnerHTML = '';
    for (let j = 0; j < numCol; j++) {
      colInnerHTML += '<div class="cell"></div>';
    }
    rowInnerHTML += `<div class="row">${colInnerHTML}</div>`;
  }

  board.html(rowInnerHTML);
};

const rerenderPath = () => {
  if (!isFirstRun) {
    clearSearchResult();
    while (queue.length > 0 && !hasPath) {
      search();
    }
  }
};

const buildWall = (cell) => {
  if (cell !== start && cell !== target) {
    wallCells.push(cell);
    cell.isWall = true;
    cell.classList.add('wall');
    rerenderPath();
  }
};

const mapBoarArr = () => {
  const rowEls = $('.row').toArray();
  rowEls.forEach((rowEl, rowIndex) => {
    const colEls = rowEl.childNodes;

    boardArr[rowIndex] = [];
    colEls.forEach((cell, colIndex) => {
      boardArr[rowIndex][colIndex] = cell;
      cell.location = { rowIndex, colIndex };

      cell.onmousedown = () => {
        buildWall(cell);
        isMouseDown = true;
        if (cell === start) {
          isMovingStart = true;
        } else if (cell === target) {
          isMovingTarget = true;
        }
      };

      cell.onmouseup = () => {
        isMouseDown = false;
        isMovingStart = false;
        isMovingTarget = false;
      };

      cell.onmouseenter = () => {
        if (isMouseDown) {
          if (isMovingStart) {
            start = cell === target ? lastMouseEnteredCell : cell;
            start.classList.add('start');
            start.classList.remove('wall');
            rerenderPath();
          } else if (isMovingTarget) {
            target = cell === start ? lastMouseEnteredCell : cell;
            target.classList.add('target');
            target.classList.remove('wall');
            rerenderPath();
          } else {
            buildWall(cell);
          }
        }
      };

      cell.onmouseleave = () => {
        lastMouseEnteredCell = cell;
        if (isMovingStart) {
          start.classList.remove('start');
          if (start.isWall) {
            start.classList.add('wall');
          }
          start = null;
        } else if (isMovingTarget) {
          target.classList.remove('target');
          if (target.isWall) {
            target.classList.add('wall');
          }
          target = null;
        }
      };

      cell.ondragstart = () => {
        return false;
      };
    });
  });
};

const mapNeighBours = () => {
  for (let rowIndex = 0; rowIndex < numRow; rowIndex++) {
    for (let colIndex = 0; colIndex < numCol; colIndex++) {
      const cell = boardArr[rowIndex][colIndex];
      cell.neigh = {
        north: rowIndex !== 0 ? boardArr[rowIndex - 1][colIndex] : null,
        south:
          rowIndex !== numRow - 1 ? boardArr[rowIndex + 1][colIndex] : null,
        east: colIndex !== 0 ? boardArr[rowIndex][colIndex - 1] : null,
        west: colIndex !== numCol - 1 ? boardArr[rowIndex][colIndex + 1] : null,
      };
    }
  }
};

const addStartAndTarget = () => {
  start = boardArr[Math.floor(numRow / 2)][Math.floor(numCol / 3)];
  target = boardArr[Math.floor(numRow / 2)][Math.floor((numCol * 2) / 3)];

  start.classList.add('start');
  target.classList.add('target');
};

document.querySelector('#start-btn').addEventListener('click', () => {
  if (start && target) {
    queue.push(start);
    searchInterval = setInterval(search, INSPECTING_CELL_DURATION);
  }
});

document.querySelector('#clear-btn').addEventListener('click', () => {
  clearSearchResult();
  for (const cell of wallCells) {
    cell.isWall = false;
    cell.classList.remove('wall');
  }
  wallCells = [];
});

buildBoard();
mapBoarArr();
mapNeighBours();
addStartAndTarget();
