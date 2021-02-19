import {
  DIREACTIONS,
  DIRECTION_DOWN,
  DIRECTION_LEFT,
  DIRECTION_RIGHT,
  DIRECTION_UP,
  INITIAL_SNAKE_SIZE,
  TICK_TIME,
} from './constants.js';
import {
  render,
  resetScore,
  gameContainer,
  bindHandlers,
  gameOverScreen,
  clearScreen,
  draw,
  updateScore,
  setBoostBox,
} from './ui.js';

let timer = null;
let boostTimer = null;
let boostInterval = null;
let underBoostTimer = null;
let isUnderBoost = false;
let snakeArr = [];
let eatDot = {};
let badDot = {};
let boostDot = {};
let score = 0;
let currentDirection = DIRECTION_RIGHT;
const maxWidht = gameContainer.width - 1;
const maxHeight = gameContainer.height - 1;
let isAllowedToChangeDirection = true;

function isSameCoords(obj1, obj2) {
  return obj1.x === obj2.x && obj1.y === obj2.y;
}

function isGameOver() {
  if (snakeArr.length === 0) {
    return true;
  }
  const head = snakeArr[snakeArr.length - 1];
  let isOver = false;
  snakeArr
    .filter((_, idx) => idx < snakeArr.length - 1)
    .forEach((bodyPixel) => {
      if (isSameCoords(head, bodyPixel)) {
        isOver = true;
      }
    });
  if (head.x >= maxWidht || head.x <= -1 || head.y > maxHeight || head.y <= -1) {
    isOver = true;
  }
  return isOver;
}

function generateRandomPixel(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

function generateEatDot() {
  eatDot = {
    x: generateRandomPixel(0, maxWidht),
    y: generateRandomPixel(1, maxHeight),
  };
  snakeArr.forEach((pixel) => {
    if (isSameCoords(pixel, eatDot)) {
      generateEatDot();
    }
  });
}

function generateBadDot() {
  badDot = {
    x: generateRandomPixel(0, maxWidht),
    y: generateRandomPixel(1, maxHeight),
  };
  snakeArr.forEach((pixel) => {
    if (isSameCoords(pixel, badDot) || isSameCoords(badDot, eatDot)) {
      generateBadDot();
    }
  });
}

function generateBoostDot() {
  boostDot = {
    x: generateRandomPixel(0, maxWidht),
    y: generateRandomPixel(1, maxHeight),
  };
  snakeArr.forEach((pixel) => {
    if (
      isSameCoords(pixel, boostDot) ||
      isSameCoords(boostDot, eatDot) ||
      isSameCoords(boostDot, badDot)
    ) {
      generateBoostDot();
    }
  });
}

function handleChangeDirection(_, key) {
  if (!isAllowedToChangeDirection) {
    return;
  }
  if ((key.name === DIRECTION_UP || key.name === 'w') && currentDirection !== DIRECTION_DOWN) {
    currentDirection = DIRECTION_UP;
  }
  if ((key.name === DIRECTION_DOWN || key.name === 's') && currentDirection !== DIRECTION_UP) {
    currentDirection = DIRECTION_DOWN;
  }
  if ((key.name === DIRECTION_LEFT || key.name === 'a') && currentDirection !== DIRECTION_RIGHT) {
    currentDirection = DIRECTION_LEFT;
  }
  if ((key.name === DIRECTION_RIGHT || key.name === 'd') && currentDirection !== DIRECTION_LEFT) {
    currentDirection = DIRECTION_RIGHT;
  }
  isAllowedToChangeDirection = false;
}

function handleQuit() {
  process.exit(0);
}

function handleStart() {
  start();
}

function getTailPixel(pixel1, pixel2) {
  const isSameY = pixel1.y === pixel2.y;
  const isSameX = pixel1.x === pixel2.x;
  if (isSameY && pixel1.x > pixel2.x) {
    return {
      x: pixel1.x + 1,
      y: pixel1.y,
    };
  }
  if (isSameY && pixel1.x < pixel2.x) {
    return {
      x: pixel1.x - 1,
      y: pixel1.y,
    };
  }
  if (isSameX && pixel1.y > pixel2.y) {
    return {
      x: pixel1.x,
      y: pixel1.y + 1,
    };
  }
  if (isSameX && pixel1.y < pixel2.y) {
    return {
      x: pixel1.x,
      y: pixel1.y - 1,
    };
  }
}

function moveSnake() {
  const oldHead = snakeArr[snakeArr.length - 1];
  const newHead = {
    x: oldHead.x + DIREACTIONS[currentDirection].x,
    y: oldHead.y + DIREACTIONS[currentDirection].y,
  };
  snakeArr.push(newHead);

  if (isSameCoords(eatDot, newHead)) {
    if (isUnderBoost) {
      updateScore(++score);
      const newTailPixel = getTailPixel(snakeArr[0], snakeArr[1]);
      snakeArr.unshift(newTailPixel);
    }
    updateScore(++score);
    generateEatDot();
    return;
  }
  if (isSameCoords(newHead, boostDot)) {
    isUnderBoost = true;
    underBoostTimer = setTimeout(() => {
      isUnderBoost = false;
    }, 10000);
    boostDot = {};
    return;
  }

  if (isSameCoords(badDot, newHead)) {
    snakeArr.shift();
    updateScore(--score);
    generateBadDot();
  }
  snakeArr.shift();
}

function drawSnake() {
  snakeArr.forEach((pixel) => {
    draw(pixel, 'green');
  });
}

function drawDot(dot, color) {
  draw(dot, color);
}

function tick() {
  if (isGameOver()) {
    gameOverScreen();
    render();
    clearInterval(timer);
    clearInterval(boostInterval);
    clearTimeout(boostTimer);
    clearTimeout(underBoostTimer);
    timer = null;
    boostInterval = null;
    boostTimer = null;
    underBoostTimer = null;
  } else {
    isAllowedToChangeDirection = true;
    clearScreen();
    moveSnake();
    drawSnake();
    setBoostBox(isUnderBoost);
    drawDot(eatDot, 'green');
    drawDot(badDot, 'red');
    if (boostDot.x) {
      drawDot(boostDot, 'yellow');
    }
    render();
  }
}

function reset() {
  snakeArr = [];
  timer = null;
  boostTimer = null;
  boostInterval = null;
  underBoostTimer = null;
  isUnderBoost = false;
  eatDot = {};
  badDot = {};
  boostDot = {};
  score = 0;
  currentDirection = DIRECTION_RIGHT;
  isAllowedToChangeDirection = true;

  for (let i = 0; i < INITIAL_SNAKE_SIZE; i++) {
    snakeArr.push({ x: i + 2, y: 3 });
  }

  resetScore();
  generateBadDot();
  generateEatDot();
  render();
}

export function start() {
  if (!timer) {
    reset();

    timer = setInterval(() => {
      tick();
    }, TICK_TIME);

    boostInterval = setInterval(() => {
      boostTimer = setTimeout(() => {
        boostDot = {};
      }, 5000);
      generateBoostDot();
    }, 17000);
  }
}

bindHandlers(handleChangeDirection, handleQuit, handleStart);
