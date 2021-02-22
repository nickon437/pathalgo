import { app, getLast } from './helper.js';

const marCellAsHead = (cell) => {
  app.userPathHead?.classList.remove('head');

  app.userPathHead = cell;
  cell.classList.add('head');
  cell === app.target ? app.board.addClass('completed-path') : app.board.removeClass('completed-path');
}

const markCellAsUserPath = (cell) => {
  marCellAsHead(cell);
  
  cell.classList.add('user');
  if (cell !== app.start) {
    cell.previousUserPath = getLast(app.userPath);
  }
  app.userPath.push(cell);
};

const unmarkCellAsUserPath = (cell) => {
  cell.classList.remove('user');
  cell.previousUserPath = null;
  app.userPath = app.userPath.filter((curCell) => curCell !== cell);
};

const trimUserPath = (nextCell) => {
  let userHeadCell = getLast(app.userPath);

  if (app.userPath.includes(nextCell)) {
    // Back-track
    while (userHeadCell !== nextCell) {
      unmarkCellAsUserPath(userHeadCell);
      userHeadCell = getLast(app.userPath);
    }
  }
};

const press = (e) => {
  if (e.keyCode > 36 && e.keyCode < 41 && app.visitedCells.length <= 0) {
    let userHeadCell = getLast(app.userPath);
    let nextCell;

    if (e.keyCode === 37) {
      nextCell = userHeadCell.neigh['west'];
    } else if (e.keyCode === 38) {
      nextCell = userHeadCell.neigh['north'];
    } else if (e.keyCode === 39) {
      nextCell = userHeadCell.neigh['east'];
    } else if (e.keyCode === 40) {
      nextCell = userHeadCell.neigh['south'];
    }

    trimUserPath(nextCell);

    if (nextCell && !nextCell.isWall) {
      markCellAsUserPath(nextCell);
    }
  }
};

const setupManualControl = () => {
  document.onkeydown = press;
  markCellAsUserPath(app.start);
};

export default setupManualControl;
export { trimUserPath };
