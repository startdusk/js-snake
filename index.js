const canvas = document.getElementById("canvas");

const ROWS = 30;
const COLS = 50;
const PIXEL = 10;

const moveRight = ([top, left]) => [top, left + 1];
const moveLeft = ([top, left]) => [top, left - 1];
const moveUp = ([top, left]) => [top - 1, left];
const moveDown = ([top, left]) => [top + 1, left];

let gameInterval = null;
const pixels = new Map();

// --- rendering ---

function initalizeCanvas() {
  for (let i = 0; i < ROWS; i++) {
    for (let j = 0; j < COLS; j++) {
      const pixel = document.createElement("div");
      pixel.style.position = "absolute";
      pixel.style.border = "1px solid #aaa";
      pixel.style.left = j * PIXEL + "px";
      pixel.style.top = i * PIXEL + "px";
      pixel.style.width = PIXEL + "px";
      pixel.style.height = PIXEL + "px";
      const position = i + "_" + j;
      canvas.appendChild(pixel);
      pixels.set(position, pixel);
    }
  }
}

// --- game state ---

let currentSnake;
let currentSnakeKeys;
let currentFoodKey;
let currentDirection;
let directionQueue;
let currentVacantKeys;

function step() {
  const head = currentSnake[currentSnake.length - 1];
  let nextDirection = currentDirection;
  while (directionQueue.length > 0) {
    const candidateDirection = directionQueue.shift();
    if (areOpposite(candidateDirection, currentDirection)) {
      continue;
    }
    nextDirection = candidateDirection;
    break;
  }
  currentDirection = nextDirection;
  const nextHead = currentDirection(head);
  if (!checkValidHead(currentSnakeKeys, nextHead)) {
    stopGame(false);
    return;
  }
  pushHead(nextHead);
  if (toKey(nextHead) == currentFoodKey) {
    const nextFoodKey = spawnFood();
    if (nextFoodKey === null) {
      stopGame(true);
      return;
    }
    currentFoodKey = nextFoodKey;
  } else {
    popTail();
  }
  drawCanvas();
  // dump(directionQueue);
  if (window.location.search === "?debug") {
    checkIntegerity_SLOW();
  }
}

function pushHead(nextHead) {
  currentSnake.push(nextHead);
  const key = toKey(nextHead);
  currentVacantKeys.delete(key);
  currentSnakeKeys.add(key);
}

function popTail() {
  let tail = currentSnake.shift();
  const key = toKey(tail);
  currentVacantKeys.add(key);
  currentSnakeKeys.delete(key);
}

function drawCanvas() {
  const foodKey = currentFoodKey;
  for (let i = 0; i < ROWS; i++) {
    for (let j = 0; j < COLS; j++) {
      const key = toKey([i, j]);
      const pixel = pixels.get(key);

      let background = "white";
      if (key === foodKey) {
        background = "purple";
      } else if (currentSnakeKeys.has(key)) {
        background = "black";
      }

      pixel.style.background = background;
    }
  }
}

// --- interaction ---

function stopGame(success) {
  canvas.style.borderColor = success ? "green" : "red";
  clearInterval(gameInterval);
  gameInterval = null;
}

function startGame() {
  directionQueue = [];
  currentSnake = makeInitialSnake();
  currentSnakeKeys = new Set();
  currentVacantKeys = new Set();
  const [snakeKeys, vacantKeys] = partitionCell(currentSnake);
  currentSnakeKeys = snakeKeys;
  currentVacantKeys = vacantKeys;
  currentDirection = moveRight;
  currentFoodKey = spawnFood();

  canvas.style.borderColor = "";
  gameInterval = setInterval(step, 100);
  drawCanvas();
}

window.addEventListener("keydown", (e) => {
  if (e.shiftKey || e.ctrlKey || e.altKey || e.metaKey) {
    return;
  }
  e.preventDefault();
  switch (e.key) {
    case "ArrowLeft":
    case "A":
    case "a":
      directionQueue.push(moveLeft);
      break;
    case "ArrowRight":
    case "D":
    case "d":
      directionQueue.push(moveRight);
      break;
    case "ArrowUp":
    case "W":
    case "w":
      directionQueue.push(moveUp);
      break;
    case "ArrowDown":
    case "S":
    case "s":
      directionQueue.push(moveDown);
      break;
    case "R":
    case "r":
      stopGame(false);
      startGame();
      break;
    case " ":
      step();
      break;
  }

  // dump(directionQueue);
});

function spawnFood() {
  if (currentVacantKeys.size === 0) {
    startGame(true);
    return;
  }

  const choice = Math.floor(Math.random() * currentVacantKeys.size);
  let i = 0;
  for (let key of currentVacantKeys) {
    if (i === choice) {
      return key;
    }
    i++;
  }
  throw Error("should never get here");
}

initalizeCanvas();
startGame();

// --- utilities ---
function areOpposite(dir1, dir2) {
  if (dir1 === moveLeft && dir2 === moveRight) {
    return true;
  }
  if (dir1 === moveRight && dir2 === moveLeft) {
    return true;
  }
  if (dir1 === moveUp && dir2 === moveDown) {
    return true;
  }
  if (dir1 === moveDown && dir2 === moveUp) {
    return true;
  }
  return false;
}

// function dump(queue) {
//   document.getElementById("debug").innerText = queue
//     .map((fn) => fn.name)
//     .join(", ");
// }

function checkValidHead(keys, cell) {
  const [top, left] = cell;
  if (top < 0 || left < 0) {
    return false;
  }
  if (top >= ROWS || left >= COLS) {
    return false;
  }
  const key = toKey(cell);
  if (keys.has(key)) {
    return false;
  }
  return true;
}

function partitionCell(snake) {
  const snakeKeys = new Set();
  const vacantKeys = new Set();
  for (let i = 0; i < ROWS; i++) {
    for (let j = 0; j < COLS; j++) {
      vacantKeys.add(toKey([i, j]));
    }
  }
  for (let cell of snake) {
    const key = toKey(cell);
    vacantKeys.delete(key);
    snakeKeys.add(key);
  }
  return [snakeKeys, vacantKeys];
}

function toKey([top, left]) {
  return top + "_" + left;
}

function makeInitialSnake() {
  return [
    [0, 0],
    [0, 1],
    [0, 2],
    [0, 3],
    [0, 4],
  ];
}

// --- debugging ---

function checkIntegerity_SLOW() {
  let failedCheck = null;
  let foodCount = 0;
  const allKeys = new Set();
  for (let i = 0; i < ROWS; i++) {
    for (let j = 0; j < COLS; j++) {
      const key = toKey([i, j]);
      allKeys.add(key);
      if (key === currentFoodKey) {
        foodCount++;
      }
    }
  }
  if (foodCount !== 1) {
    failedCheck = "there cannot be two foods";
  }
  const [snakeKeys, vacantKeys] = partitionCell(currentSnake);
  if (!areSameSets_SLOW(snakeKeys, currentSnakeKeys)) {
    failedCheck = "snake keys don't match";
  }
  if (!areSameSets_SLOW(vacantKeys, currentVacantKeys)) {
    failedCheck = "vacant keys don't match";
  }
  if (currentSnakeKeys.has(currentFoodKey)) {
    failedCheck = "there's food in the snake";
  }
  if (currentSnake.length !== currentSnakeKeys.size) {
    failedCheck = "the snake intersects itself";
  }
  if (
    !areSameSets_SLOW(
      new Set([...currentSnakeKeys, ...currentVacantKeys]),
      allKeys
    )
  ) {
    failedCheck = "something is out of bounds";
  }

  for (let i = 1 /* intentional */; i < currentSnake.length; i++) {
    const prevCell = currentSnake[i - 1];
    const currCell = currentSnake[i];
    const dy = currCell[0] - prevCell[0];
    const dx = currCell[1] - prevCell[1];
    const isOk =
      (dy === 0 && Math.abs(dx) === 1) || (dx === 0 && Math.abs(dy) === 1);
    if (!isOk) {
      failedCheck = "the snake has a break";
    }
  }

  if (failedCheck !== null) {
    stopGame(false);
    canvas.style.borderColor = "purple";
    throw Error(failedCheck);
  }
}

function areSameSets_SLOW(a, b) {
  return JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());
}
