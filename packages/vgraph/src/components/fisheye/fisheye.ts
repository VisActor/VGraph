import { NodeData } from "../../typings/data";
export const Fisheye = (
  configs: {
    focus?: [number, number];
    r?: number;
    distortion?: number;
    inEyeRadius?: number;
  } = {}
) => {
  let radius = configs.r || 200;
  let distortion = configs.distortion || 3;
  let inEyeRadius = configs.inEyeRadius || 120;
  let focus = configs.focus || [0, 0];
  let k0: number;
  let k1: number;
  function fisheye(d: NodeData & { x: number; y: number }) {
    const dx = d.x - focus[0];
    const dy = d.y - focus[1];
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (!dist || dist >= radius) {
      return {
        x: d.x,
        y: d.y,
        z: dist >= radius ? 1 : 10,
      };
    }
    const k = ((k0 * (1 - Math.exp(-dist * k1))) / dist) * 0.75 + 0.25;
    const inFisheye = k * dist < inEyeRadius;
    return {
      x: focus[0] + dx * k,
      y: focus[1] + dy * k,
      z: Math.min(k, 10),
      inFisheye,
    };
  }

  fisheye.applyNodes = (
    nodes: NodeData[],
    inEye?: (node: NodeData) => void,
    outEye?: (node: NodeData) => void
  ) => {
    nodes.forEach((node: NodeData) => {
      node.configs.fisheye = fisheye(node.configs);
      if (node.configs.fisheye.inFisheye) {
        if (inEye) {
          inEye(node);
        }
      } else {
        if (outEye) {
          outEye(node);
        }
      }
    });
  };

  fisheye.rescale = () => {
    k0 = Math.exp(distortion);
    k0 = (k0 / (k0 - 1)) * radius;
    k1 = distortion / radius;
  };

  fisheye.setRadius = (r: number) => {
    radius = r;
    fisheye.rescale();
  };
  fisheye.getRadius = () => radius;

  fisheye.setDistortion = (d: number) => {
    distortion = d;
    fisheye.rescale();
  };
  fisheye.getDistortion = () => distortion;

  fisheye.setFocus = (x: [number, number] | number, y?: number) => {
    if (typeof x === "number") {
      if (y === undefined) {
        y = x;
      }
      x = [x, y];
    }
    focus = x;
  };
  fisheye.getFocus = () => focus;

  fisheye.setInEyeRadius = (r: number) => {
    inEyeRadius = r;
  };
  fisheye.getInEyeRadius = () => inEyeRadius;

  fisheye.rescale();
  fisheye.setInEyeRadius(inEyeRadius);
  return fisheye;
};
