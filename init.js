import {
  app,
  markCellAsWall,
  unmarkCellAsWall,
  rerenderPath,
  clearUserPath,
} from './helper.js';

const CELL_SIZE = 25;

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
            unmarkCellAsWall(cell);
          } else {
            markCellAsWall(cell, true);
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
            clearUserPath();
            rerenderPath();
          } else if (app.isMovingTarget) {
            app.target = cell === app.start ? app.lastMouseEnteredCell : cell;
            app.target.classList.add('target');
            app.target.classList.remove('wall');
            clearUserPath();
            rerenderPath();
          } else if (app.isSmashingWall) {
            unmarkCellAsWall(cell);
          } else {
            markCellAsWall(cell, true);
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

const init = () => {
  buildBoard();
  mapBoarArr();
  mapNeighBours();
  addStartAndTarget();
};

export default init;
