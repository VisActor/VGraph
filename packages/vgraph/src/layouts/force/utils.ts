import { NodeData } from "../../typings/data";
import { Node } from "../../models/entities";

export function newMatrix(m: number, n: number, fillnum?: number) {
  if (!fillnum) {
    fillnum = 0;
  }
  const matrix = new Array(m);
  for (let i = 0; i < m; i++) {
    matrix[i] = new Array(n).fill(fillnum);
  }
  return matrix;
}

export function fastrand(seed?: number) {
  let gSeed = 0;
  if (seed) {
    gSeed = seed;
  }
  function rand() {
    // tslint:disable-next-line:no-bitwise
    gSeed = (13229323 * gSeed + 2531011) ^ 0xec28e490 % 0x7fffffff;
    // tslint:disable-next-line:no-bitwise
    return ((gSeed >> 16) & 0x7fff) / 0x7fff;
  }
  rand.setSeed = function setSeed(newSeed: number) {
    gSeed = newSeed;
  };
  rand.getGseed = function getGseed() {
    return gSeed;
  };
  return rand;
}

const random = fastrand(0);
export function randomSeed(seed: number) {
  random.setSeed(seed);
}

export function jiggle(): number {
  return (random() - 0.5) * 1e-6;
}

export function shuffle(array: any[]) {
  const length = array === null ? 0 : array.length;
  if (!length) {
    return [];
  }
  let index = -1;
  const lastIndex = length - 1;
  const result = new Array(length);
  for (; ++index < length; ) {
    result[index] = array[index];
  }
  index = -1;
  while (++index < length) {
    const rand = index + Math.floor(random() * (lastIndex - index + 1));
    const value = result[rand];
    result[rand] = result[index];
    result[index] = value;
  }
  return result;
}

export function setNodesOption(
  nodes: NodeData[],
  option: number | number[] | ((d: any, i?: number, nodes?: any) => number)
) {
  const result = new Map();
  if (option instanceof Function) {
    nodes.forEach((d, i) => {
      result.set(d.id, option(d, i, nodes));
    });
  } else if (option instanceof Array) {
    nodes.forEach((d, i) => {
      result.set(d.id, option[i]);
    });
  } else if (typeof option === "number") {
    nodes.forEach((d, i) => {
      result.set(d.id, option);
    });
  }
  return result;
}

export function setLinksOption(
  links: { source: NodeData; target: NodeData }[],
  option: number | number[] | ((d: any, i?: number, links?: any) => number)
) {
  if (option instanceof Function) {
    return links.map(option);
  } else if (option instanceof Array) {
    return option;
  } else if (typeof option === "number") {
    return new Array(links.length).fill(option);
  } else {
    return links.map(() => 1);
  }
}

export function assignPosition(
  center: { x: number; y: number },
  childNodes: Node[],
  forced = false,
  initialRadius = 10
) {
  const { x, y } = center;
  const initialAngle = Math.PI * (3 - Math.sqrt(5));
  let count = 0;
  childNodes.forEach((node: Node) => {
    if (Number.isNaN(node.vx)) {
      node.vx = 0;
    }
    if (Number.isNaN(node.vy)) {
      node.vy = 0;
    }
    const radius = initialRadius * Math.sqrt(0.5 + count);
    const angle = count * initialAngle;
    if (!node.x || forced) {
      count++;
      if (node.fx) {
        node.x = node.fx;
      } else {
        node.x = x + radius * Math.cos(angle) * 5;
      }
    }
    if (!node.y || forced) {
      if (node.fy) {
        node.y = node.fy;
      } else {
        node.y = y + radius * Math.sin(angle) * 5;
      }
    }
  });
}
