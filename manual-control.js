import { app, getLast } from './helper';

const markCellAsHead = (cell) => {
  app.userPathHead?.classList.remove('head');

  app.userPathHead = cell;
  cell.classList.add('head');
  cell === app.target
    ? app.board.addClass('completed-path')
    : app.board.removeClass('completed-path');
};

const markCellAsUserPath = (cell) => {
  cell.classList.add('user-path');
  if (cell !== app.start) {
    cell.previousUserPath = getLast(app.userPath);
  }
  app.userPath.push(cell);
}

const addUserPathHead = (cell) => {
  markCellAsHead(cell);
  markCellAsUserPath(cell);
};

const removeUserPathHead = () => {
  app.userPathHead.classList.remove('user-path', 'head');
  app.userPathHead.previousUserPath = null;
  app.userPath = app.userPath.filter((curCell) => curCell !== app.userPathHead);

  if (app.userPath.length > 0) {
    app.userPathHead = getLast(app.userPath);
  } else {
    addUserPathHead(app.start);
  }
};

const trimUserPath = (nextCell) => {
  if (app.userPath.includes(nextCell)) {
    // Back-track
    while (app.userPathHead !== nextCell) {
      removeUserPathHead(app.userPathHead);
    }
  }
};

const press = (e) => {
  if (e.keyCode > 36 && e.keyCode < 41 && app.visitedCells.length <= 0) {
    let nextCell;

    if (e.keyCode === 37) {
      nextCell = app.userPathHead.neigh['west'];
    } else if (e.keyCode === 38) {
      nextCell = app.userPathHead.neigh['north'];
    } else if (e.keyCode === 39) {
      nextCell = app.userPathHead.neigh['east'];
    } else if (e.keyCode === 40) {
      nextCell = app.userPathHead.neigh['south'];
    }

    // Once user reach target, they can only backtrack
    if (app.userPathHead === app.target && !app.userPath.includes(nextCell)) {
      return;
    }

    trimUserPath(nextCell);

    if (nextCell && !nextCell.isWall) {
      addUserPathHead(nextCell);
    }
  }
};

const setupManualControl = () => {
  document.onkeydown = press;
  addUserPathHead(app.start);
};

export default setupManualControl;
export { trimUserPath, removeUserPathHead };
