export function recursiveFuntion(
  callCount: number,
  execute: typeof recursiveFuntion
) {
  if (callCount > 0) {
    execute(callCount - 1, execute);
    return callCount;
  }
  return callCount;
}
