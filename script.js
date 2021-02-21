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

$('.dropdown-box').on('click', (e) => {
  let parent = e.target.parentNode;
  while (!parent.classList.contains('dropdown-box')) {
    parent = parent.parentNode;
  }

  const isMenuOpened = parent.classList.contains('opened');

  for (const dropdown of $('.dropdown-box').toArray()) {
    dropdown.classList.remove('opened');
  }

  isMenuOpened
    ? parent.classList.remove('opened')
    : parent.classList.add('opened');
});

$('#path-finding-dropdown').on('click', (e) => {
  switch (e.target.id) {
    case 'bfs':
    case 'dfs':
      $('#path-finding-dropdown small').text(e.target.innerText);
      app.selectedPathfindingAlgo = e.target.id;
      break;
    default:
      break;
  }
});

$('#start-btn').on('click', () => {
  if (app.start && app.target) {
    startPathFinding();
  }
});

$('#maze-generator-dropdown').on('click', async (e) => {
  if (e.target.classList.contains('dropdown-item')) {
    clearSearchResult();
    clearWalls();

    switch (e.target.id) {
      case 'random':
        buildBasicRandMaze();
        break;
      case 'recursive-division':
        await buildRecursiveMaze();
        break;
      case 'mgDfs':
        await mgDfs();
        break;
      default:
        break;
    }

    rerenderPath();
  }
});

$('#clear-dropdown').on('click', (e) => {
  if (e.target.classList.contains('dropdown-item')) {
    clearSearchResult();

    app.isFirstRun = true;
    app.board.removeClass('no-animation');
    clearTimeout(app.removeAnimationTimeout); // For edge case, when board is cleared during board is waiting for no-animation to be added

    if (e.target.id === 'clear-walls') {
      clearWalls();
    }
  }
});
