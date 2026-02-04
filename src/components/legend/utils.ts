import { LabelConfigs } from '../../typings/model';

export function getLabelConfigs(labelConfigs: string | LabelConfigs) {
  if (typeof labelConfigs === 'string') {
    return {
      text: labelConfigs,
    };
  } else {
    return labelConfigs;
  }
}

export function matrixMultiply(vector1: number[], vector2: number[]) {
  const [a1, b1, c1, d1, e1, f1] = vector1;
  const [a2, b2, c2, d2, e2, f2] = vector2;
  return [a1 * a2, b1 * b2, c1 * c2, d1 * d2, e1 * e2, f1 * f2]
}
