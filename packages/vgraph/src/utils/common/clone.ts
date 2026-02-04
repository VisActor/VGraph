export function cloneDeep(object: any): any {
  const clone = {};
  // 此方法多用于 clone node configs， shape 目前无 clone 场景
  if (object?.shouldDraw) {
    return null;
  }
  if (
    typeof object === "number" ||
    typeof object === "boolean" ||
    typeof object === "string" ||
    typeof object === "function"
  ) {
    return object;
  } else if (object === null || object === undefined) {
    return object;
  } else if (Array.isArray(object)) {
    return object.map((item: any) => cloneDeep(item));
  }
  for (const key in object) {
    if (object.hasOwnProperty(key)) {
      clone[key] = cloneDeep(object[key]);
    }
  }
  return clone;
}
