import { Heap } from '../../src/components/utils/heap';

describe('algorithms/Heap', function () {
  it('should sort an array using push and pop', () => {
    const heap = new Heap();
    const arr = [] as number[];
    for (let i = 0; i < 10; i++) {
      const n = Math.random();
      arr.push(n);
      heap.push(n);
    }
    // expect(heap.array).toEqual(arr.sort());
    const sorted = [] as number[];
    for (let i = 0; i < 10; i++) {
      sorted.push(heap.pop());
    }
    expect(sorted).toEqual(arr.sort());
  });

  it('should work with custom comparison function', () => {
    const heap = new Heap((a: any, b: any) => a.value - b.value);
    const arr = [] as any[];
    for (let i = 0; i < 10; i++) {
      const n = Math.random();
      arr.push({ value: n });
      heap.push({ value: n });
    }
    // expect(heap.array).toEqual(arr.sort((a: any, b: any) => a.value - b.value));
    const sorted = [] as any[];
    for (let i = 0; i < 10; i++) {
      sorted.push(heap.pop());
    }
    expect(sorted).toEqual(arr.sort((a: any, b: any) => a.value - b.value));
  });

  it('should work with update item', () => {
    const heap = new Heap((a: any, b: any) => a.value - b.value);
    const arr = [] as any[];
    for (let i = 0; i < 100; i++) {
      const n = Math.random();
      const node = { value: n, id: i };
      arr.push(node);
      heap.push(node);
    }

    for (let i = 0; i < 100; i++) {
      const item = arr[i];
      item.value = Math.random();
      expect(heap.posMap[item.id]).toBe(heap.array.findIndex((d) => {
        return d.id === item.id;
      }));
      heap.update(item);
    }

    const sorted = [] as any[];
    for (let i = 0; i < 100; i++) {
      sorted.push(heap.pop());
    }
    // console.log(sorted, arr.sort((a: any, b: any) => a.value - b.value));
    expect(sorted).toEqual(arr.sort((a: any, b: any) => a.value - b.value));

  });
});
