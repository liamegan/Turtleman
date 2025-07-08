import { Pane } from "https://cdn.jsdelivr.net/npm/tweakpane@4.0.5/dist/tweakpane.min.js";
import { Turtleman } from "../Turtleman.js";
import { Polygons } from "../utilities/Polygons.js";

console.clear();

const CONFIG = {
  width: 1200, // Canvas width
  height: 600, // Canvas height
  gridW: 12, // Number of grid columns
  gridH: 6, // Number of grid rows
  postitSize: 1200 / 400,
  angleSize: 0.2,
  stroke: 2,
};

const pane = new Pane();
// pane.addBinding(CONFIG, "width");
// pane.addBinding(CONFIG, "height");
pane.addBinding(CONFIG, "gridW", {
  step: 1,
  min: 1,
  max: 50,
});
pane.addBinding(CONFIG, "gridH", {
  step: 1,
  min: 1,
  max: 25,
});
pane.addBinding(CONFIG, "angleSize", {
  min: 0,
  max: 2,
});
pane.addBinding(CONFIG, "stroke", {
  step: 1,
  min: 1,
  max: 5,
});
pane.on("change", (ev) => {
  rebuild();
});

let toy;
const rebuild = () => {
  if (toy) toy.element.remove();

  const polys = []; // Store the polygons for each cell
  const polygons = new Polygons();

  const { width, height, gridW, gridH } = CONFIG;
  const gridWFactor = width / gridW, // Width of a cell in pixels
    gridHFactor = height / gridH; // Height of a cell in pixels

  // Create the Turtleman
  toy = new Turtleman({
    width: width,
    height: height,
    angleType: "radians",
    strokeWidth: CONFIG.stroke,
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
      direction: Math.floor(Math.random() * 4),
    };
  });

  const getTriForDir = (d) => {
    switch (d) {
      case 0:
        return [0, 1, 2];
      case 1:
        return [1, 2, 3];
      case 2:
        return [2, 3, 0];
      case 3:
        return [3, 0, 2];
    }
  };

  /*
   * Some basic drawing functions
   */
  const rotatePoint = (p, c, a = 0) => {
    const r = [Math.cos(a), Math.sin(a)];
    const t = p.map((p, i) => p - c[i]);
    const u = [t[0] * r[0] - t[1] * r[1], t[0] * r[1] + t[1] * r[0]];
    return u.map((p, i) => p + c[i]);
  };
  // The square moves to the top-left of the square shape
  // as defined by the x, y and radius (width) of the square
  // Then it walks forward, and turns right (1.57 = 90 degrees)
  // repeating until the square is complete.
  const drawSquare = (r, x, y, a = 0, rtn = false) => {
    const tl = rotatePoint([x - r, y - r], [x, y], a);
    if (rtn) toy.startCapture();
    toy.jump(...tl);
    toy.seth(a);
    for (let i = 0; i < 4; i++) toy.forward(r * 2), toy.right(1.5708);
    if (rtn) return toy.endCapture();
  };

  /*
   * Drawing
   */
  // Only draw if we have a canvas context
  gridCells.forEach((grid, _i) => {
    const { bounds, points } = grid;

    const center = [bounds.x + bounds.w / 2, bounds.y + bounds.h / 2];

    const delta = Math.random() * CONFIG.angleSize - CONFIG.angleSize * 0.5;

    const sq = drawSquare(bounds.w / 2, ...center, delta, true).map((p) => {
      return [p.x, p.y];
    });

    const p0 = polygons.create();
    p0.addPoints(...sq);
    p0.addOutline();
    console.log(p0);

    const tri = getTriForDir(grid.direction);
    const [a, b, c] = tri.map((p) => {
      return {
        x: points[p].x * bounds.w,
        y: points[p].y * bounds.h,
      };
    });
    const ps = [];
    ps.push(rotatePoint([a.x, a.y], center, delta));
    ps.push(rotatePoint([b.x, b.y], center, delta));
    ps.push(rotatePoint([c.x, c.y], center, delta));
    ps.push(rotatePoint([a.x, a.y], center, delta));

    const p1 = polygons.create();

    p1.addPoints(...ps);
    p1.addHatching(1, 3);
    p1.addOutline();

    p0.addSegments(...p1.dp);

    // polygons.draw(toy, p1);

    polygons.draw(toy, p0);
  });

  toy.render();
};

rebuild();
