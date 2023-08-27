const canvas = document.getElementById("canvas");

const ROWS = 30;
const COLS = 50;
const PIXEL = 10;

function initalizeCanvas() {
  for (let i = 0; i < ROWS; i++) {
    for (let j = 0; j < COLS; j++) {
      const pixel = document.createElement("div");
      pixel.style.position = "absolute";
      pixel.style.border = "1px solid red";
      pixel.style.left = j * PIXEL + "px";
      pixel.style.top = i * PIXEL + "px";
      pixel.style.width = PIXEL + "px";
      pixel.style.height = PIXEL + "px";
      canvas.appendChild(pixel);
    }
  }
}

initalizeCanvas();
