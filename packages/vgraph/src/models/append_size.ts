import { BBox } from "../renderer";

export function updateAppendSize(
  appendSize: number[],
  bbox: BBox,
  configs: { width: number; height: number; [k: string]: unknown }
) {
  const { left, top, width, height } = bbox;
  if (top < -configs.height / 2 - appendSize[0]) {
    appendSize[0] += -configs.height / 2 - appendSize[0] - top;
  }
  if (left + width > configs.width / 2 + appendSize[1]) {
    appendSize[1] += left + width - configs.width / 2 - appendSize[1];
  }
  if (top + height > configs.height / 2 + appendSize[2]) {
    appendSize[2] += top + height - configs.height / 2 - appendSize[2];
  }
  if (bbox.left < -configs.width / 2 - appendSize[3]) {
    appendSize[3] += -configs.width / 2 - appendSize[3] - bbox.left;
  }
  return appendSize;
}

export function arrayAdd(a: number[], b: number[]) {
  a.forEach((num: number, i: number) => {
    a[i] += b[i];
  });
}
