import { app, markCellAsWall } from '../helper';

const rand = () => Math.floor(Math.random() * 10 + 1);

const buildBasicRandMaze = () => {
  const cells = $('.cell').toArray();
  for (const cell of cells) {
    if (rand() >= 8 && cell !== app.start && cell !== app.target) {
      markCellAsWall(cell);
    }
  }
};

export default buildBasicRandMaze;
