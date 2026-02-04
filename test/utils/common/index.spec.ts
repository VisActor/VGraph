import { uuid } from '../../../src/utils/common';

describe('src/common/index', () => {
  it('uuid should work', () => {
    for (let i = 0; i < 10; i++) {
      const id = uuid();
      expect(typeof id).toBe('string');
      expect(id.length).toBe(8);
    }
    for (let i = 0; i < 10; i++) {
      const id = uuid(10);
      expect(typeof id).toBe('string');
      expect(id.length).toBe(10);
    }
  });
});