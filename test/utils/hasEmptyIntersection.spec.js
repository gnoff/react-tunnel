import expect from 'expect';
import hasEmptyIntersection from '../../src/utils/hasEmptyIntersection';

describe('Utils', () => {
  describe('hasEmptyIntersection', () => {
    it('should return true if one or the other object is empty, null, or undefined', () => {
      expect(
        hasEmptyIntersection({}, { a: 1, b: undefined, c: {}, d: 'd' })
      ).toBe(true);

      expect(
        hasEmptyIntersection({ a: 1, b: undefined, c: {}, d: 'd' }, {})
      ).toBe(true);

      expect(
        hasEmptyIntersection(null, { a: 1, b: undefined, c: {}, d: 'd' })
      ).toBe(true);

      expect(
        hasEmptyIntersection({ a: 1, b: undefined, c: {}, d: 'd' }, null)
      ).toBe(true);

      expect(
        hasEmptyIntersection(undefined, { a: 1, b: undefined, c: {}, d: 'd' })
      ).toBe(true);

      expect(
        hasEmptyIntersection({ a: 1, b: undefined, c: {}, d: 'd' }, undefined)
      ).toBe(true);
    });

    it('should return false if the arguments are the same non-empty object', () => {
      const emptyObj = {};
      const fullObj = { a: 1 };
      expect(hasEmptyIntersection(emptyObj, emptyObj)).toBe(true);

      expect(hasEmptyIntersection(fullObj, fullObj)).toBe(false);
    });

    it('should return false if objects are different but have the same keys', () => {
      expect(
        hasEmptyIntersection({ a: 1, b: 2, c: 3 }, { a: 'a', b: 'b', c: 'c' })
      ).toBe(false);
    });

    it('should return false if objects share a single key', () => {
      expect(
        hasEmptyIntersection({ x: 1, y: 2, z: 3 }, { a: 1, b: 2, c: 3 })
      ).toBe(true);

      expect(
        hasEmptyIntersection(
          { x: 1, y: 4, z: 3, b: 'blah' },
          { a: 1, b: 2, c: 3 }
        )
      ).toBe(false);
    });
  });
});
