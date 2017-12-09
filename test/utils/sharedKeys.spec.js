import expect from 'expect';
import sharedKeys from '../../src/utils/sharedKeys';

describe('Utils', () => {
  describe('sharedKeys', () => {
    it('should return an empty Array if one or the other object is empty, null, or undefined', () => {
      expect(sharedKeys({}, { a: 1, b: undefined, c: {}, d: 'd' })).toEqual([]);

      expect(sharedKeys({ a: 1, b: undefined, c: {}, d: 'd' }, {})).toEqual([]);

      expect(sharedKeys(null, { a: 1, b: undefined, c: {}, d: 'd' })).toEqual(
        []
      );

      expect(sharedKeys({ a: 1, b: undefined, c: {}, d: 'd' }, null)).toEqual(
        []
      );

      expect(
        sharedKeys(undefined, { a: 1, b: undefined, c: {}, d: 'd' })
      ).toEqual([]);

      expect(
        sharedKeys({ a: 1, b: undefined, c: {}, d: 'd' }, undefined)
      ).toEqual([]);
    });

    it('should return equivalent of Object.keys if the arguments are the same non-empty object', () => {
      const emptyObj = {};
      const fullObj = { a: 1 };
      expect(sharedKeys(emptyObj, emptyObj)).toEqual(Object.keys(emptyObj));

      expect(sharedKeys(fullObj, fullObj)).toEqual(Object.keys(fullObj));
    });

    it('should return equivalent of Object.keys of either argument if objects are different but have the same keys', () => {
      const objA = { a: 1, b: 2, c: 3 };
      const objB = { a: 'a', b: 'b', c: 'c' };

      expect(sharedKeys(objA, objB)).toEqual(Object.keys(objA));

      expect(sharedKeys(objA, objB)).toEqual(Object.keys(objB));
    });

    it('should return array containing all keys found in both objects', () => {
      expect(sharedKeys({ x: 1, y: 2, z: 3 }, { a: 1, b: 2, c: 3 })).toEqual(
        []
      );

      expect(
        sharedKeys({ x: 1, y: 4, z: 3, b: 'blah' }, { a: 1, b: 2, c: 3 })
      ).toEqual(['b']);

      expect(
        sharedKeys(
          { x: 1, y: 4, z: 3, b: 'blah' },
          { a: 1, b: 2, c: 3, y: 'z', x: 'b' }
        ).sort()
      ).toEqual(['b', 'x', 'y'].sort());
    });
  });
});
