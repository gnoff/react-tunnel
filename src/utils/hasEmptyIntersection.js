export default function hasEmptyIntersection(objA, objB) {
  if (!objA || !objB) {
    return true;
  }

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  if (keysA.length === 0 || keysB.length === 0) {
    return true;
  }

  if (objA === objB) {
    return false;
  }

  const objCombined = { ...objA, ...objB };
  const keysCombined = Object.keys(objCombined);

  if (keysA.length + keysB.length === keysCombined.length) {
    return true;
  }

  return false;
}
