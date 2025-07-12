import { Polygons } from "../utilities/Polygons.js";
import { Pane } from "https://cdn.jsdelivr.net/npm/tweakpane@4.0.5/dist/tweakpane.min.js";
import { Turtleman } from "../Turtleman.js";

// --- CONFIG ---
const CONFIG = {
  width: 800, // Canvas width
  height: 800, // Canvas height
  boxSize: 600,
  splits: 10, // The number of splits
  notchSize: 0.5, // The size of the notch - relative to the space it can concievably take up
};
// notchSize can be thought of as the radio of the size of the quad to the space around it.
// --- PANE ---
const pane = new Pane();
pane.addBinding(CONFIG, "width");
pane.addBinding(CONFIG, "height");

pane.addBinding(CONFIG, "splits", {
  step: 1,
  min: 1,
  max: 30,
});
pane.addBinding(CONFIG, "notchSize", {
  step: 0.01,
  min: 0,
  max: 4,
});
pane.on("change", (ev) => {
  rebuild();
});

// --- UTILITIES ---
const lerp = (a, b, t) => a + (b - a) * t;
const lerpPoint = (p1, p2, t) => [lerp(p1[0], p2[0], t), lerp(p1[1], p2[1], t)];
const randomBetween = (a, b) => a + Math.random() * (b - a);
// A hash function that takes an int and returns a random seeming number between 0 and 1
const hash = (x) => Math.abs(Math.sin(x * 9174986346) * 1964286753) % 1;

// --- MAIN ---
let toy;
const rebuild = () => {
  console.clear();
  if (toy) toy.element.remove();

  const { width, height, splits, notchSize } = CONFIG;
  const polygons = new Polygons();

  toy = new Turtleman({
    width,
    height,
    strokeWidth: 1,
    angleType: "radians",
    offset: { x: width / 2, y: height / 2 },
  });
  document.getElementById("container").appendChild(toy.element);

  const s = CONFIG.boxSize / 2;
  const points = [
    [-s, -s],
    [s, -s],
    [s, s],
    [-s, s],
  ];

  // Lerp between the top-left and top-right points
  // Based on the splits. And draw a quad from top to bottom
  // The width of which is the notchSize. The left edge of the quad should be the left side of the square
  const l = points[1][0] - points[0][0]; // The length of the top edge
  const spaces = splits > 1 ? splits - 1 : 0;
  const spaceW = splits > 1 ? (1 / (splits * notchSize + spaces)) * l : 0;
  const notchSizeinPx = splits === 1 ? l : spaceW * notchSize;
  let x = points[0][0];

  console.log(splits, spaces, spaceW, notchSizeinPx);

  for (let i = 0; i < splits; i++) {
    const p = polygons.create();
    p.addPoints(
      [x, points[0][1]],
      [x + notchSizeinPx, points[0][1]],
      [x + notchSizeinPx, points[3][1]],
      [x, points[3][1]]
    );
    x += notchSizeinPx + spaceW;
    p.outline();
    p.addHatching(Math.PI / 4, 3);
    polygons.draw(toy, p);
  }

  const p = polygons.create();
  p.addPoints(...points);
  p.outline();
  polygons.draw(toy, p);

  toy.render();
};
rebuild();
