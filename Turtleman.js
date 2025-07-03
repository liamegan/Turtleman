export class Turtleman {
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
    });

    this.filename = filename;

    this.addDownloadListeners();
  }

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

  round(n) {
    const factor = this.precision * 10;
    return Math.floor(n * factor) / factor;
  }

  // Add a drawing command to the array
  addDrawingCommand(command) {
    this.drawingCommands.push(command);
    this.needsRender = true;
  }

  // Render all drawing commands to SVG
  render() {
    if (!this.needsRender) return;

    // Clear the SVG
    while (this.svg.firstChild) {
      this.svg.removeChild(this.svg.firstChild);
    }

    if (this.mode === "discrete") {
      this.renderDiscreteMode();
    } else {
      this.renderContiguousMode();
    }

    this.needsRender = false;
  }

  renderDiscreteMode() {
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

  renderContiguousMode() {
    const lineGroups = this.lineGroups;

    // Create paths for each group
    lineGroups.forEach((group) => {
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

  update() {
    this.render();
  }

  drawLine(a, b) {
    this.addDrawingCommand({
      type: "line",
      from: { x: a.x, y: a.y },
      to: { x: b.x, y: b.y },
      strokeColour: this.strokeColour,
      strokeWidth: this.strokeWidth,
      i: this.lineIndex,
    });
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
    if (isDown) {
      this.penDown = true;
    } else {
      this.penDown = false;
      this.lineIndex++;
    }
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
  jumpto(x, y) {
    if (
      typeof x !== "number" ||
      isNaN(x) ||
      typeof y !== "number" ||
      isNaN(y)
    ) {
      throw new Error("Coordinates must be valid numbers");
    }
    this.position = { x: this.round(x), y: this.round(y) };
  }
  jump(x, y) {
    this.jumpto(x, y);
  }

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

  get commands() {
    return [...this.drawingCommands];
  }

  clearDrawing() {
    this.drawingCommands = [];
    this.needsRender = true;
    this.render();
  }

  get element() {
    return this.wrapperDiv;
  }

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
}
