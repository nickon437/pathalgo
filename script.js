const board = $('#board');
const boardArr = [];

const numRow = 20;
const numCol = 20;


let start;
let target;

const DIR = {
  NORTH: 'north',
  SOUTH: 'south',
  WEST: 'west',
  EAST: 'ease',
};

const queue = [];

const TIME_DELAY = 20;

let hasPath = false;
const path = [];

let isMouseDown = false;

const search = () => {
  if (queue.length > 0 && !hasPath) {
    visitNeighCells(queue[0]);
    queue.shift();
  } else {
    clearInterval(search);
  }
};

const buildBoard = () => {
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

      cell.onclick = () => {
        if (!start) {
          start = cell;
          queue.push(cell);
          cell.classList.add('start');
        } else if (!target) {
          target = cell;
          cell.classList.add('target');
        }
      };
      
      
      cell.onmousedown = () => {
        isMouseDown = true
      }
      
      cell.onmouseup = () => {
        isMouseDown = false;
        if (start && target) {
          cell.isWall = true;
          cell.classList.add('wall');
        }
      }
      
      cell.onmouseenter = () => {
        if (start && target && isMouseDown) {
          cell.isWall = true;
          cell.classList.add('wall');
        }
      }
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


const backTrack = (cell) => {
  setTimeout(() => {
    cell.classList.add('path');
    if (cell !== start) {
      backTrack(cell.previous);
    }
  }, 100);
};

const visitCell = (previous, cell) => {
  if (cell && !cell.isVisited && !cell.isWall) {
    cell.isVisited = true;
    cell.previous = previous;

    cell.classList.add('visited');
    queue.push(cell);
    if (cell === target) {
      // console.log('sameCell');
      // clearInterval(search);
      hasPath = true;
      return backTrack(target);
    }
  }
};

const visitNeighCells = (cell) => {
  const { north, east, south, west } = cell.neigh;
  visitCell(cell, north);
  visitCell(cell, east);
  visitCell(cell, south);
  visitCell(cell, west);

  // if (hasPath) {
  //   console.log('hasPath');
  //   clearInterval(search);
  // }
};

document.querySelector('button').addEventListener('click', () => {
  if (start && target) {
    setInterval(search, TIME_DELAY);
  }
});




buildBoard();
mapBoarArr();
mapNeighBours();