import { app, markCellAsWall } from '../helper';

const rand = () => Math.floor(Math.random() * 10 + 1);

const buildBasicRandMaze = () => {
  const cells = $('.row .cell').toArray();
  for (const cell of cells) {
    if (rand() >= 7 && cell !== app.start && cell !== app.target) {
      markCellAsWall(cell);
    }
  }
};

export default buildBasicRandMaze;
