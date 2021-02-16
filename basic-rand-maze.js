import { app } from './script.js';

const rand = () => Math.floor(Math.random() * 10 + 1);

const buildBasicRandMaze = () => {
  const cells = $('.cell').toArray();
  for (const cell of cells) {
    if (rand() >= 8 && cell !== app.start && cell !== app.target) {
      cell.isWall = true;
      cell.classList.add('wall');
    } else {
      cell.isWall = false;
      cell.classList.remove('wall');
    }
  }
};

export default buildBasicRandMaze;
