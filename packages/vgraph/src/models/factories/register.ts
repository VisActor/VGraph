const factory = {};

export function register(
  type: string,
  name: string,
  configs: any,
  base: Record<string, unknown> = {}
) {
  if (!factory[type]) {
    factory[type] = {};
  }
  if (factory[type][name]) {
    console.warn(`Name of ${type}: ${name} already existed, register failed`);
    return;
  }
  const shapes = factory[type];
  const extend = configs.extends;
  if (extend) {
    if (!shapes[extend]) {
      console.warn(`Cannot find ${type} named ${extend}, register failed`);
      return;
    }
  }
  shapes[name] = Object.assign({}, base, configs);
  shapes[name].type = name;
  if (extend) {
    shapes[name].extends = shapes[extend];
  }
}

export function getShapeMethods(type: string, name: string) {
  if (!factory[type]) {
    return null;
  }
  return factory[type][name];
}

export function unRegister(type: string, name: string) {
  if (!factory[type]) {
    return;
  }
  factory[type][name] = undefined;
}
