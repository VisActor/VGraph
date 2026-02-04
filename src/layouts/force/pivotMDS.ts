import { NodeData, EdgeData } from '../../typings/data';
import { jiggle, newMatrix, shuffle } from './utils';

// 非加权无向图的单源最短路距离
// nodeTargets: 邻接表
function pivotSSSD(pivots: NodeData[], nodes: NodeData[], nodeTargets: Map<string, string[]>) {
  const p = pivots.length;
  const n = nodes.length;
  const indexOf: Map<string, number> = new Map();
  for (let i = 0; i < n; i++) {
    indexOf.set(nodes[i].id, i);
  }
  const pivotDists = newMatrix(p, n, 0);
  // BFS to get shortest distance from pivot to each node
  pivots.forEach((pnode: NodeData, pIdx: number) => {
    const visited = new Array(n).fill(false);
    let l = 0;
    let r = 0;
    const nodeStack = [];
    nodeStack.push(indexOf.get(pnode.id));
    visited[nodeStack[0] || 0] = true;
    pivotDists[pIdx][nodeStack[0] || 0] = 0;
    r++;
    while (l < r) {
      const nowIdx = nodeStack[l] || 0;
      if (nodeTargets.has(nodes[nowIdx].id)) {
        nodeTargets.get(nodes[nowIdx].id)?.forEach((vid: string) => {
          const vIdx = indexOf.get(vid) || 0;
          if (!visited[vIdx]) {
            visited[vIdx] = true;
            nodeStack.push(vIdx);
            pivotDists[pIdx][vIdx] = pivotDists[pIdx][nowIdx] + 1;
            r++;
          }
        });
      }
      l++;
    }
  });
  return pivotDists;
}

// matrixC: pivotMDS 中的C矩阵
function getMatrixC(dists: number[][]) {
  const p = dists.length;
  const n = dists[0].length;
  const dist2 = dists.map((row) => row.map((v) => v * v));
  const matrixC = newMatrix(p, n);
  let colMean = new Array(n).fill(0);
  let rowMean = new Array(p).fill(0);
  let allMean = 0;
  for (let i = 0; i < p; i++) {
    for (let j = 0; j < n; j++) {
      colMean[j] += dist2[i][j];
      rowMean[i] += dist2[i][j];
      allMean += dist2[i][j];
    }
  }
  allMean /= p * n;
  colMean = colMean.map((v) => v / p);
  rowMean = rowMean.map((v) => v / n);
  for (let i = 0; i < p; i++) {
    for (let j = 0; j < n; j++) {
      matrixC[i][j] = -0.5 * (dist2[i][j] - rowMean[i] - colMean[j] + allMean);
    }
  }
  return matrixC;
}

// matrixB: C.T dot C
function getMatrixB(matrixC: number[][]) {
  const p = matrixC.length;
  const n = matrixC[0].length;
  const matrixB = newMatrix(p, p);
  // matrixB = matrixC dot matrixC.transpose();
  for (let i = 0; i < p; i++) {
    for (let j = 0; j < p; j++) {
      for (let k = 0; k < n; k++) {
        matrixB[i][j] += matrixC[i][k] * matrixC[j][k];
      }
    }
  }
  return matrixB;
}

// 幂迭代法求特征向量
// b_k = np.random.rand(matrixB.shape[1])
// for _ in range(num_simulations):
//         b_k1 = np.dot(A, b_k)
//         b_k1_norm = np.linalg.norm(b_k1)
//         b_k = b_k1 / b_k1_norm
function powerIteration(matrixB: number[][], numIterations?: number) {
  if (!numIterations) {
    numIterations = 100;
  }
  const p = matrixB.length;
  const eigenVector = new Array(p).fill(0);
  for (let i = 0; i < p; i++) {
    eigenVector[i] = jiggle() * 1e6;
  }
  for (let i = 0; i < numIterations; i++) {
    const eigenVectorNew = new Array(p).fill(0);
    let eigenVectorNorm = 0;
    for (let j = 0; j < p; j++) {
      for (let k = 0; k < p; k++) {
        eigenVectorNew[j] += matrixB[j][k] * eigenVector[k];
      }
      eigenVectorNorm += eigenVectorNew[j] * eigenVectorNew[j];
    }
    eigenVectorNorm = Math.sqrt(eigenVectorNorm);
    for (let j = 0; j < p; j++) {
      eigenVector[j] = eigenVectorNew[j] / eigenVectorNorm;
    }
  }
  return eigenVector;
}

// 构建邻接矩阵
function buildAdjList(nodes: NodeData[], edges: EdgeData[]) {
  const nodeTargets = new Map();
  edges.forEach((edge: EdgeData) => {
    const source = edge.get ? edge.get('source') : edge.source;
    const target = edge.get ? edge.get('target') : edge.target;
    if (!nodeTargets.has(source)) {
      nodeTargets.set(source, new Set());
    }
    if (!nodeTargets.has(target)) {
      nodeTargets.set(target, new Set());
    }
    nodeTargets.get(source).add(target);
    nodeTargets.get(target).add(source);
  });
  return nodeTargets;
}

// 求解Pivot MDS
export function PMDS(nodes: NodeData[], egdes: EdgeData[], nodeSize?: number, numPivots?: number) {
  const n = nodes.length;
  if (n <= 0) {
    return [];
  }
  const indexOf: Map<string, number> = new Map();
  for (let i = 0; i < n; i++) {
    indexOf.set(nodes[i].id, i);
  }
  const nodeTargets = buildAdjList(nodes, egdes);
  if (!numPivots) {
    numPivots = 50;
  }
  let pivots;
  if (numPivots >= n) {
    pivots = nodes;
  } else {
    pivots = new Array(numPivots);
    const randNums = shuffle(new Array(n).fill(0).map((d, i) => i));
    for (let i = 0; i < numPivots; i++) {
      pivots[i] = nodes[randNums[i]];
    }
    const leastPivot = indexOf.get(nodeTargets.keys().next().value);
    if (leastPivot !== undefined){
      pivots[numPivots - 1] = nodes[leastPivot]; // 至少有一个是有连线的，避免全是孤立点而导致 NaN。
    }
  }
  const dists = pivotSSSD(pivots, nodes, nodeTargets);
  const matrixC = getMatrixC(dists);
  const matrixB = getMatrixB(matrixC);
  const eigenVector = powerIteration(matrixB);
  // eigenvalue  = np.dot(eigenVector,np.dot(matrixB,eigenVector.T))
  let eigenvalue = 0;
  for (let i = 0; i < matrixB.length; i++) {
    for (let j = 0; j < matrixB[0].length; j++) {
      eigenvalue += eigenVector[i] * matrixB[i][j] * eigenVector[j];
    }
  }
  let eigenVectorNorm2 = 0;
  eigenVector.forEach((v) => {
    eigenVectorNorm2 += v * v;
  });
  // matrixB2 = matrixB - eigenvalue / eigenVectorNorm**2 * np.dot(eigenVector.T,eigenVector)
  const matrixB2 = newMatrix(matrixB.length, matrixB[0].length);
  for (let i = 0; i < matrixB.length; i++) {
    for (let j = 0; j < matrixB[0].length; j++) {
      matrixB2[i][j] = matrixB[i][j] - (eigenvalue / eigenVectorNorm2) * eigenVector[i] * eigenVector[j];
    }
  }

  const eigenVector2 = powerIteration(matrixB2);
  // pos[:,0] = np.dot(matC,V1)
  // pos[:,1] = np.dot(matC,V2)
  const pos = newMatrix(n, 2);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < eigenVector.length; j++) {
      pos[i][0] += matrixC[j][i] * eigenVector[j];
      pos[i][1] += matrixC[j][i] * eigenVector2[j];
    }
  }
  let sumBot = 0;
  let sumTop = 0;
  for (let i = 0; i < n; i++) {
    if (nodeTargets.has(nodes[i].id)) {
      nodeTargets.get(nodes[i].id).forEach((targetId: string) => {
        const target = indexOf.get(targetId) || 0;
        const dist = Math.sqrt((pos[i][0] - pos[target][0]) ** 2 + (pos[i][1] - pos[target][1]) ** 2);
        sumBot += dist * dist;
        sumTop += dist;
      });
    }
  }
  if (!nodeSize) {
    nodeSize = 20;
  }
  const scale = (sumTop / sumBot) * 2 * nodeSize;
  let xMax = -Infinity;
  let xMin = Infinity;
  let yMax = -Infinity;
  let yMin = Infinity;
  for (let i = 0; i < n; i++) {
    pos[i][0] *= scale;
    pos[i][1] *= scale;
    xMax = Math.max(xMax, pos[i][0]);
    xMin = Math.min(xMin, pos[i][0]);
    yMax = Math.max(yMax, pos[i][1]);
    yMin = Math.min(yMin, pos[i][1]);
  }
  const xRange = xMax - xMin;
  const yRange = yMax - yMin;
  for (let i = 0; i < n; i++) {
    pos[i][0] = pos[i][0] - xMin - xRange / 2;
    pos[i][1] = pos[i][1] - yMin - yRange / 2;
  }
  return pos;
}
