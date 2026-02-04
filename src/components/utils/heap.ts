export class Heap {
  array: any[] = [];
  posMap = {}; 
  cmp: (a: any, b: any) => number = (a: number, b: number) => a - b;
  constructor(cmp?: (a: any, b: any) => number, maxSize?: number) {
    if (cmp) {
      this.cmp = cmp;
    }
    if (maxSize){
      this.posMap = new Uint32Array(maxSize);
    }
  }
  push(item: any) {
    this.array.push(item);
    return this.siftDown(0, this.array.length - 1);
  }
  siftDown(startPos: number, pos: number) {
    let parent, parentPos;
    const newItem = this.array[pos];
    while (pos > startPos) {
      parentPos = (pos - 1) >> 1;
      parent = this.array[parentPos];
      if (this.cmp(newItem, parent) < 0) {
        this.array[pos] = parent;
        parent.id !== undefined && (this.posMap[parent.id] = pos);
        pos = parentPos;
        continue;
      }
      break;
    }
    this.array[pos] = newItem;
    newItem.id !== undefined && (this.posMap[newItem.id] = pos);
    return pos;
  }
  pop() {
    const lastItem = this.array.pop();
    if (this.array.length) {
      const returnItem = this.array[0];
      this.array[0] = lastItem;
      lastItem.id !== undefined && (this.posMap[lastItem.id] = 0);
      this.siftUp(0);
      return returnItem;
    } else {
      return lastItem;
    }
  }
  top() {
    return this.array[0];
  }
  empty() {
    return this.array.length === 0;
  }
  siftUp(pos: number) {
    let childPos, rightPos;
    const endPos = this.array.length;
    const startPos = pos;
    const newItem = this.array[pos];
    childPos = 2 * pos + 1;
    while (childPos < endPos) {
      rightPos = childPos + 1;
      if (rightPos < endPos && !(this.cmp(this.array[childPos], this.array[rightPos]) < 0)) {
        childPos = rightPos;
      }
      this.array[pos] = this.array[childPos];
      this.array[pos].id !== undefined && (this.posMap[this.array[pos].id] = pos);
      pos = childPos;
      childPos = 2 * pos + 1;
    }
    this.array[pos] = newItem;
    newItem.id !== undefined && (this.posMap[newItem.id] = pos);
    return this.siftDown(startPos, pos);
  }
  update(item: any) {
    const pos = this.posMap[item.id];
    if (pos === undefined) {
      return;
    }
    this.siftDown(0, pos);
    return this.siftUp(pos);
  }
}
