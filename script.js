import {
  app,
  startPathFinding,
  rerenderPath,
  clearWalls,
  clearSearchResult,
} from './helper.js';
import init from './init.js';
import buildBasicRandMaze from './maze-generation/basic-rand-maze.js';
import buildRecursiveMaze from './maze-generation/recursive-division.js';
import mgDfs from './maze-generation/mgDfs.js';

init();

$('#start-btn').on('click', () => {
  if (app.start && app.target) {
    startPathFinding();
  }
});

$('#clear-btn').on('click', () => {
  clearSearchResult();
  clearWalls();

  app.isFirstRun = true;
  app.board.removeClass('no-animation');
  clearTimeout(app.removeAnimationTimeout); // For edge case, when board is cleared during board is waiting for no-animation to be added
});

$('#maze-generation-algorithm').on('change', async (e) => {
  clearSearchResult();
  clearWalls();

  switch (e.target.value) {
    case 'random':
      buildBasicRandMaze();
      break;
    case 'recursive-division':
      await buildRecursiveMaze();
      break;
    case 'dfs':
      await mgDfs();
      break;
    default:
      break;
  }

  rerenderPath();
});
