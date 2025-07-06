import { Turtleman } from "../Turtleman.js";

const toy = new Turtleman({ width: 1000, height: 800, strokeWidth: 1 });
container.appendChild(toy.element);

function smoothstep(min, max, value) {
  var x = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return x * x * (3 - 2 * x);
}

// Modified archimedian spiral, makes both step size and coil separation variable
// toy.reset();
const tightness = 1; // Adjust this value to control coil spacing
// 0.1 means coils are 2*PI*0.1 = 0.628 units apart per turn.
// 1.0 means coils are 2*PI*1.0 = 6.28 units apart per turn.
let step_size = 3; // The target linear distance between points
let theta = 0; // Current angle in radians
let radius = 0.1; // Current radius
toy.goto(
  Math.cos(theta) * radius + toy.width / 2,
  Math.sin(theta) * radius + toy.height / 2
);
let i = 0;
while (radius < 1000) {
  // Using radius as the exit condition
  if (i > 150000) break; // Increased failsafe for potentially more iterations
  i++;

  // Calculate the necessary angular step (d_theta)
  const d_theta =
    step_size / Math.sqrt(tightness * tightness + radius * radius);

  // Update angle and radius
  theta += d_theta;
  radius = tightness * theta; // r = a * theta

  step_size = Math.max(smoothstep(0.1, 0, d_theta) * 20, 3); // Optimizing the SVG

  let x = Math.cos(theta) * radius + toy.width / 2;
  let y = Math.sin(theta) * radius + toy.height / 2;

  // const scale = .04;
  // const size = 20;
  // x += (Math.sin((x*scale)) + Math.cos(y*scale))*size;
  // y += (Math.cos((x*scale)) + Math.sin(y*scale))*size;

  toy.goto(x, y);
}

toy.jump(1, 1);
toy.setheading(0);
toy.forward(toy.width - 2);
toy.right(90);
toy.forward(toy.height - 2);
toy.right(90);
toy.forward(toy.width - 2);
toy.right(90);
toy.forward(toy.height - 2);

toy.render();
