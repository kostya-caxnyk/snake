import blessed from 'blessed';

const screen = blessed.screen();
screen.title = 'snake game';

const gameBox = {
  parent: screen,
  top: 1,
  left: 0,
  width: '100%',
  height: '100%-1',
  style: {
    fg: 'black',
    bg: 'black',
    border: 'white',
  },
};
const scoreBox = {
  parent: screen,
  top: 0,
  left: 'left',
  width: '100%',
  height: 1,
  tags: true,
  style: {
    fg: 'white',
    bg: 'blue',
  },
};
const gameOverBox = {
  parent: screen,
  top: 'center',
  left: 'center',
  width: 20,
  height: 6,
  tags: true,
  valign: 'middle',
  content: `{center}Game Over!\n\nPress enter to try again{/center}`,
  border: {
    type: 'line',
  },
  style: {
    fg: 'black',
    bg: 'magenta',
    border: {
      fg: '#ffffff',
    },
  },
};
const boostBox = {
  parent: screen,
  top: 1,
  left: 'left',
  width: '100%',
  height: 1,
  tags: true,
  content: `You're under boost for 10s! X2 to your growth`,
  style: {
    fg: 'black',
    bg: 'yellow',
  },
};

export let gameContainer = blessed.box(gameBox);
let scoreContainer = blessed.box(scoreBox);
let boostContainer = null;

export const bindHandlers = (keyHandler, quitHandler, enterHandler) => {
  screen.on('keypress', keyHandler);
  screen.key(['escape'], quitHandler);
  screen.key(['enter'], enterHandler);
};

export const draw = (coords, color) => {
  blessed.box({
    parent: gameContainer,
    top: coords.y,
    left: coords.x,
    width: 1,
    height: 1,
    style: {
      fg: color,
      bg: color,
    },
  });
};

export const updateScore = (score) => {
  scoreContainer.setLine(0, '{bold}Score:{/bold} ' + score);
};

export const gameOverScreen = () => {
  gameContainer = blessed.box(gameOverBox);
};

export const clearScreen = () => {
  gameContainer.detach();
  gameContainer = blessed.box(gameBox);
};

export const setBoostBox = (set) => {
  boostContainer = set ? blessed.box(boostBox) : null;
};

export const resetScore = () => {
  scoreContainer.detach();
  scoreContainer = blessed.box(scoreBox);
  updateScore(0);
};

export const render = () => {
  screen.render();
};
