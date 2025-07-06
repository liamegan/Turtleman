import { Pane } from "https://cdn.jsdelivr.net/npm/tweakpane@4.0.5/dist/tweakpane.min.js";
import { Turtleman } from "../Turtleman.js";
import { Polygons } from "../utilities/Polygons.js";

const CONFIG = {
  width: 1200, // Canvas width
  height: 600, // Canvas height
  gridW: 100, // Number of grid columns
  gridH: 50, // Number of grid rows
};

const pane = new Pane();
pane.addBinding(CONFIG, "width");
pane.addBinding(CONFIG, "height");
pane.addBinding(CONFIG, "gridW", {
  step: 1,
  min: 1,
  max: 100,
});
pane.addBinding(CONFIG, "gridH", {
  step: 1,
  min: 1,
  max: 100,
});
pane.on("change", (ev) => {
  rebuild();
});

let toy;
const rebuild = () => {
  if (toy) toy.element.remove();

  const { width, height, gridW, gridH } = CONFIG;
  const gridWFactor = width / gridW, // Width of a cell in pixels
    gridHFactor = height / gridH; // Height of a cell in pixels

  // Create the Turtleman
  toy = new Turtleman({
    width: width,
    height: height,
    angleType: "radians",
    strokeWidth: 1,
  });
  container.appendChild(toy.element);

  /*
   * Some utility functions.
   */
  // Returns a random option from an array
  const randomOption = (options) =>
    options[Math.floor(Math.random() * options.length)];

  // A 1 dimensional array of grid cells. Each cell contains
  // the 4 points that make it up, the cell's bounds, and a
  // type value. You can get the x and y position of the
  // cell in the grid by using the cell's index in this array
  // const row = Math.floor(i / gridW);
  // const col = i % gridW;
  // Similarly you can cast a grid position to a cell index
  // by calculating it from the row and column index:
  // const index = col * gridW + row
  // eg:
  /*
    const getGridPosition = (i, w) => [i % w, Math.floor(i / w)];
    const getGridIndex = (x, y, w) => y*w+x;
    const index = getGridIndex(2,3,gridW);
    console.log(gridCells[index].points[0])
    console.log(getGridPosition(index, gridW))
  */
  const gridCells = [...Array(gridW * gridH)].map((_, i) => {
    const row = Math.floor(i / gridW);
    const col = i % gridW;

    // Each grid cell is defined by its top-left corner
    // The 4 points of the cell are: top-left, top-right, bottom-right, bottom-left
    const points = [
      { x: col, y: row }, // top left
      { x: col + 1, y: row }, // top right
      { x: col + 1, y: row + 1 }, // bottom right
      { x: col, y: row + 1 }, // bottom left
    ];
    // Bounds of the grid cell in pixels
    const bounds = {
      x: col * gridWFactor,
      y: row * gridHFactor,
      w: gridWFactor,
      h: gridHFactor,
    };
    return {
      points,
      bounds,
      type: randomOption(["square", "circle", "triangle", "diamond", "flower"]),
    };
  });

  /*
   * Some basic drawing functions
   */
  // The circle draws a circle by moving into the position at
  // the top of the circle and then drawing forward and turning
  // right by an amount equal to:
  // 2π / circumference / number of steps
  const drawCircle = (r, x, y, steps) => {
    toy.seth(0);
    const TAU = Math.PI * 2;
    const step = (TAU * r) / steps;
    toy.jump(x - step / 2, y - r);
    for (let i = 0; i < steps; i++) {
      toy.forward(step);
      toy.right(TAU / steps);
    }
  };
  // The square moves to the top-left of the square shape
  // as defined by the x, y and radius (width) of the square
  // Then it walks forward, and turns right (1.57 = 90 degrees)
  // repeating until the square is complete.
  const drawSquare = (r, x, y) => {
    toy.seth(0);
    toy.jump(x - r, y - r);
    toy.forward(r * 2);
    toy.right(1.5708);
    toy.forward(r * 2);
    toy.right(1.5708);
    toy.forward(r * 2);
    toy.right(1.5708);
    toy.forward(r * 2);
  };
  // Draws a triangle by first jumping to its top vertex, defined
  // by the x and y coordinates of its center and its radius. It
  // then uses goto commands to draw lines connecting the top
  // vertex to the bottom-right vertex, then to the bottom-left
  // vertex, and finally back to the starting point.
  const drawTriangle = (r, x, y) => {
    toy.seth(0);
    toy.jump(x, y - r);
    toy.goto(x + r, y + r);
    toy.goto(x - r, y + r);
    toy.goto(x, y - r);
  };
  // The diamond shape is drawm by first jumping to the
  // top-most point of the diamond, as defined by its center
  // coordinates and r radius. Then, it draws lines connecting
  // the top point to the right point, then to the top point etc.
  const drawDiamond = (r, x, y) => {
    toy.jump(x, y - r);
    toy.right(1.5708 / 2);
    toy.goto(x + r, y);
    toy.goto(x, y + r);
    toy.goto(x - r, y);
    toy.goto(x, y - r);
  };
  // The drawFlower function draws a flower-like shape by
  // iterating through a series of steps around a central point,
  // defined by x and y. In each step, it calculates a slightly
  // varied radius using a sine wave, which creates the "petal"
  // effect. It then determines the _x and _y coordinates for
  // that step based on the varied radius and the current angle.
  const drawFlower = (r, x, y, steps) => {
    toy.seth(0);
    const TAU = Math.PI * 2;
    const step = TAU / steps;
    for (let i = 0; i <= steps; i++) {
      const _r = r + Math.sin(i * step * 10) * 30;
      const _x = Math.cos(i * step) * _r + x;
      const _y = Math.sin(i * step) * _r + y;
      if (i === 0) toy.jump(_x, _y);
      else toy.goto(_x, _y);
    }
  };

  /*
   * Drawing
   */
  gridCells.forEach((grid) => {
    const { bounds, points } = grid;

    // --- Example Usage ---
    const polygonManager = new Polygons();

    // Create a square polygon
    const square = polygonManager.create();
    square.addPoints(
      { x: 10, y: 10 },
      { x: 60, y: 10 },
      { x: 60, y: 60 },
      { x: 10, y: 60 }
    );
    square.addOutline(); // Generate outline segments for drawing

    // Create a circle-like polygon (many segments)
    const circle = polygonManager.create();
    const numSegments = 30;
    const radius = 30;
    const centerX = 40;
    const centerY = 40;
    for (let i = 0; i < numSegments; i++) {
      const angle = (i / numSegments) * Math.PI * 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      circle.addPoints({ x: x, y: y });
    }
    circle.addOutline();

    // Perform a boolean difference (square - circle)
    const resultPolygon = polygonManager.create();
    resultPolygon.addSegments(...square.getLineSegments()); // Start with square's segments
    resultPolygon.boolean(circle, true); // Perform difference with the circle

    // Get the line segments to draw the result
    const linesToDrawResult = resultPolygon.getLineSegments();
    // console.log("Lines for square - circle:", linesToDrawResult);

    // Example of adding hatching to a polygon
    const hatchedSquare = polygonManager.create();
    hatchedSquare.addPoints(
      { x: 100, y: 10 },
      { x: 150, y: 10 },
      { x: 150, y: 60 },
      { x: 100, y: 60 }
    );
    // hatchedSquare.addOutline();
    hatchedSquare.addHatching(Math.PI / 4, 5); // 45 degrees, 5 units density

    const hatchedLines = hatchedSquare.getLineSegments();
    // console.log("Lines for hatched square:", hatchedLines);

    console.log(hatchedLines.tp);
    // hatchedLines.tp.getLineSegments().forEach((line) => {
    //   toy.jump(line[0].x, line[0].y);
    //   toy.goto(line[1].x, line[1].y);
    // });

    // hatchedLines.forEach((line) => {
    //   toy.jump(line[0].x, line[0].y);
    //   toy.goto(line[1].x, line[1].y);
    // });

    const px = ctx.getImageData(
      bounds.x + bounds.w / 2,
      bounds.y + bounds.h / 2,
      1,
      1
    );
    console.log(px);

    // Draw a squre representing each grid item
    if (px.data[0] === 0) {
      toy.jump(bounds.x, bounds.y);
      toy.goto(bounds.x + bounds.w, bounds.y);
      toy.goto(bounds.x + bounds.w, bounds.y + bounds.h);
      toy.goto(bounds.x, bounds.y + bounds.h);
      toy.goto(bounds.x, bounds.y);
    }

    /*
    // Draw something different in each cell
    const size = Math.min(bounds.w, bounds.h);
    switch (grid.type) {
      case "circle":
        drawCircle(
          size / 2 - 20,
          bounds.x + bounds.w / 2,
          bounds.y + bounds.h / 2,
          50
        );
        break;
      case "square":
        drawSquare(
          size / 2 - 20,
          bounds.x + bounds.w / 2,
          bounds.y + bounds.h / 2
        );
        break;
      case "triangle":
        drawTriangle(
          size / 2 - 20,
          bounds.x + bounds.w / 2,
          bounds.y + bounds.h / 2
        );
        break;
      case "diamond":
        drawDiamond(
          size / 2 - 20,
          bounds.x + bounds.w / 2,
          bounds.y + bounds.h / 2
        );
        break;
      case "flower":
        drawFlower(
          size / 2 - 50,
          bounds.x + bounds.w / 2,
          bounds.y + bounds.h / 2,
          200
        );
        break;
    }
        */
  });

  toy.render();
};

const image = new Image();
let ctx;
image.src = "./on%20grids.png";
image.onload = () => {
  const canvas = document.createElement("canvas");
  canvas.width = CONFIG.width;
  canvas.height = CONFIG.height;
  ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0, CONFIG.width, CONFIG.height);
  rebuild();
};
