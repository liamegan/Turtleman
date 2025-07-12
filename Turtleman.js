"use strict";

const EPSILON = 0.0001;

const inside_rect = (a, minX, maxX, minY, maxY) => {
  return a.x >= minX && a.x <= maxX && a.y >= minY && a.y <= maxY;
};

const find_segment_intersect = (l1p1, l1p2, l2p1, l2p2) => {
  const d =
    (l2p2.y - l2p1.y) * (l1p2.x - l1p1.x) -
    (l2p2.x - l2p1.x) * (l1p2.y - l1p1.y);
  const n_a =
    (l2p2.x - l2p1.x) * (l1p1.y - l2p1.y) -
    (l2p2.y - l2p1.y) * (l1p1.x - l2p1.x);
  const n_b =
    (l1p2.x - l1p1.x) * (l1p1.y - l2p1.y) -
    (l1p2.y - l1p1.y) * (l1p1.x - l2p1.x);
  if (d === 0) {
    return false;
  }
  const ua = n_a / d;
  const ub = n_b / d;
  if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
    return {
      x: l1p1.x + ua * (l1p2.x - l1p1.x),
      y: l1p1.y + ua * (l1p2.y - l1p1.y),
    };
  }
  return false;
};

function clipPathsRect(paths, minX, maxX, minY, maxY) {
  let clippedPaths = [];
  let rectCorners = [
    { x: minX, y: minY },
    { x: maxX, y: minY },
    { x: maxX, y: maxY },
    { x: minX, y: maxY },
    { x: minX, y: minY },
  ];

  for (let path of paths) {
    if (!path || path.length === 0) continue;

    let currentClippedPath = [];
    let prevInside = false;

    for (let i = 0; i < path.length - 1; i++) {
      let pointA = path[i];
      let pointB = path[i + 1];
      let insideA = inside_rect(pointA, minX, maxX, minY, maxY);
      let insideB = inside_rect(pointB, minX, maxX, minY, maxY);

      if (insideA) {
        if (!prevInside || i === 0) {
          if (currentClippedPath.length > 0) {
            clippedPaths.push(currentClippedPath);
          }
          currentClippedPath = [];
          currentClippedPath.push(pointA);
        }
        if (insideB) {
          currentClippedPath.push(pointB);
          prevInside = true;
          continue;
        }
      }

      // At least one point is outside, or a segment crosses the boundary.
      let segmentIntersectsBoundary = false;
      let intersectionPoint = null;

      for (let j = 0; j < rectCorners.length - 1; j++) {
        let cornerA = rectCorners[j];
        let cornerB = rectCorners[j + 1];
        let intersection = find_segment_intersect(
          pointA,
          pointB,
          cornerA,
          cornerB
        );

        if (intersection) {
          segmentIntersectsBoundary = true;
          intersectionPoint = intersection;

          if (
            currentClippedPath.length === 0 ||
            !(
              Math.abs(
                currentClippedPath[currentClippedPath.length - 1].x -
                  intersection.x
              ) < EPSILON &&
              Math.abs(
                currentClippedPath[currentClippedPath.length - 1].y -
                  intersection.y
              ) < EPSILON
            )
          ) {
            currentClippedPath.push(intersectionPoint);
          }
        }
      }

      if (!insideA && insideB) {
        currentClippedPath.push(pointB);
      } else if (!segmentIntersectsBoundary && !insideA && !insideB) {
        if (currentClippedPath.length > 0) {
          clippedPaths.push(currentClippedPath);
        }
        currentClippedPath = [];
      }

      prevInside = insideB;
    }

    if (currentClippedPath.length > 0) {
      clippedPaths.push(currentClippedPath);
    }
  }

  return clippedPaths.filter((p) => p.length > 1);
}

/**
 * Turtleman - A JavaScript library for creating SVG graphics using turtle graphics programming
 *
 * Turtleman lets you control a virtual "turtle" that moves around an SVG canvas, leaving a trail behind it.
 * This makes it intuitive to create geometric shapes and designs programmatically.
 *
 * @example
 * ```javascript
 * const turtle = new Turtleman({
 *   width: 600,
 *   height: 400,
 *   strokeColour: "blue",
 *   strokeWidth: 2
 * });
 *
 * // Draw a square
 * for (let i = 0; i < 4; i++) {
 *   turtle.forward(100);
 *   turtle.right(90);
 * }
 * ```
 */
export class Turtleman {
  /**
   * Creates a new Turtleman instance
   *
   * @param {Object} options - Configuration options for the turtle
   * @param {number} [options.width=500] - Width of the SVG canvas
   * @param {number} [options.height=500] - Height of the SVG canvas
   * @param {Object} [options.startPosition] - Initial coordinates of the turtle
   * @param {number} [options.startPosition.x] - Initial x coordinate (defaults to width/2)
   * @param {number} [options.startPosition.y] - Initial y coordinate (defaults to height/2)
   * @param {number} [options.heading=0] - Initial direction of the turtle
   * @param {boolean} [options.penDown=true] - Whether the pen is down for drawing
   * @param {string} [options.strokeColour="black"] - Color of the drawn lines
   * @param {number} [options.strokeWidth=2] - Thickness of the drawn lines
   * @param {string} [options.angleType="degrees"] - "degrees" or "radians" for angle units
   * @param {string} [options.filename="turtleman_drawing"] - Default filename for SVG downloads
   * @param {number} [options.precision=2] - Number of decimal places for coordinate rounding
   * @param {string} [options.mode="contiguous"] - "contiguous" or "discrete" rendering mode
   */
  constructor({
    width = 500,
    height = 500,
    startPosition = { x: width / 2, y: height / 2 },
    heading = 0,
    penDown = true,
    strokeColour = "black",
    strokeWidth = 2,
    angleType = "degrees",
    filename = "turtleman_drawing",
    precision = 2,
    mode = "contiguous", // 'contiguous' or 'discrete'
    crop = true,
    offset = { x: 0, y: 0 },
  } = {}) {
    // Create a wrapper div to contain the SVG
    this.wrapperDiv = document.createElement("div");
    this.wrapperDiv.classList.add("turtleman-container");

    this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.svg.setAttribute("width", width);
    this.svg.setAttribute("height", height);
    this.svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    this.wrapperDiv.appendChild(this.svg);

    // Create the download link
    this.downloadLink = document.createElement("a");
    this.downloadLink.textContent = "Download SVG";
    this.downloadLink.href = "#";
    this.wrapperDiv.appendChild(this.downloadLink);

    this.reset({
      width,
      height,
      startPosition,
      heading,
      penDown,
      strokeColour,
      strokeWidth,
      angleType,
      precision,
      mode,
      crop,
      offset,
    });

    this.filename = filename;

    this.addDownloadListeners();
  }

  // ============================================================================
  // CORE PROPERTIES AND GETTERS/SETTERS
  // ============================================================================

  /**
   * Gets the wrapper div containing the SVG and download link
   * @returns {HTMLElement} The wrapper div element
   */
  get element() {
    return this.wrapperDiv;
  }

  /**
   * Gets the SVG element
   * @returns {HTMLElement} The SVG element
   */
  get svg() {
    return this._svg;
  }

  /**
   * Sets the SVG element
   * @param {HTMLElement} value - The SVG element
   */
  set svg(value) {
    this._svg = value;
  }

  /**
   * Gets the current heading of the turtle
   * @returns {number} The current heading (normalized to 0-360 degrees or 0-2π radians)
   */
  get heading() {
    return this._heading;
  }

  /**
   * Sets the heading of the turtle
   * @param {number} value - The new heading value
   */
  set heading(value) {
    if (this.angleType === "radians") {
      const TAU = Math.PI * 2;
      this._heading = ((value % TAU) + TAU) % TAU;
    } else {
      this._heading = ((value % 360) + 360) % 360;
    }
  }

  /**
   * Gets the current heading in radians
   * @returns {number} The current heading in radians
   */
  get radians() {
    if (this.angleType === "radians") {
      return this.heading;
    }
    return (this.heading * Math.PI) / 180;
  }

  /**
   * Sets the heading using radians
   * @param {number} value - The new heading in radians
   */
  set radians(value) {
    if (this.angleType === "radians") {
      this.heading = value;
    } else {
      this.heading = (value * 180) / Math.PI;
    }
  }

  /**
   * Gets all drawing commands (read-only)
   * @returns {Array} Array of all drawing commands
   */
  get commands() {
    return [...this.drawingCommands];
  }

  /**
   * Gets whether coordinate capture mode is currently active
   * @returns {boolean} True if capture mode is active
   */
  get capturing() {
    return this.isCapturing;
  }

  /**
   * Gets groups of connected lines for contiguous rendering mode
   * @returns {Array} Array of line groups
   */
  get lineGroups() {
    const pathGroups = new Map();

    this.drawingCommands.forEach((command) => {
      if (command.type === "line") {
        const key = `${command.strokeColour}-${command.strokeWidth}-${command.i}`;
        if (!pathGroups.has(key)) {
          pathGroups.set(key, {
            strokeColour: command.strokeColour,
            strokeWidth: command.strokeWidth,
            index: command.i,
            points: [],
          });
        }
        const group = pathGroups.get(key);
        if (group.points.length === 0) {
          group.points.push({ x: command.from.x, y: command.from.y });
        }
        group.points.push({ x: command.to.x, y: command.to.y });
      }
    });

    return Array.from(pathGroups.values());
  }

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  /**
   * Resets the turtle's state to its initial configuration or new options
   *
   * @param {Object} [options] - New configuration options (uses current if not provided)
   * @param {number} [options.width] - Width of the SVG canvas
   * @param {number} [options.height] - Height of the SVG canvas
   * @param {Object} [options.startPosition] - Initial coordinates
   * @param {number} [options.heading] - Initial direction
   * @param {boolean} [options.penDown] - Whether the pen is down
   * @param {string} [options.strokeColour] - Color of drawn lines
   * @param {number} [options.strokeWidth] - Thickness of lines
   * @param {string} [options.angleType] - "degrees" or "radians"
   * @param {number} [options.precision] - Decimal places for rounding
   * @param {string} [options.mode] - "contiguous" or "discrete"
   */
  reset(
    {
      width,
      height,
      startPosition,
      heading,
      penDown,
      strokeColour,
      strokeWidth,
      angleType,
      precision,
      mode,
      crop,
      offset,
    } = this.initializedProps
  ) {
    this.width = width;
    this.height = height;
    this.position = startPosition;
    this.home = { ...startPosition };
    this.heading = heading;
    this.penDown = penDown;
    this.strokeColour = strokeColour;
    this.strokeWidth = strokeWidth;
    this.angleType = angleType;
    this.precision = precision;
    this.mode = mode;
    this.lineIndex = 0;
    this.crop = crop;
    this.offset = offset;
    this.isCapturing = false;
    this.capturedPoints = [];

    this.initializedProps = {
      width,
      height,
      startPosition,
      heading,
      penDown,
      strokeColour,
      strokeWidth,
      angleType,
      precision,
      mode,
      crop,
      offset,
    };

    // Update dimensions on both SVG and wrapper for consistency
    this.svg.setAttribute("width", width);
    this.svg.setAttribute("height", height);
    this.svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

    // Clear the drawing commands array instead of SVG directly
    this.drawingCommands = [];
    this.currentPathCommands = [];
    this.needsRender = true;

    // Clear the SVG
    while (this.svg.firstChild) {
      this.svg.removeChild(this.svg.firstChild);
    }
  }

  /**
   * Clears all drawing commands and re-renders
   */
  clearDrawing() {
    this.drawingCommands = [];
    this.needsRender = true;
    this.render();
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Rounds a number to the specified precision
   * @param {number} n - The number to round
   * @returns {number} The rounded number
   * @private
   */
  round(n) {
    const factor = this.precision * 10;
    return Math.floor(n * factor) / factor;
  }

  /**
   * Adds a drawing command to the internal command array
   * @param {Object} command - The drawing command to add
   * @private
   */
  addDrawingCommand(command) {
    this.drawingCommands.push(command);
    this.needsRender = true;
  }

  /**
   * Starts capturing coordinates instead of drawing
   * When capture mode is active, movement commands will collect points
   * in a temporary array instead of adding them to the drawing commands.
   */
  startCapture() {
    this.isCapturing = true;
    this.capturedPoints = [];
  }

  /**
   * Ends coordinate capture and returns the collected points
   * @returns {Array} Array of captured coordinate objects {x, y}
   */
  endCapture() {
    this.isCapturing = false;
    const points = [...this.capturedPoints];
    this.capturedPoints = [];
    return points;
  }

  /**
   * Sets the offset of the toy
   * @param {number} x - X offset
   * @param {number} y - Y offset
   */
  setOffset(x, y) {
    this.offset = { x, y };
  }

  // ============================================================================
  // DRAWING METHODS
  // ============================================================================

  /**
   * Draws a line between two points
   * @param {Object} a - First point {x, y}
   * @param {Object} b - Second point {x, y}
   * @private
   */
  drawLine(a, b) {
    if (this.isCapturing) {
      // Add points to captured array instead of drawing
      if (this.capturedPoints.length === 0) {
        this.capturedPoints.push({ x: a.x, y: a.y });
      }
      this.capturedPoints.push({ x: b.x, y: b.y });
    } else {
      this.addDrawingCommand({
        type: "line",
        from: { x: a.x + this.offset.x, y: a.y + this.offset.y },
        to: { x: b.x + this.offset.x, y: b.y + this.offset.y },
        strokeColour: this.strokeColour,
        strokeWidth: this.strokeWidth,
        i: this.lineIndex,
      });
    }
  }

  /**
   * Moves the turtle forward by the specified distance
   * @param {number} distance - Distance to move forward
   * @throws {Error} If distance is not a valid number
   */
  forward(distance) {
    if (typeof distance !== "number" || isNaN(distance)) {
      throw new Error("Distance must be a valid number");
    }
    const newPos = { ...this.position };
    newPos.x = this.position.x + distance * Math.cos(this.radians);
    newPos.y = this.position.y + distance * Math.sin(this.radians);
    if (this.penDown) {
      this.drawLine(this.position, newPos);
    }
    this.position = newPos;
  }

  /**
   * Shorthand for forward()
   * @param {number} distance - Distance to move forward
   */
  fw(distance) {
    this.forward(distance);
  }

  /**
   * Moves the turtle backward by the specified distance
   * @param {number} distance - Distance to move backward
   * @throws {Error} If distance is not a valid number
   */
  backward(distance) {
    if (typeof distance !== "number" || isNaN(distance)) {
      throw new Error("Distance must be a valid number");
    }
    const newPos = { ...this.position };
    newPos.x = this.position.x - distance * Math.cos(this.radians);
    newPos.y = this.position.y - distance * Math.sin(this.radians);
    if (this.penDown) {
      this.drawLine(this.position, newPos);
    }
    this.position = newPos;
  }

  /**
   * Shorthand for backward()
   * @param {number} distance - Distance to move backward
   */
  bk(distance) {
    this.backward(distance);
  }

  /**
   * Moves the turtle to the specified coordinates, drawing a line if pen is down
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @throws {Error} If coordinates are not valid numbers
   */
  goto(x, y) {
    if (
      typeof x !== "number" ||
      isNaN(x) ||
      typeof y !== "number" ||
      isNaN(y)
    ) {
      throw new Error("Coordinates must be valid numbers");
    }
    const newPos = { ...this.position };
    newPos.x = x;
    newPos.y = y;
    if (this.penDown) {
      this.drawLine(this.position, newPos);
    }
    this.position = newPos;
  }

  /**
   * Shorthand for goto()
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   */
  setxy(x, y) {
    this.goto(x, y);
  }

  /**
   * Moves the turtle by the specified offset, drawing a line if pen is down
   * @param {number} x - X offset
   * @param {number} y - Y offset
   * @throws {Error} If offsets are not valid numbers
   */
  moveby(x, y) {
    if (
      typeof x !== "number" ||
      isNaN(x) ||
      typeof y !== "number" ||
      isNaN(y)
    ) {
      throw new Error("Coordinates must be valid numbers");
    }
    const newPos = { ...this.position };
    newPos.x += x;
    newPos.y += y;
    if (this.penDown) {
      this.drawLine(this.position, newPos);
    }
    this.position = newPos;
  }

  mb(x, y) {
    this.moveby(x, y);
  }

  /**
   * Moves the turtle to its home position, drawing a line if pen is down
   */
  home() {
    const newPos = { ...this.home };
    if (this.penDown) {
      this.drawLine(this.position, newPos);
    }
    this.position = newPos;
  }

  /**
   * Shorthand for home()
   */
  hm() {
    this.home();
  }

  /**
   * Moves the turtle to the specified coordinates without drawing
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @throws {Error} If coordinates are not valid numbers
   */
  jumpto(x, y) {
    if (
      typeof x !== "number" ||
      isNaN(x) ||
      typeof y !== "number" ||
      isNaN(y)
    ) {
      throw new Error("Coordinates must be valid numbers");
    }
    const isPenDown = this.penDown;
    this.pu();
    this.goto(x, y);
    if (isPenDown) {
      this.pd();
    }
  }

  /**
   * Shorthand for jumpto()
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   */
  jump(x, y) {
    this.jumpto(x, y);
  }

  /**
   * Turns the turtle right by the specified angle
   * @param {number} angle - Angle to turn right
   * @throws {Error} If angle is not a valid number
   */
  right(angle) {
    if (typeof angle !== "number" || isNaN(angle)) {
      throw new Error("Angle must be a valid number");
    }
    this.heading += angle;
  }

  /**
   * Shorthand for right()
   * @param {number} angle - Angle to turn right
   */
  rt(angle) {
    this.right(angle);
  }

  /**
   * Turns the turtle left by the specified angle
   * @param {number} angle - Angle to turn left
   * @throws {Error} If angle is not a valid number
   */
  left(angle) {
    if (typeof angle !== "number" || isNaN(angle)) {
      throw new Error("Angle must be a valid number");
    }
    this.heading -= angle;
  }

  /**
   * Shorthand for left()
   * @param {number} angle - Angle to turn left
   */
  lt(angle) {
    this.left(angle);
  }

  /**
   * Sets the turtle's absolute heading
   * @param {number} angle - New heading angle
   * @throws {Error} If angle is not a valid number
   */
  setheading(angle) {
    if (typeof angle !== "number" || isNaN(angle)) {
      throw new Error("Heading must be a valid number");
    }
    this.heading = angle;
  }

  /**
   * Shorthand for setheading()
   * @param {number} angle - New heading angle
   */
  seth(angle) {
    this.setheading(angle);
  }

  /**
   * Sets the pen state
   * @param {boolean} isDown - Whether the pen should be down
   * @throws {Error} If isDown is not a boolean
   */
  setPenDown(isDown) {
    if (typeof isDown !== "boolean") {
      throw new Error("Pen state must be a boolean");
    }
    if (isDown) {
      this.penDown = true;
    } else {
      this.penDown = false;
      this.lineIndex++;
    }
  }

  /**
   * Lifts the pen (stops drawing)
   */
  pu() {
    this.setPenDown(false);
  }

  /**
   * Shorthand for setPenDown(false)
   */
  penup() {
    this.setPenDown(false);
  }

  /**
   * Puts the pen down (starts drawing)
   */
  pd() {
    this.setPenDown(true);
  }

  /**
   * Shorthand for setPenDown(true)
   */
  pendown() {
    this.setPenDown(true);
  }

  // ============================================================================
  // COMMAND PROCESSING
  // ============================================================================

  /**
   * Processes a single string command
   * @param {string} commandLine - The command string to process
   */
  processCommand(commandLine) {
    const parts = commandLine.toLowerCase().trim().split(/\s+/);
    const command = parts[0];
    const args = parts.slice(1).map(Number);

    try {
      switch (command) {
        case "forward":
        case "fd":
          this.forward(args[0]);
          break;

        case "backward":
        case "bk":
          this.backward(args[0]);
          break;

        case "goto":
        case "setxy":
          this.goto(args[0], args[1]);
          break;

        case "home":
        case "hm":
          this.home();
          break;

        case "jump":
        case "jumpto":
          this.jumpto(args[0], args[1]);
          break;

        case "setheading":
        case "seth":
          this.setheading(args[0]);
          break;

        case "right":
        case "rt":
          this.right(args[0]);
          break;

        case "left":
        case "lt":
          this.left(args[0]);
          break;

        case "penup":
        case "pu":
          this.setPenDown(false);
          break;

        case "pendown":
        case "pd":
          this.setPenDown(true);
          break;

        case "setcolor":
        case "setcolour":
        case "color":
        case "colour":
        case "sc":
          this.strokeColour = parts[1] || "black";
          break;

        case "setwidth":
        case "width":
        case "sw":
          this.strokeWidth = args[0] || 2;
          break;

        default:
          console.warn(`Unknown command: ${commandLine}`);
      }
    } catch (error) {
      console.warn(
        `Error processing command "${commandLine}": ${error.message}, skipping.`
      );
    }
  }

  /**
   * Parses and executes a multiline string of turtle commands
   * @param {string} commandInput - Multiline string of commands
   */
  drawCommands(commandInput) {
    this.reset(this.initializedProps);
    const commands = commandInput.split("\n");

    for (const commandLine of commands) {
      if (commandLine.trim() !== "") {
        this.processCommand(commandLine);
      }
    }
  }

  // ============================================================================
  // RENDERING
  // ============================================================================

  /**
   * Renders all drawing commands to SVG
   */
  render(onlyNew = false) {
    if (!this.needsRender) return;

    // Clear the SVG
    while (this.svg.firstChild) {
      this.svg.removeChild(this.svg.firstChild);
    }

    if (this.mode === "discrete") {
      this.renderDiscreteMode(onlyNew);
    } else {
      this.renderContiguousMode(onlyNew);
    }

    this.needsRender = false;
  }

  /**
   * Renders in discrete mode (each line as separate SVG element)
   * @private
   */
  renderDiscreteMode(onlyNew = false) {
    this.drawingCommands.forEach((command) => {
      if (command.type === "line") {
        const line = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "line"
        );
        line.setAttribute("x1", this.round(command.from.x));
        line.setAttribute("y1", this.round(command.from.y));
        line.setAttribute("x2", this.round(command.to.x));
        line.setAttribute("y2", this.round(command.to.y));
        line.setAttribute("stroke", command.strokeColour);
        line.setAttribute("stroke-width", command.strokeWidth);
        this.svg.appendChild(line);
      }
    });
  }

  /**
   * Renders in contiguous mode (connected lines as SVG paths)
   * @private
   */
  renderContiguousMode(onlyNew = false) {
    const lineGroups = this.lineGroups;
    let croppedLineGroups = [];

    if (this.crop) {
      let i = 0;
      lineGroups.forEach((group) => {
        if (onlyNew && group.rendered) return;
        group.rendered = true;
        const newGroups = clipPathsRect(
          [group.points],
          0,
          this.width,
          0,
          this.height
        );
        newGroups.forEach((newGroup) => {
          croppedLineGroups.push({
            points: newGroup,
            strokeColour: group.strokeColour,
            strokeWidth: group.strokeWidth,
            index: i++,
          });
        });
      });
    } else {
      croppedLineGroups = lineGroups;
    }

    croppedLineGroups.forEach((group) => {
      if (group.points.length === 0) return;

      const path = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", group.strokeColour);
      path.setAttribute("stroke-width", group.strokeWidth);

      let pathData = "";
      let isFirst = true;

      group.points.forEach((point) => {
        if (isFirst) {
          pathData = `M${this.round(point.x)},${this.round(point.y)}`;
          isFirst = false;
        } else {
          pathData += ` L${this.round(point.x)},${this.round(point.y)}`;
        }
      });

      path.setAttribute("d", pathData);
      this.svg.appendChild(path);
    });
  }

  /**
   * Triggers a re-render of the drawing
   */
  update() {
    this.render();
  }

  // ============================================================================
  // ADVANCED DRAWING
  // ============================================================================

  /**
   * Adds a group of connected lines with shared properties
   * @param {Object} lineGroup - The line group to add
   * @param {Array} lineGroup.points - Array of coordinate objects {x, y}
   * @param {string} [lineGroup.strokeColour] - Color of the lines
   * @param {number} [lineGroup.strokeWidth] - Width of the lines
   */
  addLineGroup(lineGroup) {
    if (!lineGroup.points || lineGroup.points.length < 2) {
      console.warn("LineGroup must have at least 2 points");
      return;
    }

    lineGroup.index = ++this.lineIndex;
    lineGroup.strokeColour = lineGroup.strokeColour || this.strokeColour;
    lineGroup.strokeWidth = lineGroup.strokeWidth || this.strokeWidth;

    for (let i = 0; i < lineGroup.points.length - 1; i++) {
      const from = lineGroup.points[i];
      const to = lineGroup.points[i + 1];

      this.addDrawingCommand({
        type: "line",
        from: { x: from.x, y: from.y },
        to: { x: to.x, y: to.y },
        strokeColour: lineGroup.strokeColour,
        strokeWidth: lineGroup.strokeWidth,
        i: lineGroup.index || this.lineIndex,
      });
    }
  }

  /**
   * Adds multiple line groups
   * @param {Array} lineGroups - Array of line group objects
   */
  addLineGroups(lineGroups) {
    lineGroups.forEach((lineGroup) => {
      this.addLineGroup(lineGroup);
    });
  }

  // ============================================================================
  // DOWNLOAD & EXPORT
  // ============================================================================

  /**
   * Downloads the current drawing as an SVG file
   */
  downloadSVG() {
    try {
      // Ensure the SVG is rendered before downloading
      this.render();

      const svgContent = this.svg.outerHTML;
      const blob = new Blob([svgContent], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${this.filename}.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      console.log(`SVG downloaded as ${this.filename}.svg`);
    } catch (error) {
      console.error("Error downloading SVG:", error);
      alert("Could not download SVG. Check console for details.");
    }
  }

  /**
   * Adds event listeners for the download functionality
   * @private
   */
  addDownloadListeners() {
    this.wrapperDiv.addEventListener("mouseenter", () => {
      this.downloadLink.style.display = "block";
    });

    this.wrapperDiv.addEventListener("mouseleave", () => {
      this.downloadLink.style.display = "none";
    });

    this.downloadLink.addEventListener("click", (e) => {
      e.preventDefault();
      this.downloadSVG();
    });
  }
}
