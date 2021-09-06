import { recursiveFuntion } from "./functions/recursive";

test("recursiveFuntion", () => {
  recursiveFuntion(10, recursiveFuntion);
  expect(
    collector.getRegisteredFunction(recursiveFuntion.name)
  ).not.toBeUndefined();

  const functionHistory = collector.getRegisteredFunction(
    recursiveFuntion.name
  );

  expect(functionHistory?.jestFn).not.toBeUndefined();
  expect(functionHistory?.jestFn).toBeCalledTimes(11);
  expect(functionHistory?.call.length).toBe(11);

  for (let i = 0; i < functionHistory!.call.length; i++) {
    expect(functionHistory!.call[i].result).toBe(10 - i);
  }
});
