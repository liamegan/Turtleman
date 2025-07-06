import { Polygons } from "../utilities/Polygons.js";
import { Pane } from "https://cdn.jsdelivr.net/npm/tweakpane@4.0.5/dist/tweakpane.min.js";
import { Turtleman } from "../Turtleman.js";

const CONFIG = {
  width: 1200, // Canvas width
  height: 600, // Canvas height
  gridW: 100, // Number of grid columns
  gridH: 50, // Number of grid rows
};
const polys = []; // Store the polygons for each cell
const polygons = new Polygons();

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

  // Clear the polygons array for each rebuild
  polys.length = 0;

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
    };
  });

  /*
   * Some basic drawing functions
   */
  // The square moves to the top-left of the square shape
  // as defined by the x, y and radius (width) of the square
  // Then it walks forward, and turns right (1.57 = 90 degrees)
  // repeating until the square is complete.
  const drawSquare = (r, x, y, a = 0) => {
    toy.seth(a);
    toy.jump(x - r, y - r);
    toy.forward(r * 2);
    toy.right(1.5708);
    toy.forward(r * 2);
    toy.right(1.5708);
    toy.forward(r * 2);
    toy.right(1.5708);
    toy.forward(r * 2);
  };

  /*
   * Drawing
   */
  // Only draw if we have a canvas context
  if (ctx) {
    gridCells.forEach((grid) => {
      const { bounds, points } = grid;

      const px = ctx.getImageData(
        bounds.x + bounds.w / 2,
        bounds.y + bounds.h / 2,
        1,
        1
      );

      // Draw a squre representing each grid item
      if (px.data[0] === 0) {
        const rn = Math.random() * 0.5 - 0.25;
        drawSquare(
          bounds.w / 2 + 1,
          bounds.x + bounds.w / 2,
          bounds.y + bounds.h / 2,
          rn
        );
      }
    });

    const groups = toy.lineGroups;
    console.log(groups);

    toy.reset();

    for (let i = 0; i < groups.length; i++) {
      console.log(groups[i]);

      const p1 = polygons.create(),
        p2 = polygons.create();

      p1.addPoints(...groups[i].points.map((p) => [p.x, p.y]));

      p1.addOutline();

      polygons.draw(toy, p1);
    }
  }

  toy.render();
};

const image = new Image();
let ctx;
image.src = "./on%20grids.png";
image.onload = () => {
  const canvas = document.createElement("canvas");
  canvas.width = CONFIG.width;
  canvas.height = CONFIG.height;
  ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(image, 0, 0, CONFIG.width, CONFIG.height);
  rebuild();
};
