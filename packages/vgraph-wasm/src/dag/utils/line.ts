export function getSplinePath(configs: any) {
  const { startPoint, endPoint, splineControlPoints } = configs;
  if (!splineControlPoints) {
    const path: any = [
      ["M", startPoint[0], startPoint[1]],
      ["L", endPoint[0], endPoint[1]],
    ];
    return path;
  }
  const spc = splineControlPoints;
  const length = splineControlPoints.length;
  startPoint[0] = splineControlPoints[0][0];
  startPoint[1] = splineControlPoints[0][1];
  endPoint[0] = splineControlPoints[length - 1][0];
  endPoint[1] = splineControlPoints[length - 1][1];
  const path: any = [["M", startPoint[0], startPoint[1]]];
  const cubicCount = length > 4 ? Math.floor(length / 3) : 0;
  for (let i = 0; i < cubicCount; i++) {
    path.push([
      "C",
      spc[3 * i + 1][0],
      spc[3 * i + 1][1],
      spc[3 * i + 2][0],
      spc[3 * i + 2][1],
      spc[3 * i + 3][0],
      spc[3 * i + 3][1],
    ]);
  }
  !cubicCount && path.push(["L", endPoint[0], endPoint[1]]);
  return path;
}
