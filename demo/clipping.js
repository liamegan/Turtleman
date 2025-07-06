import { Polygons } from "../utilities/Polygons.js";
import { Turtleman } from "../Turtleman.js";

const toy = new Turtleman();
container.appendChild(toy.element);

const polygons = new Polygons();

const squareCommands = `
  forward 100
  right 90
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
  right 90
  forward 100
`;
toy.drawCommands(squareCommands);

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

toy.render();
