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

const INSPECTING_CELL_DURATION = 5;
const LAYING_PATH_DURATION = 50;

let hasPath = false;
let queue = [];
let path = [];
let visitedCells = [];
let wallCells = [];

let isMouseDown = false;
let isMovingStart = false;
let isMovingTarget = false;
let isSmashingWall = false;
let isFirstRun = true;

let removeAnimationTimeout;

const delay = async (duration) =>
  await new Promise((resolve) => setTimeout(resolve, duration));

const markCellVisited = (cell) => {
  visitedCells.push(cell);
  cell.classList.add('visited');
  cell.isVisited = true;

  queue.push(cell);
};

const clearSearchResult = () => {
  queue = [];

  hasPath = false;
  while (path.length > 0) {
    const cell = path.shift();
    cell.classList.remove('path');
  }

  while (visitedCells.length > 0) {
    const cell = visitedCells.shift();
    cell.isVisited = false;
    cell.classList.remove('visited');
  }
};

const layPath = async (cell) => {
  if (isFirstRun) {
    await delay(LAYING_PATH_DURATION);
  }

  cell.classList.add('path');
  path.push(cell);
  if (cell === start) {
    isFirstRun = false;
  } else {
    layPath(cell.previous);
  }
};

const visitCell = (previous, cell) => {
  if (cell && !cell.isVisited && (!cell.isWall || cell === target)) {
    cell.previous = previous;
    markCellVisited(cell);

    if (cell === target) {
      hasPath = true;
      layPath(target);
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

const search = async () => {
  if (isFirstRun) {
    await delay(INSPECTING_CELL_DURATION);
  }

  const cell = queue.shift();
  if (!cell) {
    return null;
  }
  visitNeighCells(cell);

  // Allow rerendering when there is no path in first run
  if (queue.length <= 0) {
    isFirstRun = false;
  }

  if (queue.length <= 0 || hasPath) {
    removeAnimationTimeout = setTimeout(() => {
      board.addClass('no-animation');
    }, 2000);
  } else {
    search();
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
    markCellVisited(start);
    search();
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

const smashWall = (cell) => {
  cell.isWall = false;
  cell.classList.remove('wall');
  wallCells.filter((curCell) => curCell !== cell);
  rerenderPath();
};

const mapBoarArr = () => {
  const rowEls = $('.row').toArray();
  rowEls.forEach((rowEl, rowIndex) => {
    const colEls = rowEl.childNodes;

    boardArr[rowIndex] = [];
    colEls.forEach((cell, colIndex) => {
      boardArr[rowIndex][colIndex] = cell;
      cell.location = { rowIndex, colIndex };

      cell.oncontextmenu = (e) => {
        e.preventDefault();
      };

      cell.onmousedown = () => {
        isMouseDown = true;
        if (cell === start) {
          isMovingStart = true;
        } else if (cell === target) {
          isMovingTarget = true;
        } else {
          if (cell.isWall) {
            isSmashingWall = true;
            smashWall(cell);
          } else {
            buildWall(cell);
          }
        }
      };

      cell.onmouseup = () => {
        isMouseDown = false;
        isMovingStart = false;
        isMovingTarget = false;
        isSmashingWall = false;
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
          } else if (isSmashingWall) {
            smashWall(cell);
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
    markCellVisited(start);
    search();
  }
});

document.querySelector('#clear-btn').addEventListener('click', () => {
  clearSearchResult();

  while (wallCells.length > 0) {
    const cell = wallCells.shift();
    cell.isWall = false;
    cell.classList.remove('wall');
  }

  isFirstRun = true;
  board.removeClass('no-animation');
  clearTimeout(removeAnimationTimeout); // For edge case, when board is cleared during board is waiting for no-animation to be added
});

buildBoard();
mapBoarArr();
mapNeighBours();
addStartAndTarget();
