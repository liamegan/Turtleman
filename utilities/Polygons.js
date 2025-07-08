/*
 * Polygon Clipping utility code - Created by Reinder Nijhoff 2019
 */
export function Polygons() {
  const polygonList = [];
  const Polygon = class {
    constructor() {
      this.cp = []; // clip path: array of [x,y] pairs
      this.dp = []; // 2d lines [x0,y0],[x1,y1] to draw
      this.aabb = []; // AABB bounding box
    }
    addPoints(...points) {
      // add point to clip path and update bounding box
      let xmin = 1e5,
        xmax = -1e5,
        ymin = 1e5,
        ymax = -1e5;
      (this.cp = [...this.cp, ...points]).forEach((p) => {
        (xmin = Math.min(xmin, p[0])), (xmax = Math.max(xmax, p[0]));
        (ymin = Math.min(ymin, p[1])), (ymax = Math.max(ymax, p[1]));
      });
      this.aabb = [
        (xmin + xmax) / 2,
        (ymin + ymax) / 2,
        (xmax - xmin) / 2,
        (ymax - ymin) / 2,
      ];
    }
    addSegments(...points) {
      // add segments (each a pair of points)
      points.forEach((p) => this.dp.push(p));
    }
    addOutline() {
      for (let i = 0, l = this.cp.length; i < l; i++) {
        this.dp.push(this.cp[i], this.cp[(i + 1) % l]);
      }
    }
    draw(t) {
      for (let i = 0, l = this.dp.length; i < l; i += 2) {
        t.jump(...this.dp[i]), t.goto(...this.dp[i + 1]);
      }
    }
    addHatching(a, d) {
      a += Math.PI / 2;
      const tp = new Polygon();
      const x = this.aabb[0],
        y = this.aabb[1];
      const w = this.aabb[2],
        h = this.aabb[3];
      const l = Math.sqrt((w * 2) ** 2 + (h * 2) ** 2) * 0.5;
      tp.cp.push(
        [x - w, y - h],
        [x + w, y - h],
        [x + w, y + h],
        [x - w, y + h]
      );
      const cx = Math.sin(a) * l,
        cy = Math.cos(a) * l;
      let px = x - Math.cos(a) * l;
      let py = y - Math.sin(a) * l;
      for (let i = 0; i < l * 2; i += d) {
        tp.dp.push([px + cx, py - cy], [px - cx, py + cy]);
        px += Math.cos(a) * d;
        py += Math.sin(a) * d;
      }
      tp.boolean(this, false);
      for (const dp of tp.dp) this.dp.push(dp);
    }
    inside(p) {
      let int = 0; // find number of i ntersection points from p to far away
      for (let i = 0, l = this.cp.length; i < l; i++) {
        if (
          this.segment_intersect(
            p,
            [0.1, -1000],
            this.cp[i],
            this.cp[(i + 1) % l]
          )
        ) {
          int++;
        }
      }
      return int & 1; // if even your outside
    }
    boolean(p, diff = true) {
      // bouding box optimization by ge1doot.
      if (
        Math.abs(this.aabb[0] - p.aabb[0]) - (p.aabb[2] + this.aabb[2]) >= 0 &&
        Math.abs(this.aabb[1] - p.aabb[1]) - (p.aabb[3] + this.aabb[3]) >= 0
      )
        return this.dp.length > 0;

      // polygon diff algorithm (narrow phase)
      const ndp = [];
      for (let i = 0, l = this.dp.length; i < l; i += 2) {
        const ls0 = this.dp[i];
        const ls1 = this.dp[i + 1];
        // find all intersections with clip path
        const int = [];
        for (let j = 0, cl = p.cp.length; j < cl; j++) {
          const pint = this.segment_intersect(
            ls0,
            ls1,
            p.cp[j],
            p.cp[(j + 1) % cl]
          );
          if (pint !== false) {
            int.push(pint);
          }
        }
        if (int.length === 0) {
          // 0 intersections, inside or outside?
          if (diff === !p.inside(ls0)) {
            ndp.push(ls0, ls1);
          }
        } else {
          int.push(ls0, ls1);
          // order intersection points on line ls.p1 to ls.p2
          const cmpx = ls1[0] - ls0[0];
          const cmpy = ls1[1] - ls0[1];
          int.sort(
            (a, b) =>
              (a[0] - ls0[0]) * cmpx +
              (a[1] - ls0[1]) * cmpy -
              (b[0] - ls0[0]) * cmpx -
              (b[1] - ls0[1]) * cmpy
          );

          for (let j = 0; j < int.length - 1; j++) {
            if (
              (int[j][0] - int[j + 1][0]) ** 2 +
                (int[j][1] - int[j + 1][1]) ** 2 >=
              0.001
            ) {
              if (
                diff ===
                !p.inside([
                  (int[j][0] + int[j + 1][0]) / 2,
                  (int[j][1] + int[j + 1][1]) / 2,
                ])
              ) {
                ndp.push(int[j], int[j + 1]);
              }
            }
          }
        }
      }
      return (this.dp = ndp).length > 0;
    }
    //port of http://paulbourke.net/geometry/pointlineplane/Helpers.cs
    segment_intersect(l1p1, l1p2, l2p1, l2p2) {
      const d =
        (l2p2[1] - l2p1[1]) * (l1p2[0] - l1p1[0]) -
        (l2p2[0] - l2p1[0]) * (l1p2[1] - l1p1[1]);
      if (d === 0) return false;
      const n_a =
        (l2p2[0] - l2p1[0]) * (l1p1[1] - l2p1[1]) -
        (l2p2[1] - l2p1[1]) * (l1p1[0] - l2p1[0]);
      const n_b =
        (l1p2[0] - l1p1[0]) * (l1p1[1] - l2p1[1]) -
        (l1p2[1] - l1p1[1]) * (l1p1[0] - l2p1[0]);
      const ua = n_a / d;
      const ub = n_b / d;
      if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
        return [
          l1p1[0] + ua * (l1p2[0] - l1p1[0]),
          l1p1[1] + ua * (l1p2[1] - l1p1[1]),
        ];
      }
      return false;
    }
  };
  return {
    list: () => polygonList,
    create: () => new Polygon(),
    draw: (turtle, p, addToVisList = true) => {
      for (let j = 0; j < polygonList.length && p.boolean(polygonList[j]); j++);
      p.draw(turtle);
      if (addToVisList) polygonList.push(p);
    },
  };
}
