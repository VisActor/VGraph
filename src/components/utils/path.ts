export function convertPath(left: number, top: number, step: number, path: number[][] | undefined) {
  if (!path) {
    return;
  }
  const newPath = [] as number[][];
  for (const point of path) {
    newPath.push([left + point[0] * step + 0.5 * step, top + point[1] * step + 0.5 * step]);
  }
  return newPath;
}
export function compressPath(path: number[][] | undefined) {
  if (!path) {
    return;
  }
  // nothing to compress
  if (path.length < 3) {
    return path;
  }

  const compressed = [],
    sx = path[0][0], // start x
    sy = path[0][1]; // start y
  let px = path[1][0], // second point x
    py = path[1][1], // second point y
    dx = px - sx, // direction between the two points
    dy = py - sy, // direction between the two points
    lx,
    ly,
    ldx,
    ldy,
    sq,
    i;

  // normalize the direction
  sq = Math.sqrt(dx * dx + dy * dy);
  dx /= sq;
  dy /= sq;

  // start the new path
  compressed.push([sx, sy]);

  for (i = 2; i < path.length; i++) {
    // store the last point
    lx = px;
    ly = py;

    // store the last direction
    ldx = dx;
    ldy = dy;

    // next point
    px = path[i][0];
    py = path[i][1];

    // next direction
    dx = px - lx;
    dy = py - ly;

    // normalize
    sq = Math.sqrt(dx * dx + dy * dy);
    dx /= sq;
    dy /= sq;

    if (dx !== ldx || dy !== ldy) {
      compressed.push([lx, ly]);
    }
  }

  // store the last point
  compressed.push([px, py]);

  return compressed;
}
