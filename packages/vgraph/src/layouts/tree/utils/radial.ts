import { preOrder } from "./traverse";

export function radialTree(data: any, configs: any, size: number[]) {
  let step = 1;
  const offsetX = size[0] / 2;
  const offsetY = size[1] / 2;

  if (!data.children || data.children.length === 0) {
    data.x = offsetX;
    data.y = offsetY;
    return;
  }
  if (data.children[0].y - data.y < 0) {
    step = -1;
  }

  let preR = 0;
  let maxR = 0;
  let max = -Infinity;
  let min = Infinity;
  const yMap: { [k: string]: any } = {};
  preOrder(data, (node: any) => {
    const y = node.y * step;
    min = Math.min(min, node.x);
    max = Math.max(max, node.x);
    if (yMap[y]) {
      yMap[y].push(node);
    } else {
      yMap[y] = [node];
    }
  });
  const yLen = Object.keys(yMap).length;
  const sep = Math.min(size[0], size[1]) / 2 / yLen;
  function getRankSep(node: any) {
    if (configs.rankSep) {
      return configs.rankSep(node);
    }
    return sep;
  }
  const rad = max === min ? 0 : (2 * Math.PI) / (max - min + 1);
  Object.keys(yMap)
    .sort((a: string, b: string) => parseInt(a, 10) - parseInt(b, 10))
    .forEach((y: string) => {
      if (y === data.y * step + "") {
        return;
      }
      yMap[y].forEach((node: any) => {
        const r = preR + getRankSep(node);
        maxR = Math.max(maxR, r);
        node.rad = rad * (node.x - min);
        node.x = r * Math.cos(node.rad) + offsetX;
        node.y = r * Math.sin(node.rad) + offsetY;
      });
      preR = maxR;
    });
  data.x = offsetX;
  data.y = offsetY;
}
