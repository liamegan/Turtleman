export class TurtleSVG {
  constructor({
    width = 500,
    height = 500,
    startPosition = { x: 250, y: 250 },
    heading = 0,
    penDown = true,
    strokeColour = "black",
    strokeWidth = 2,
    angleType = "degrees",
  } = {}) {
    this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.svg.setAttribute("width", width);
    this.svg.setAttribute("height", height);
    this.svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

    this.reset({
      width,
      height,
      startPosition,
      heading,
      penDown,
      strokeColour,
      strokeWidth,
      angleType,
    });
  }

  reset({
    width = 500,
    height = 500,
    startPosition = { x: 250, y: 250 },
    heading = 0,
    penDown = true,
    strokeColour = "black",
    strokeWidth = 2,
    angleType = "degrees",
  } = {}) {
    this.width = width;
    this.height = height;
    this.position = startPosition;
    this.home = { ...startPosition };
    this.heading = heading;
    this.penDown = penDown;
    this.strokeColour = strokeColour;
    this.strokeWidth = strokeWidth;
    this.angleType = angleType;

    this.initializedProps = {
      width,
      height,
      startPosition,
      heading,
      penDown,
      strokeColour,
      strokeWidth,
      angleType,
    };

    this.svg.setAttribute("width", width);
    this.svg.setAttribute("height", height);
    this.svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

    while (this.svg.firstChild) {
      this.svg.removeChild(this.svg.firstChild);
    }
  }

  drawLine(a, b) {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", a.x);
    line.setAttribute("y1", a.y);
    line.setAttribute("x2", b.x);
    line.setAttribute("y2", b.y);
    line.setAttribute("stroke", this.strokeColour);
    line.setAttribute("stroke-width", this.strokeWidth);
    this.svg.appendChild(line);
  }

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
  fw(distance) {
    this.forward(distance);
  }
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
  bk(distance) {
    this.backward(distance);
  }
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
  setxy(x, y) {
    this.goto(x, y);
  }
  home() {
    const newPos = { ...this.home };
    if (this.penDown) {
      this.drawLine(this.position, newPos);
    }
    this.position = newPos;
  }
  hm() {
    this.home();
  }
  right(angle) {
    if (typeof angle !== "number" || isNaN(angle)) {
      throw new Error("Angle must be a valid number");
    }
    this.heading += angle;
  }
  rt(angle) {
    this.right(angle);
  }
  left(angle) {
    if (typeof angle !== "number" || isNaN(angle)) {
      throw new Error("Angle must be a valid number");
    }
    this.heading -= angle;
  }
  lt(angle) {
    this.left(angle);
  }
  setheading(angle) {
    if (typeof angle !== "number" || isNaN(angle)) {
      throw new Error("Heading must be a valid number");
    }
    this.heading = angle;
  }
  seth(angle) {
    this.setheading(angle);
  }
  setPenDown(isDown) {
    if (typeof isDown !== "boolean") {
      throw new Error("Pen state must be a boolean");
    }
    this.penDown = isDown;
  }
  pu() {
    this.setPenDown(false);
  }
  penup() {
    this.setPenDown(false);
  }
  pd() {
    this.setPenDown(true);
  }
  pendown() {
    this.setPenDown(true);
  }
  jumpTo(x, y) {
    if (
      typeof x !== "number" ||
      isNaN(x) ||
      typeof y !== "number" ||
      isNaN(y)
    ) {
      throw new Error("Coordinates must be valid numbers");
    }
    this.position = { x, y };
  }
  jump(x, y) {
    this.jumpTo(x, y);
  }

  processCommand(commandLine) {
    const parts = commandLine.toLowerCase().trim().split(/\s+/);
    const command = parts[0];
    const args = parts.slice(1).map(Number);

    console.log(parts, args);

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
        case "jumpTo":
          this.jumpTo(args[0], args[1]);
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
        `Error processing forward command: ${error.message}, skipping.`
      );
    }
  }

  drawCommands(commandInput) {
    this.reset(this.initializedProps);
    const commands = commandInput.split("\n");

    for (const commandLine of commands) {
      if (commandLine.trim() !== "") {
        this.processCommand(commandLine);
      }
    }
  }

  set heading(value) {
    if (this.angleType === "radians") {
      const TAU = Math.PI * 2;
      this._heading = ((value % TAU) + TAU) % TAU;
    } else {
      this._heading = ((value % 360) + 360) % 360;
    }
  }
  get heading() {
    return this._heading;
  }
  set radians(value) {
    if (this.angleType === "radians") {
      this.heading = value;
    } else {
      this.heading = (value * 180) / Math.PI;
    }
  }
  get radians() {
    if (this.angleType === "radians") {
      return this.heading;
    }
    return (this.heading * Math.PI) / 180;
  }
}
