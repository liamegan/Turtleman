import { Polygons } from "../utilities/Polygons.js";
import { Pane } from "https://cdn.jsdelivr.net/npm/tweakpane@4.0.5/dist/tweakpane.min.js";
import { Turtleman } from "../Turtleman.js";

const CONFIG = {
  width: 800, // Canvas width
  height: 800, // Canvas height
  gridW: 5, // Number of grid columns
  gridH: 5, // Number of grid rows
  splits: 20,
  offset: 0.7,
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
pane.on("change", (ev) => {
  rebuild();
});

let toy;
const rebuild = () => {
  console.clear();
  if (toy) toy.element.remove();

  const { width, height, gridW, gridH, splits, offset } = CONFIG;
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

  toy.reset();

  const lerp = (a, b, t) => a + (b - a) * t;
  const lerpPoint = (p1, p2, t) => ({
    x: lerp(p1.x, p2.x, t),
    y: lerp(p1.y, p2.y, t),
  });
  const randomBetween = (a, b) => a + Math.random() * (b - a);

  const getPoint = (id) => {
    return {
      x: id % gridW,
      y: Math.floor(id / gridW),
    };
  };
  const getPointID = (x, y) => y * gridW + x;
  const getHorizontalEdgeId = (x, y) => y * gridW + x;
  const getVerticalEdgeId = (x, y) => gridW * (gridH + 1) + (x * gridH + y);
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
  const getPointIdsForGridId = (id) => {
    const row = Math.floor(id / gridW);
    const col = id % gridW;
    return [
      { x: col, y: row }, // top left
      { x: col + 1, y: row }, // top right
      { x: col + 1, y: row + 1 }, // bottom right
      { x: col, y: row + 1 }, // bottom left
    ];
  };
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

    const p1 = polygons.create(),
      p2 = polygons.create();

    for (let i = 0; i < splits; i++) {
      const t = i / splits;
      const topEdgePoint = lerpPoint(grid.points[0], grid.points[1], t);
      const leftEdgePoint = lerpPoint(grid.points[0], grid.points[3], t);
      let bottomEdgePoint, rightEdgePoint;

      if (edgeDirection === 1) {
        // Need to switch the points for lerping the opposite edge
        bottomEdgePoint = lerpPoint(grid.points[2], grid.points[3], t);
        rightEdgePoint = lerpPoint(grid.points[2], grid.points[1], t);

        p1.addSegments(
          [topEdgePoint.x, topEdgePoint.y],
          [rightEdgePoint.x, rightEdgePoint.y]
        );
        // Why is there an extra segment?
        if (i > 0) {
          p1.addSegments(
            [bottomEdgePoint.x, bottomEdgePoint.y],
            [leftEdgePoint.x, leftEdgePoint.y]
          );
        }
      } else {
        bottomEdgePoint = lerpPoint(grid.points[3], grid.points[2], t);
        rightEdgePoint = lerpPoint(grid.points[1], grid.points[2], t);

        p1.addSegments(
          [topEdgePoint.x, topEdgePoint.y],
          [leftEdgePoint.x, leftEdgePoint.y],
          [bottomEdgePoint.x, bottomEdgePoint.y],
          [rightEdgePoint.x, rightEdgePoint.y]
        );
      }
    }
    p2.addPoints(
      [grid.points[0].x, grid.points[0].y],
      [grid.points[1].x, grid.points[1].y],
      [grid.points[2].x, grid.points[2].y],
      [grid.points[3].x, grid.points[3].y]
    );

    // p1.boolean(p2);

    p2.dp = p1.dp;

    // console.log(p1);

    // polygons.draw(toy, p1);
    // p2.addHatching(Math.random(), 5);
    // p2.addOutline();
    polygons.draw(toy, p2);
  });
  // drawGrid();

  toy.render();
};
rebuild();
