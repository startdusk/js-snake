const canvas = document.getElementById("canvas");

const ROWS = 30;
const COLS = 50;
const PIXEL = 10;

const pixels = new Map();

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

function drawSnake(snake) {
  const snakePositions = new Set();
  for (let [top, left] of snake) {
    const position = top + "_" + left;
    snakePositions.add(position);
  }
  for (let i = 0; i < ROWS; i++) {
    for (let j = 0; j < COLS; j++) {
      const position = i + "_" + j;
      const pixel = pixels.get(position);
      pixel.style.background = snakePositions.has(position) ? "black" : "white";
    }
  }
}

initalizeCanvas();
let currentSnake = [
  [0, 0],
  [0, 1],
  [0, 2],
  [0, 3],
  [0, 4],
];

const moveRight = ([top, left]) => [top, left + 1];
const moveLeft = ([top, left]) => [top, left - 1];
const moveUp = ([top, left]) => [top - 1, left];
const moveDown = ([top, left]) => [top + 1, left];

let currentDirection = moveRight;

let directionQueue = [];

window.addEventListener("keydown", (e) => {
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
  }

  // dump(directionQueue);
});

function step() {
  currentSnake.shift();
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
  currentSnake.push(nextHead);
  drawSnake(currentSnake);
  // dump(directionQueue);
}

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

drawSnake(currentSnake);
setInterval(() => {
  step();
}, 500);
