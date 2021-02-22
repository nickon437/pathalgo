import { app, getLast } from './helper.js';

const markCellAsUserPath = (cell) => {
  cell.classList.add('head');
  cell.classList.add('user');
  app.userPath.push(cell);
  if (cell !== app.start) {
    cell.previousUserPath =  getLast(app.userPath);
  }
};

const unmarkCellAsUserPath = (cell) => {
  cell.classList.remove('user');
  cell.previousUserPath = null;
  app.userPath = app.userPath.filter((curCell) => curCell !== cell);
};

const cutUserPath = (nextCell) => {
  let userHeadCell = getLast(app.userPath);

  if (app.userPath.includes(nextCell)) {
    userHeadCell.classList.remove('head');
    
    // Back-track
    while (userHeadCell !== nextCell) {
      unmarkCellAsUserPath(userHeadCell);
      userHeadCell = getLast(app.userPath);
    }
  }
}

const press = (e) => {
  if (e.keyCode > 36 && e.keyCode < 41) {
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

    cutUserPath(nextCell);
    userHeadCell = getLast(app.userPath);

    if (nextCell && !nextCell.isWall) {
      userHeadCell.classList.remove('head');
      markCellAsUserPath(nextCell);
    }
  }
};

const setupManualControl = () => {
  document.onkeydown = press;
  markCellAsUserPath(app.start);
};

export default setupManualControl;
