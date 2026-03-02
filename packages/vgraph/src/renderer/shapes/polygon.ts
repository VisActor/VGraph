import { PolygonConfigs, BBox } from "../../typings/renderer";
import { ShapeBase } from "../shape";
import {
  calculateRegularNPolygonByEdgeLength,
  calculateRegularNPolygon,
  calculateNPointStar,
} from "../utils/polygon";

export class Polygon extends ShapeBase {
  private _vertices: number[][];
  constructor(configs: PolygonConfigs) {
    super(configs);
    if (configs.points) {
      this._vertices = configs.points;
    } else {
      this._vertices = calculatePolygon(configs);
    }
    this.type = "polygon";
  }

  setConfig(key: string, value: any): void {
    super.setConfig(key, value);
    if (
      [
        "type",
        "n",
        "cx",
        "cy",
        "edgeLength",
        "outerRadius",
        "innerRadius",
      ].includes(key)
    ) {
      this._vertices = calculatePolygon(this.configs);
    } else if (key === "points") {
      this._vertices = value;
    }
  }

  getDefaultConfigs() {
    const configs = super.getDefaultConfigs();
    return {
      ...configs,
      points: [],
    };
  }

  getVertices(): number[][] {
    return this._vertices;
  }

  calculateBBox(): BBox {
    const points: number[][] = this._vertices;
    const xArr = points.map(([x]) => x);
    const yArr = points.map(([, y]) => y);
    const left = Math.min(...xArr);
    const right = Math.max(...xArr);
    const top = Math.min(...yArr);
    const bottom = Math.max(...yArr);
    return {
      left,
      top,
      width: right - left,
      height: bottom - top,
    };
  }
}

function calculatePolygon(configs: PolygonConfigs): number[][] {
  let points = configs.points || [];
  if (configs.type && configs.n) {
    points = [];
    switch (configs.type) {
      case "regular":
        points = configs.edgeLength
          ? calculateRegularNPolygonByEdgeLength(configs.n, configs.edgeLength)
          : configs.outerRadius
          ? calculateRegularNPolygon(configs.n, configs.outerRadius)
          : [];
        break;
      case "star":
        points = configs.outerRadius
          ? calculateNPointStar(
              configs.n,
              configs.outerRadius,
              configs.innerRadius
            )
          : [];
        break;
      default:
        break;
    }
    points = points.map(([x, y]) => [
      configs.cx ? x + configs.cx : x,
      configs.cy ? y + configs.cy : y,
    ]);
  }
  return points;
}
