import { Polygons } from "../utilities/Polygons.js";
import { Pane } from "https://cdn.jsdelivr.net/npm/tweakpane@4.0.5/dist/tweakpane.min.js";
import { Turtleman } from "../Turtleman.js";

// --- CONFIG ---
const CONFIG = {
  width: 800, // Canvas width
  height: 800, // Canvas height
  gridW: 3, // Number of grid columns
  gridH: 3, // Number of grid rows
  splits: 10,
  offset: 0.1,
  notchVariance: 0.04,
};
// --- PANE ---
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
pane.addBinding(CONFIG, "splits", {
  step: 1,
  min: 1,
  max: 30,
});
pane.addBinding(CONFIG, "offset", {
  step: 0.1,
  min: 0,
  max: 2,
});
pane.addBinding(CONFIG, "notchVariance", {
  min: 0,
  max: 0.5,
});
pane.on("change", (ev) => {
  rebuild();
});

// --- UTILITIES ---
const lerp = (a, b, t) => a + (b - a) * t;
const lerpPoint = (p1, p2, t) => ({
  x: lerp(p1.x, p2.x, t),
  y: lerp(p1.y, p2.y, t),
});
const randomBetween = (a, b) => a + Math.random() * (b - a);
// A hash function that takes an int and returns a random seeming number between 0 and 1
const hash = (x) => Math.abs(Math.sin(x * 9174986346) * 1964286753) % 1;

// --- GRID UTILITIES ---
const getPoint = (id) => {
  return {
    x: id % CONFIG.gridW,
    y: Math.floor(id / CONFIG.gridW),
  };
};
const getPointID = (x, y) => y * CONFIG.gridW + x;
const getHorizontalEdgeId = (x, y) => y * CONFIG.gridW + x;
const getVerticalEdgeId = (x, y) =>
  CONFIG.gridW * (CONFIG.gridH + 1) + (x * CONFIG.gridH + y);
const getEdgeIDBetweenPoints = (a, b) => {
  const { x: x1, y: y1 } = a;
  const { x: x2, y: y2 } = b;

  // Check for horizontal adjacency
  if (y1 === y2 && Math.abs(x1 - x2) === 1) {
    const canonicalX = Math.min(x1, x2);
    return getHorizontalEdgeId(canonicalX, y1);
  }

  // Check for vertical adjacency
  if (x1 === x2 && Math.abs(y1 - y2) === 1) {
    const canonicalY = Math.min(y1, y2);
    return getVerticalEdgeId(x1, canonicalY);
  }

  console.warn("Invalid edge between points");
  return null;
};
const getPointIdsForGridId = (id) => {
  const row = Math.floor(id / CONFIG.gridW);
  const col = id % CONFIG.gridW;
  return [
    { x: col, y: row }, // top left
    { x: col + 1, y: row }, // top right
    { x: col + 1, y: row + 1 }, // bottom right
    { x: col, y: row + 1 }, // bottom left
  ];
};

// --- MAIN ---
let toy;
const rebuild = () => {
  console.clear();
  if (toy) toy.element.remove();

  const { width, height, gridW, gridH, splits, offset, notchVariance } = CONFIG;
  const gridWFactor = width / gridW;
  const gridHFactor = height / gridH;
  const polygons = new Polygons();

  toy = new Turtleman({
    width,
    height,
    strokeWidth: 1,
    angleType: "radians",
  });
  document.getElementById("container").appendChild(toy.element);

  // toy.reset();

  const points = [...Array(gridW + 1)].map(() => []);
  for (let i = 0; i <= gridW; i++) {
    for (let j = 0; j <= gridH; j++) {
      const m = i == 0 || j == 0 || i == gridW || j == gridH ? 0 : 1;
      points[i].push({
        x: (i + randomBetween(-offset, offset) * m) * gridWFactor,
        y: (j + randomBetween(-offset, offset) * m) * gridHFactor,
      });
    }
  }
  const grids = [...Array(gridW * gridH)].map((_, i) => {
    const row = Math.floor(i / gridW);
    const col = i % gridW;

    // Each grid cell is defined by its top-left corner
    // The 4 points of the cell are: top-left, top-right, bottom-right, bottom-left
    return {
      id: i,
      points: [
        points[col][row],
        points[col + 1][row],
        points[col + 1][row + 1],
        points[col][row + 1],
      ],
      direction: Math.random() > 0.5 ? 1 : -1,
    };
  });

  const numHorizontalEdges = gridW * (gridH + 1);
  const numVerticalEdges = gridH * (gridW + 1);
  const totalEdges = numHorizontalEdges + numVerticalEdges;

  const edges = [...Array(totalEdges)].map((_, i) => ({
    r: Math.random(),
  }));

  grids.forEach((grid, i) => {
    // If direction = 0, top edge goes to the right, bottom edge goes to the left
    // If direction = 1, top edge goes to the left, bottom edge goes to the right
    const edgeDirection = grid.direction;

    const pointIds = getPointIdsForGridId(grid.id);
    const edgeSizes = [
      hash(getEdgeIDBetweenPoints(pointIds[0], pointIds[1])) * notchVariance,
      hash(getEdgeIDBetweenPoints(pointIds[1], pointIds[2])) * notchVariance,
      hash(getEdgeIDBetweenPoints(pointIds[2], pointIds[3])) * notchVariance,
      hash(getEdgeIDBetweenPoints(pointIds[3], pointIds[0])) * notchVariance,
    ];

    /*
    Takes a point a and b and draws a wedge shape where:
    - sizeA represents 2 distances to either side of a
    - sizeB represents 2 distances to either side of b
    - and direction is 1 or -1
    It returns a polygon with 4 points.
     */
    const drawNotch = (a, b, sizeA, sizeB, direction) => {
      const p = polygons.create();
      let ps = [];
      if (direction === 1) {
        ps.push(
          [a.x - sizeA, a.y],
          [a.x + sizeA, a.y],
          [b.x, b.y - sizeB],
          [b.x, b.y + sizeB]
        );
      } else {
        ps.push(
          [a.x - sizeA, a.y],
          [a.x + sizeA, a.y],
          [b.x, b.y + sizeB],
          [b.x, b.y - sizeB]
        );
      }
      p.addPoints(...ps);
      p.addHatching(Math.PI / 4, 1);
      p.outline();

      return p;
    };

    const p1 = polygons.create(),
      p2 = polygons.create();

    for (let i = 0; i < splits; i++) {
      const t = i / splits;
      // const t_adjusted = lerp(0.04, 0.96, i / splits);
      const topEdgePoint = lerpPoint(grid.points[0], grid.points[1], t);
      const leftEdgePoint = lerpPoint(grid.points[0], grid.points[3], t);
      let bottomEdgePoint, rightEdgePoint;

      if (edgeDirection === 1) {
        // Need to switch the points for lerping the opposite edge
        bottomEdgePoint = lerpPoint(grid.points[2], grid.points[3], t);
        rightEdgePoint = lerpPoint(grid.points[2], grid.points[1], t);

        const notch = drawNotch(
          topEdgePoint,
          rightEdgePoint,
          edgeSizes[0] * gridWFactor,
          edgeSizes[1] * gridHFactor,
          1
        );
        p1.addSegments(...notch.dp);
        if (i > 0) {
          const notch = drawNotch(
            bottomEdgePoint,
            leftEdgePoint,
            edgeSizes[2] * gridWFactor,
            edgeSizes[3] * gridHFactor,
            1
          );
          p1.addSegments(...notch.dp);
        }
      } else {
        bottomEdgePoint = lerpPoint(grid.points[3], grid.points[2], t);
        rightEdgePoint = lerpPoint(grid.points[1], grid.points[2], t);

        let notch = drawNotch(
          topEdgePoint,
          leftEdgePoint,
          edgeSizes[0] * gridWFactor,
          edgeSizes[3] * gridHFactor,
          -1
        );
        p1.addSegments(...notch.dp);
        notch = drawNotch(
          bottomEdgePoint,
          rightEdgePoint,
          edgeSizes[2] * gridWFactor,
          edgeSizes[1] * gridHFactor,
          -1
        );
        p1.addSegments(...notch.dp);
      }
    }
    p2.addPoints(
      [grid.points[0].x, grid.points[0].y],
      [grid.points[1].x, grid.points[1].y],
      [grid.points[2].x, grid.points[2].y],
      [grid.points[3].x, grid.points[3].y]
    );

    // p1.outline();
    p1.boolean(p2, false);

    // p2.dp = p1.dp;

    // console.log(p1);

    // polygons.draw(toy, p1);
    // p2.addHatching(Math.random(), 5);
    // p2.addOutline();
    polygons.draw(toy, p1);
  });
  // drawGrid();

  toy.render();
};
rebuild();
