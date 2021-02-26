import {
  app,
  startPathFinding,
  rerenderPath,
  clearWalls,
  clearSearchResult,
  clearUserPath,
} from './helper';
import buildBasicRandMaze from './maze-generation/basic-rand-maze';
import buildRecursiveMaze from './maze-generation/recursive-division';
import mgDfs from './maze-generation/mgDfs';
import huntNKill from './maze-generation/hunt-n-kill';

const initControlPanel = () => {
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
    if (app.state !== 'searching') {
      switch (e.target.id) {
        case 'bfs':
        case 'dfs':
          $('#path-finding-dropdown small').text(e.target.innerText);
          app.selectedPathfindingAlgo = e.target.id;
          break;
        default:
          break;
      }
      rerenderPath();
    }
  });

  $('.start-btn').on('click', () => {
    if (app.start && app.target && app.state === 'waiting') {
      startPathFinding();
    }
  });

  $('#maze-generator-dropdown').on('click', async (e) => {
    if (e.target.classList.contains('dropdown-item') && app.state !== 'searching') {
      app.state = 'generating-maze';
      clearSearchResult();
      clearWalls();
      clearUserPath();

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
        case 'huntNKill':
          await huntNKill();
          break;
        default:
          break;
      }

      rerenderPath();

      app.state = app.visitedCells > 0 ? 'finished' : 'waiting';
    }
  });

  $('.clear-dropdown').on('click', (e) => {
    if (e.target.classList.contains('dropdown-item')) {
      app.state = 'finished';
      clearSearchResult();

      app.isFirstRun = true;
      app.board.removeClass('no-animation');
      clearTimeout(app.removeAnimationTimeout); // For edge case, when board is cleared during board is waiting for no-animation to be added

      if (e.target.id === 'clear-walls') {
        clearWalls();
      }

      app.state = 'waiting';
    }
  });
};

export default initControlPanel;
