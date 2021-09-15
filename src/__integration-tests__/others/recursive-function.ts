export function recursiveFunction(
  callCount: number,
  execute: typeof recursiveFunction
) {
  if (callCount > 0) {
    execute(callCount - 1, execute);
    return callCount;
  }
  return callCount;
}

export function regularFunction(param: any) {
  return param;
}
