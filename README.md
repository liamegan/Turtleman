# Turtleman

`Turtleman` is a JavaScript class that lets you draw SVG graphics programmatically using a "turtle graphics" paradigm, much like Logo. You can control a virtual "turtle" that moves around an SVG canvas, leaving a trail behind it. This makes it intuitive to create geometric shapes and designs.

---

## Installation

### NPM (Recommended)

```bash
npm install turtleman
```

### Manual Installation

Download the `Turtleman.js` file and include it in your project.

---

## Usage

To use `Turtleman`, create an instance of the `Turtleman` class and append its element to your HTML document. Then, you can call various methods to control the turtle's movement and drawing.

### Basic Setup

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Turtleman Example</title>
    <style>
      body {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        margin: 0;
        background-color: #f0f0f0;
      }
      .turtleman-container {
        border: 1px solid #ccc;
        box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.1);
        position: relative;
      }
      .turtleman-container a {
        position: absolute;
        top: 10px;
        right: 10px;
        background: #007bff;
        color: white;
        padding: 5px 10px;
        text-decoration: none;
        border-radius: 3px;
        font-size: 12px;
        display: none;
      }
    </style>
  </head>
  <body>
    <div id="turtle-container"></div>

    <script type="module">
      // If using npm: import { Turtleman } from "turtleman";
      // If manual installation: import { Turtleman } from "./Turtleman.js";
      import { Turtleman } from "turtleman";

      const container = document.getElementById("turtle-container");
      const turtle = new Turtleman({
        width: 600,
        height: 400,
        startPosition: { x: 300, y: 200 },
        strokeColour: "blue",
        strokeWidth: 3,
      });

      container.appendChild(turtle.element);

      // Example drawing commands
      turtle.forward(100);
      turtle.right(90);
      turtle.forward(50);
      turtle.left(45);
      turtle.backward(70);
      turtle.pu(); // Shorthand for penup
      turtle.goto(100, 100);
      turtle.pd(); // Shorthand for pendown
    </script>
  </body>
</html>
```

## Drawing Methods

Turtleman provides three different approaches for creating drawings, each suited for different use cases:

### 1. Direct Method Calls

The most straightforward approach is to call drawing methods directly on the turtle instance:

```javascript
const turtle = new Turtleman();

// Draw a square
turtle.forward(100);
turtle.right(90);
turtle.forward(100);
turtle.right(90);
turtle.forward(100);
turtle.right(90);
turtle.forward(100);

// Change color and draw a triangle
turtle.strokeColour = "red";
turtle.forward(80);
turtle.right(120);
turtle.forward(80);
turtle.right(120);
turtle.forward(80);
```

This approach is ideal for programmatic artwork.

### 2. Command Strings with `drawCommands()`

```javascript
const turtle = new Turtleman();

const drawingCommands = `
forward 100
right 90
forward 100
right 90
forward 100
right 90
forward 100
penup
goto 0 0
pendown
setcolor red
forward 80
right 120
forward 80
right 120
forward 80
`;

turtle.drawCommands(drawingCommands);
```

This approach is ideal for when you might want a serialized drawing.

### 3. Line Groups with `addLineGroup()`

For advanced use cases where you want to add pre-defined line segments with specific properties:

```javascript
const turtle = new Turtleman();

// Define a line group object
const lineGroup = {
  points: [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
    { x: 100, y: 100 },
    { x: 0, y: 100 },
    { x: 0, y: 0 },
  ],
  strokeColour: "blue", // optional
  strokeWidth: 3, // optional
};

turtle.addLineGroup(lineGroup);

// Add another line group with different properties
const triangleGroup = {
  points: [
    { x: 50, y: 50 },
    { x: 150, y: 50 },
    { x: 100, y: 150 },
    { x: 50, y: 50 },
  ],
  strokeColour: "red",
  strokeWidth: 2,
};

turtle.addLineGroup(triangleGroup);
```

#### Line Group Object Structure

The `addLineGroup()` method expects an object with the following properties:

- **`points`** (Array, required): Array of coordinate objects `{ x: number, y: number }`. Must have at least 2 points.
- **`strokeColour`** (string, optional): Color of the lines. Defaults to the turtle's current stroke color.
- **`strokeWidth`** (number, optional): Width of the lines. Defaults to the turtle's current stroke width.

This approach is ideal for:

- Adding pre-computed shapes
- Importing drawings from other systems
- Batch operations
- When you have coordinate data from external sources

## API Reference

### Constructor

- **`new Turtleman(options)`**: Creates a new `Turtleman` instance.

  - `options` (Object, optional):
    - `width` (number, default: 500): Width of the SVG canvas.
    - `height` (number, default: 500): Height of the SVG canvas.
    - `startPosition` (Object `{ x, y }`, default: center of canvas): Initial coordinates of the turtle.
    - `heading` (number, default: 0): Initial direction of the turtle.
    - `penDown` (boolean, default: true): Whether the pen is down for drawing.
    - `strokeColour` (string, default: "black"): Color of the drawn lines (e.g., "red", "#FF0000").
    - `strokeWidth` (number, default: 2): Thickness of the drawn lines.
    - `angleType` (string, default: "degrees"): "degrees" or "radians" for angle units.
    - `filename` (string, default: "turtleman_drawing"): Default filename for SVG downloads.
    - `precision` (number, default: 2): Number of decimal places for coordinate rounding.
    - `mode` (string, default: "contiguous"): "contiguous" or "discrete" rendering mode.

### Methods

#### Drawing Commands

- **`forward(distance)`** / **`fw(distance)`**: Moves the turtle forward by `distance` units in the current heading.
- **`backward(distance)`** / **`bk(distance)`**: Moves the turtle backward by `distance` units.
- **`goto(x, y)`** / **`setxy(x, y)`**: Moves the turtle to the specified `(x, y)` coordinates, drawing a line if the pen is down.
- **`moveby(x, y)`**: Moves the turtle by the specified `(x, y)` offset, drawing a line if the pen is down.
- **`jumpto(x, y)`** / **`jump(x, y)`**: Moves the turtle to the specified `(x, y)` coordinates _without_ drawing a line, regardless of pen state.
- **`home()`** / **`hm()`**: Moves the turtle to its `startPosition`, drawing a line if the pen is down.
- **`right(angle)`** / **`rt(angle)`**: Turns the turtle `angle` units to the right (clockwise). Units depend on `angleType`.
- **`left(angle)`** / **`lt(angle)`**: Turns the turtle `angle` units to the left (counter-clockwise). Units depend on `angleType`.
- **`setheading(angle)`** / **`seth(angle)`**: Sets the turtle's absolute heading to `angle`. 0 is facing right (east). Units depend on `angleType`.
- **`setPenDown(isDown)`**: Sets the pen state. `true` to draw, `false` to not draw.
- **`penup()`** / **`pu()`**: Lifts the pen (stops drawing).
- **`pendown()`** / **`pd()`**: Puts the pen down (starts drawing).

#### Command Processing

- **`processCommand(commandLine)`**: Processes a single string command (e.g., "forward 100"). Used internally by `drawCommands`.
- **`drawCommands(commandInput)`**: Parses and executes a multiline string of turtle commands. Resets the turtle before drawing.

#### Rendering & State Management

- **`reset(options)`**: Resets the turtle's state to its initial configuration or new `options`. Clears all drawn lines.
- **`render()`**: Renders all drawing commands to SVG. Called automatically when needed.
- **`update()`**: Triggers a re-render of the drawing.
- **`clearDrawing()`**: Clears all drawing commands and re-renders.

#### Advanced Drawing

- **`addDrawingCommand(command)`**: Adds a drawing command to the internal command array.
- **`addLineGroup(lineGroup)`**: Adds a group of connected lines with shared properties.
- **`drawLine(point1, point2)`**: Internal method to draw a line between two points.

#### Download & Export

- **`downloadSVG()`**: Downloads the current drawing as an SVG file.

### Properties

#### Core Properties

- **`element`** (HTMLElement): The wrapper div containing the SVG and download link. Append this to your HTML.
- **`svg`** (HTMLElement): The SVG element generated by the class.
- **`width`** (number): Current width of the SVG canvas.
- **`height`** (number): Current height of the SVG canvas.
- **`position`** (Object `{ x, y }`): Current coordinates of the turtle.
- **`home`** (Object `{ x, y }`): The initial position set during construction or `reset`.
- **`heading`** (number): Current heading of the turtle (normalized to 0-360 degrees or 0-2π radians).
- **`radians`** (number): The current heading converted to radians (getter/setter).
- **`penDown`** (boolean): Current pen state (`true` if drawing, `false` otherwise).

#### Styling Properties

- **`strokeColour`** (string): Current stroke color for lines.
- **`strokeWidth`** (number): Current stroke width for lines.
- **`angleType`** (string): "degrees" or "radians".
- **`precision`** (number): Number of decimal places for coordinate rounding.

#### Configuration Properties

- **`mode`** (string): "contiguous" or "discrete" rendering mode.
- **`filename`** (string): Default filename for SVG downloads.
- **`commands`** (Array): Array of all drawing commands (read-only).

#### Internal Properties

- **`lineGroups`** (Array): Groups of connected lines for contiguous rendering mode.
- **`needsRender`** (boolean): Whether the SVG needs to be re-rendered.
- **`lineIndex`** (number): Current line group index.

### Command String Format

The `drawCommands()` method accepts a multiline string with commands in the following format:

```
forward 100
right 90
forward 50
penup
goto 0 0
pendown
setcolor red
setwidth 3
```

Supported commands:

- `forward <distance>` or `fd <distance>`
- `backward <distance>` or `bk <distance>`
- `goto <x> <y>` or `setxy <x> <y>`
- `jump <x> <y>` or `jumpto <x> <y>`
- `home` or `hm`
- `right <angle>` or `rt <angle>`
- `left <angle>` or `lt <angle>`
- `setheading <angle>` or `seth <angle>`
- `penup` or `pu`
- `pendown` or `pd`
- `setcolor <color>` or `setcolour <color>` or `color <color>` or `colour <color>` or `sc <color>`
- `setwidth <width>` or `width <width>` or `sw <width>`

### Rendering Modes

- **`contiguous`** (default): Renders connected lines as SVG paths for better performance and smaller file sizes.
- **`discrete`**: Renders each line as a separate SVG line element for more granular control.

### Download Feature

The Turtleman instance automatically includes a download link that appears when you hover over the drawing area. Click it to download the current drawing as an SVG file.
