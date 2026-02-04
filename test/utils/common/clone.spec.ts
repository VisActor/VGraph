import { cloneDeep } from '../../../src/utils/';

describe('src/common/clone', () => {
  it('cloneDeep should work', () => {
    const configs = {
      left: 10,
      fillStyle: '#ccc',
      strokeStyle: null,
      label: undefined,
      lineDash: [5, 5],
      endArrow: false,
      controlPoints: [
        [100, 100],
        [200, 200]
      ],
      data: {
        a: '1',
        b: {
          c: ['c', 'd'],
          d: 'd'
        }
      },
    };

    const data = cloneDeep(configs);
    expect(data).toEqual({
      left: 10,
      fillStyle: '#ccc',
      strokeStyle: null,
      label: undefined,
      lineDash: [5, 5],
      endArrow: false,
      controlPoints: [
        [100, 100],
        [200, 200]
      ],
      data: {
        a: '1',
        b: {
          c: ['c', 'd'],
          d: 'd'
        }
      },
    });
    data.lineDash[0] = 10;
    expect(data.lineDash).toEqual([10, 5]);
    expect(configs.lineDash).toEqual([5, 5]);

    configs.data.a = '2';
    (configs.data.b.c as any) = '3';
    expect(configs.data).toEqual({
      a: '2',
      b: {
        c: '3',
        d: 'd'
      }
    })
    expect(data.data).toEqual({
      a: '1',
      b: {
        c: ['c', 'd'],
        d: 'd'
      }
    });
  });
});