const board = $('#board');
const boardArr = [];

const numRow = 20;
const numCol = 20;

let start;
let target;

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

      // console.log('cell', cell);
      cell.onclick = (() => {
        if (!start) {
          start = cell;
          cell.classList.add('start');
        } else if (!target) {
          target = cell;
          cell.classList.add('target');
        }
      });
    });
  });
};

buildBoard();
mapBoarArr();
