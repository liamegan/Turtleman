import { Turtleman } from "../Turtleman.js";
import { Polygons } from "../utilities/Polygons.js";

/**
 * Clipping uses the clipper library
 * https://github.com/Doodle3D/clipper-js
 */

const toy = new Turtleman({ strokeWidth: 1 });
container.appendChild(toy.element);

const polygons = new Polygons();

/**
 * Draw the spiral
 */
const tightness = 1; // Adjust this value to control coil spacing
let step_size = 3; // The target linear distance between points
let theta = 0; // Current angle in radians
let radius = 0.1; // Current radius
toy.goto(
  Math.cos(theta) * radius + toy.width / 2,
  Math.sin(theta) * radius + toy.height / 2
);
let i = 0;
while (radius < 500) {
  if (i > 150000) break;
  i++;

  // Calculate the necessary angular step (d_theta)
  const d_theta =
    step_size / Math.sqrt(tightness * tightness + radius * radius);

  // Update angle and radius
  theta += d_theta;
  radius = tightness * theta; // r = a * theta

  let x = Math.cos(theta) * radius + toy.width / 2;
  let y = Math.sin(theta) * radius + toy.height / 2;

  const scale = 0.04;
  const size = 20;
  x += (Math.sin(x * scale) + Math.cos(y * scale)) * size;
  y += (Math.cos(x * scale) + Math.sin(y * scale)) * size;

  toy.goto(x, y);
}

/**
 * Draw the square
 */
const squareSize = 400;
toy.penup();
toy.jump(toy.width / 2 - squareSize / 2, toy.height / 2 - squareSize / 2);
toy.pendown();
toy.setheading(0);
toy.forward(squareSize);
toy.right(90);
toy.forward(squareSize);
toy.right(90);
toy.forward(squareSize);
toy.right(90);
toy.forward(squareSize);

/**
 * Clip the spiral with the square
 */
const groups = toy.lineGroups;
toy.reset();

// const a = groups[0].points.map((p) => {
//   return [p.x, p.y];
// });
// const b = groups[1].points.map((p) => {
//   return [p.x, p.y];
// });

const a = polygons.create();
const b = polygons.create();

const ga = groups[0].points;
ga.map((p, i) => {
  if (i < ga.length - 1) a.addSegments([p.x, p.y], Object.values(ga[i + 1]));
});
b.addPoints(...groups[1].points.map((p) => [p.x, p.y]));

a.boolean(b, false);

polygons.draw(toy, a);

// result.paths.forEach((path) => {
//   const g = {
//     points: path.map((p) => {
//       return { x: p.X, y: p.Y };
//     }),
//   };
//   if (result.closed) {
//     g.points.push(g.points[0]);
//   }
//   toy.addLineGroup(g);
// });

toy.render();
