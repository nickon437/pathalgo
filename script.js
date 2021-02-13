const board = $('#board');
const boardArr = [];

let numRow = 20;
let numCol = 20;

let start;
let target;

const DIR = {
  NORTH: 'north',
  SOUTH: 'south',
  WEST: 'west',
  EAST: 'ease',
};

let queue = [];

const TIME_DELAY = 20;

let hasPath = false;
let path = [];

let visitedCells = [];

let isMouseDown = false;
let isMovingStart = false;
let isMovingTarget = false;

let lastMouseEnteredCell;

let searchInterval;
let backTrackInterval;

let isFirstRun = true;

const clearBoard = () => {
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
  if (cell !== start) {
    backTrack(cell.previous);
  }
}

const backTrack = (cell) => {
  // console.log('backtrack', cell)
  if (isFirstRun) {
    setTimeout(() => layPath(cell), 500);
  } else {
    layPath(cell);
  }
};

const visitCell = (previous, cell) => {
  if (cell && !cell.isVisited && !cell.isWall) {
    cell.isVisited = true;
    cell.previous = previous;

    cell.classList.add('visited');
    visitedCells.push(cell);
    queue.push(cell);
    if (cell === target) {
      // console.log('clear interval')
      clearInterval(search);
      hasPath = true;
      // return backTrack(target);
    }
  }
};

const visitNeighCells = (cell) => {
  const { north, east, south, west } = cell.neigh;
  visitCell(cell, north);
  visitCell(cell, east);
  visitCell(cell, south);
  visitCell(cell, west);

  if (hasPath) {
    // console.log('clear interval')
    // clearInterval(search);
  }
};

const search = () => {
  // console.log('queue.length', queue.length, hasPath)


  if (queue.length > 0 && !hasPath) {
    visitNeighCells(queue[0]);
    // console.log('b4 queue.length', queue.length);
    queue.shift();
    // console.log('af queue.length', queue.length);
  } else {
    // console.log('clear interval')
    clearInterval(searchInterval);
  }

  if (hasPath) {
    // clearInterval(searchInterval); // Without this, the interval will run another run and make backTrack with no timeout due to new isFirstRun value

    backTrack(target);
    isFirstRun = false;
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

const mapBoarArr = () => {
  const rowEls = $('.row').toArray();
  rowEls.forEach((rowEl, rowIndex) => {
    const colEls = rowEl.childNodes;

    boardArr[rowIndex] = [];
    colEls.forEach((cell, colIndex) => {
      boardArr[rowIndex][colIndex] = cell;
      cell.location = {};
      cell.location.rowIndex = rowIndex;
      cell.location.colIndex = colIndex;

      cell.onmousedown = () => {
        isMouseDown = true;
        if (cell === start) {
          isMovingStart = true;
        } else if (cell === target) {
          isMovingTarget = true;
        }
      };

      cell.onmouseup = () => {
        if (cell !== start && cell !== target && !isMovingStart) {
          cell.isWall = true;
          cell.classList.add('wall');
        }
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
            if (hasPath) {
              // console.log(queue.length);
              clearBoard();
              // $('.visited.cell::before').css('animation') = 'visit 0s ease forwards'
              while (queue.length > 0 && !hasPath) {
                search();
              }
            }
          } else if (isMovingTarget) {
            target = cell === start ? lastMouseEnteredCell : cell;
            target.classList.add('target');
            target.classList.remove('wall');
          } else {
            if (cell !== start && cell !== target) {
              cell.isWall = true;
              cell.classList.add('wall');
            }
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
    });
  });
};

const mapNeighBours = () => {
  for (let rowIndex = 0; rowIndex < numRow; rowIndex++) {
    for (let colIndex = 0; colIndex < numCol; colIndex++) {
      const cell = boardArr[rowIndex][colIndex];
      cell.neigh = {};

      if (rowIndex !== 0) {
        cell.neigh.north = boardArr[rowIndex - 1][colIndex];
      }

      if (rowIndex !== numRow - 1) {
        cell.neigh.south = boardArr[rowIndex + 1][colIndex];
      }

      if (colIndex !== 0) {
        cell.neigh.east = boardArr[rowIndex][colIndex - 1];
      }

      if (colIndex !== numCol - 1) {
        cell.neigh.west = boardArr[rowIndex][colIndex + 1];
      }
    }
  }
};

const addStartAndTarget = () => {
  start = boardArr[Math.floor(numRow / 2)][Math.floor(numCol / 3)];
  target = boardArr[Math.floor(numRow / 2)][Math.floor((numCol * 2) / 3)];

  start.classList.add('start');
  target.classList.add('target');
};

document.querySelector('button').addEventListener('click', () => {
  if (start && target) {
    queue.push(start);
    searchInterval = setInterval(search, TIME_DELAY);
  }
});

buildBoard();
mapBoarArr();
mapNeighBours();
addStartAndTarget();
