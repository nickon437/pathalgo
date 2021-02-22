import { app } from './helper.js';

const markCellAsUserPath = (cell) => {
  cell.classList.add('user');
  app.userPath.push(cell);
  if (cell !== app.start) {
    cell.previousUserPath = app.userPath[app.userPath.length - 1];
  }
};

const unmarkCellAsUserPath = (cell) => {
  cell.classList.remove('user');
  cell.previousUserPath = null;
  app.userPath = app.userPath.filter((curCell) => curCell !== cell);
};

const press = (e) => {
  if (e.keyCode > 36 && e.keyCode < 41) {
    let userHeadCell = app.userPath[app.userPath.length - 1];
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

    if (app.userPath.includes(nextCell)) {
      userHeadCell.classList.remove('head');
      
      // Back-track
      while (userHeadCell !== nextCell) {
        unmarkCellAsUserPath(userHeadCell);
        userHeadCell = app.userPath[app.userPath.length - 1];
      }
    }

    if (nextCell && !nextCell.isWall) {
      userHeadCell.classList.remove('head');
      nextCell.classList.add('head');
      markCellAsUserPath(nextCell);
    }
  }
};

const setupManualControl = () => {
  document.onkeydown = press;
  markCellAsUserPath(app.start);
};

export default setupManualControl;
