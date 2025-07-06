import { Turtleman } from "../Turtleman.js";

const width = 1000,
  height = 800,
  gridW = 5,
  gridH = 4,
  gridWFactor = width / gridW,
  gridHFactor = height / gridH,
  splits = 10;

const toy = new Turtleman({
  width,
  height,
  strokeWidth: 1,
  angleType: "radians",
});
container.appendChild(toy.element);

toy.reset();

const lerp = (a, b, t) => a + (b - a) * t;

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
// --- END REVISED EDGE ID FUNCTIONS ---
const points = [];
for (let i = 0; i < gridW; i++) {
  for (let j = 0; j < gridH; j++) {
    points.push({ x: i * gridWFactor, y: j * gridHFactor });
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

// --- REVISED EDGES ARRAY INITIALIZATION ---
const numHorizontalEdges = gridW * (gridH + 1);
const numVerticalEdges = gridH * (gridW + 1);
const totalEdges = numHorizontalEdges + numVerticalEdges;

const edges = [...Array(totalEdges)].map((_, i) => ({
  r: Math.random(),
}));
// --- END REVISED EDGES ARRAY INITIALIZATION ---

const drawCircle = (r, x, y, steps) => {
  const TAU = Math.PI * 2;
  toy.pu();
  toy.jump(x, y - r);
  toy.pd();
  for (let i = 0; i < steps; i++) {
    toy.right(TAU / steps);
    toy.forward((TAU * r) / steps);
  }
};

const drawGrid = () => {
  for (let i = 0; i <= gridW; i++) {
    for (let j = 0; j <= gridH; j++) {
      drawCircle(5, i * gridWFactor, j * gridHFactor, 10);
    }
  }
};

grids.forEach((grid) => {
  // toy.jump(grid.points[0].x * gridWFactor, grid.points[0].y * gridHFactor);
  // toy.goto(grid.points[1].x * gridWFactor, grid.points[1].y * gridHFactor);
  // toy.goto(grid.points[2].x * gridWFactor, grid.points[2].y * gridHFactor);
  // toy.goto(grid.points[3].x * gridWFactor, grid.points[3].y * gridHFactor);
  // toy.goto(grid.points[0].x * gridWFactor, grid.points[0].y * gridHFactor);

  // If direction = 0, top edge goes to the right, bottom edge goes to the left
  // If direction = 1, top edge goes to the left, bottom edge goes to the right
  const edgeDirection = grid.direction;

  const pointIds = getPointIdsForGridId(grid.id);

  for (let i = 0; i < splits; i++) {
    const t = i / splits;
    const topEdgePoint = {
      x: lerp(pointIds[0].x, pointIds[1].x, t),
      y: pointIds[0].y,
    };
    const leftEdgePoint = {
      x: pointIds[0].x,
      y: lerp(pointIds[0].y, pointIds[3].y, t),
    };

    if (edgeDirection === 1) {
      // Need to switch the points for lerping the opposite edge
      const bottomEdgePoint = {
        x: lerp(pointIds[2].x, pointIds[3].x, t),
        y: pointIds[2].y,
      };
      const rightEdgePoint = {
        x: pointIds[1].x,
        y: lerp(pointIds[2].y, pointIds[1].y, t),
      };

      toy.jump(topEdgePoint.x * gridWFactor, topEdgePoint.y * gridHFactor);
      toy.goto(rightEdgePoint.x * gridWFactor, rightEdgePoint.y * gridHFactor);

      toy.jump(
        bottomEdgePoint.x * gridWFactor,
        bottomEdgePoint.y * gridHFactor
      );
      toy.goto(leftEdgePoint.x * gridWFactor, leftEdgePoint.y * gridHFactor);
    } else {
      const bottomEdgePoint = {
        x: lerp(pointIds[3].x, pointIds[2].x, t),
        y: pointIds[2].y,
      };
      const rightEdgePoint = {
        x: pointIds[1].x,
        y: lerp(pointIds[1].y, pointIds[2].y, t),
      };

      toy.jump(topEdgePoint.x * gridWFactor, topEdgePoint.y * gridHFactor);
      toy.goto(leftEdgePoint.x * gridWFactor, leftEdgePoint.y * gridHFactor);
      toy.jump(
        bottomEdgePoint.x * gridWFactor,
        bottomEdgePoint.y * gridHFactor
      );
      toy.goto(rightEdgePoint.x * gridWFactor, rightEdgePoint.y * gridHFactor);
    }
  }

  // toy.jump(topEdgePoint.x * gridWFactor, topEdgePoint.y * gridHFactor);
  // toy.goto(bottomEdgePoint.x * gridWFactor, bottomEdgePoint.y * gridHFactor);

  // toy.jump(leftEdgePoint.x * gridWFactor, leftEdgePoint.y * gridHFactor);
  // toy.goto(rightEdgePoint.x * gridWFactor, rightEdgePoint.y * gridHFactor);
});
// drawGrid();

toy.render();
