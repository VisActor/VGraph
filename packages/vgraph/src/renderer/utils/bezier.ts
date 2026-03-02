import { Point } from "../../typings/renderer";
const { sqrt } = Math;

// Legendre-Gauss abscissae with n=12
const Tvalues = [
  -0.1252, 0.1252, -0.3678, 0.3678, -0.5873, 0.5873, -0.7699, 0.7699, -0.9041,
  0.9041, -0.9816, 0.9816,
];
const Cvalues = [
  0.2491, 0.2491, 0.2335, 0.2335, 0.2032, 0.2032, 0.1601, 0.1601, 0.1069,
  0.1069, 0.0472, 0.0472,
];
const N = 12;

export function extrema(points: Point[]) {
  const dpoints = derive(points);
  const order = points.length - 1;
  const result: Record<string, number[]> = {};
  let roots: number[] = [];

  ["x", "y"].forEach((dim: string) => {
    let p = dpoints[0].map((p) => p[dim]);
    result[dim] = droots(p);
    if (order === 3) {
      p = dpoints[1].map((p) => p[dim]);
      result[dim] = result[dim].concat(droots(p));
    }
    result[dim] = result[dim].filter(function (t: number) {
      return t >= 0 && t <= 1;
    });
    roots = roots.concat(result[dim].sort((a: number, b: number) => a - b));
  });

  const values = roots
    .sort((a: number, b: number) => a - b)
    .filter((v: number, index: number) => roots.indexOf(v) === index);

  return values.map((t: number) => getPoint(t, points));
}

export function getPoint(t: number, points: Point[]) {
  return compute(t, points);
}

export function length(points: Point[]) {
  const dpoints = derive(points);
  const z = 0.5;
  let t = 0;
  let sum = 0;

  function arc(t: number) {
    const d = compute(t, dpoints[0]);
    return sqrt(d.x * d.x + d.y * d.y);
  }

  for (let i = 0; i < N; i++) {
    t = z * Tvalues[i] + z;
    sum += Cvalues[i] * arc(t);
  }
  return z * sum;
}

export function derive(points: Point[]) {
  const dpoints = [];
  for (let p = points, d = p.length, c = d - 1; d > 1; d--, c--) {
    const list = [];
    for (let j = 0, dpt; j < c; j++) {
      dpt = {
        x: c * (p[j + 1].x - p[j].x),
        y: c * (p[j + 1].y - p[j].y),
      };
      list.push(dpt);
    }
    dpoints.push(list);
    p = list;
  }
  return dpoints;
}

export function at() {}

function compute(t: number, points: Point[]) {
  const order = points.length - 1;
  if (t === 0) {
    return {
      x: points[0].x,
      y: points[0].y,
      t: 0,
    };
  }
  if (t === 1) {
    return {
      x: points[order].x,
      y: points[order].y,
      t: 1,
    };
  }
  const mt = 1 - t;
  let p = points;
  if (order === 1) {
    const ret = {
      x: mt * p[0].x + t * p[1].x,
      y: mt * p[0].y + t * p[1].y,
      t: t,
    };
    return ret;
  }
  const mt2 = mt * mt;
  const t2 = t * t;
  let a = 0;
  let b = 0;
  let c = 0;
  let d = 0;
  if (order === 2) {
    p = [p[0], p[1], p[2], { x: 0, y: 0 }];
    a = mt2;
    b = mt * t * 2;
    c = t2;
  } else if (order === 3) {
    a = mt2 * mt;
    b = mt2 * t * 3;
    c = mt * t2 * 3;
    d = t * t2;
  }
  return {
    x: a * p[0].x + b * p[1].x + c * p[2].x + d * p[3].x,
    y: a * p[0].y + b * p[1].y + c * p[2].y + d * p[3].y,
    t: t,
  };
}

function droots(p: number[]) {
  if (p.length === 3) {
    const a = p[0];
    const b = p[1];
    const c = p[2];
    const d = a - 2 * b + c;
    if (d !== 0) {
      const m1 = -sqrt(b * b - a * c);
      const m2 = -a + b;
      const v1 = -(m1 + m2) / d;
      const v2 = -(-m1 + m2) / d;
      return [v1, v2];
    } else if (b !== c && d === 0) {
      return [(2 * b - c) / (2 * (b - c))];
    }
    return [];
  }
  const a = p[0];
  const b = p[1];
  if (a !== b) {
    return [a / (a - b)];
  }
  return [];
}
