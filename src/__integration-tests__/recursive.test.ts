import { recursiveFuntion } from "./functions/recursive";

test("recursiveFuntion", () => {
  recursiveFuntion(10, recursiveFuntion);
  expect(collector.getFunction(recursiveFuntion.name)).not.toBeUndefined();

  const functionHistory = collector.getFunction(recursiveFuntion.name);

  expect(functionHistory?.jestFn).not.toBeUndefined();
  expect(functionHistory?.jestFn).toBeCalledTimes(11);
  expect(functionHistory?.calls.length).toBe(11);

  for (let i = 0; i < functionHistory!.calls.length; i++) {
    expect(functionHistory!.calls[i].result).toBe(10 - i);
  }
});
