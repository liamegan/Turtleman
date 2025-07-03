import Shape from "https://esm.sh/clipper-js";
import { Turtleman } from "../Turtleman.js";

/**
 * Clipping uses the clipper library
 * https://github.com/Doodle3D/clipper-js
 */

const toy = new Turtleman();
container.appendChild(toy.element);

const squareCommands = `
  forward 100
  right 90
  forward 100
  right 90
  forward 100
  penup
  forward 50
  right 90
  forward 50
  pendown
  forward 100
  right 90
  forward 100
  right 90
  forward 100
`;
toy.drawCommands(squareCommands);

const groups = toy.lineGroups;
const a = groups[0].points.map((p) => {
  return { X: p.x, Y: p.y };
});
const b = groups[1].points.map((p) => {
  return { X: p.x, Y: p.y };
});

const subject = new Shape([a], true);
const clip = new Shape([b], true);
const result = subject.xor(clip);

result.paths.forEach((path) => {
  const g = {
    points: path.map((p) => {
      return { x: p.X - 160, y: p.Y - 160 };
    }),
  };
  if (result.closed) {
    g.points.push(g.points[0]);
  }
  toy.addLineGroup(g);
});

// console.log(subject, Shape.difference(subject, clip));

// toy.lineGroups.forEach((group) => {
//   console.log(group);

//   group.points.forEach((point) => {
//     point.x -= 160;
//     point.y -= 160;
//   });

//   toy.addLineGroup(group);
// });

toy.render();
