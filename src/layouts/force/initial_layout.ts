import { PMDS } from './pivotMDS';
import { jiggle } from './utils';
import { EdgeData, NodeData } from '../../typings/data';

// spiral initialization fellow d3-force
export function spiralInit(nodes: NodeData[], center: { x: number; y: number } = { x: 0, y: 0 }, nodeSize = 20) {
  const initialRadius = nodeSize;
  const initialAngle = Math.PI * (3 - Math.sqrt(5));
  nodes.forEach((node, i) => {
    if (isNaN(node.vx)) {
      node.vx = 0;
    }
    if (isNaN(node.vy)) {
      node.vy = 0;
    }
    const radius = initialRadius * Math.sqrt(0.5 + i);
    const angle = i * initialAngle;
    if (!node.x) {
      if (node.fx) {
        node.x = node.fx;
      } else {
        node.x = center.x + radius * Math.cos(angle) * 5;
      }
    }
    if (!node.y) {
      if (node.fy) {
        node.y = node.fy;
      } else {
        node.y = center.y + radius * Math.sin(angle) * 5;
      }
    }
  });
}

// random initialization
export function randomInit(nodes: NodeData[], center: { x: number; y: number } = { x: 0, y: 0 }, nodeSize = 20) {
  const n = nodes.length;
  nodes.forEach((node, i) => {
    if (isNaN(node.vx)) {
      node.vx = 0;
    }
    if (isNaN(node.vy)) {
      node.vy = 0;
    }
    if (!node.x) {
      if (node.fx) {
        node.x = node.fx;
      } else {
        node.x = center.x + jiggle() * 1e6 * Math.sqrt(n) * nodeSize;
      }
    }
    if (!node.y) {
      if (node.fy) {
        node.y = node.fy;
      } else {
        node.y = center.y + jiggle() * 1e6 * Math.sqrt(n) * nodeSize;
      }
    }
  });
}

// pivot MDS layout initialization
export function pivotMDSInit(nodes: NodeData[], edges: EdgeData[], center: { x: number; y: number } = { x: 0, y: 0 }, nodeSize = 20) {
  const n = nodes.length;
  const pmdsPos = PMDS(nodes, edges, nodeSize);
  nodes.forEach((node, i) => {
    if (isNaN(node.vx)) {
      node.vx = 0;
    }
    if (isNaN(node.vy)) {
      node.vy = 0;
    }
    if (!node.x) {
      if (node.fx) {
        node.x = node.fx;
      } else {
        node.x = center.x + pmdsPos[i][0] || jiggle() * 1e6 * Math.sqrt(n) * 10;
      }
    }
    if (!node.y) {
      if (node.fy) {
        node.y = node.fy;
      } else {
        node.y = center.y + pmdsPos[i][1] || jiggle() * 1e6 * Math.sqrt(n) * 10;
      }
    }
  });
}
