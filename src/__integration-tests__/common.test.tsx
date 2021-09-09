import { render } from "@testing-library/react";
import React from "react";
import { ClassComponent } from "./components/class-components";
import { EmptyWithUseEffectAndUseCallback } from "./components/common.unregistered";
import { WithDeps as UseCallbackDeps } from "./components/UseCallback";
import { WithDeps as UseEffectDeps } from "./components/UseEffect";
import { TestClass } from "./others/class";
import { recursiveFuntion } from "./others/recursive-function";

console.warn = jest.fn();
const ComponentName = "WithDeps";
const dataTestId1 = "test-id-1";
const dataTestId2 = "test-id-2";
const useCallbackDepsRelativePath =
  "/src/__integration-tests__/components/UseCallback.tsx";
const useEffectDepsRelativePath =
  "/src/__integration-tests__/components/UseEffect.tsx";

beforeEach(() => {
  collector.reset();
  jest.clearAllMocks();
});

describe("Commons tests", () => {
  test("Class", () => {
    expect(collector.getDataFor(TestClass.name)).toBeUndefined();
    const testClass = new TestClass();
    expect(collector.getDataFor(TestClass.name)).not.toBeUndefined();
    expect(collector.getCallCount(TestClass.name)).toBe(1);
    expect(testClass instanceof TestClass).toBeTruthy();
    new TestClass();
    expect(collector.getCallCount(TestClass.name)).toBe(2);
  });

  test("More components with the same name should log a warning", () => {
    render(
      <>
        <UseEffectDeps deps={[]} />
        <UseCallbackDeps deps={[]} />
      </>
    );

    expect(console.warn).not.toBeCalled();
    collector.getDataFor(ComponentName);
    expect(console.warn).toBeCalled();
  });

  test("More components with the same name and different test id", () => {
    render(
      <>
        <UseEffectDeps data-testid={dataTestId1} deps={[]} />
        <UseCallbackDeps data-testid={dataTestId2} deps={[]} />
      </>
    );

    // check if componets exist, it should not log a warning, because functions are called with dataTestId
    expect(console.warn).not.toBeCalled();
    expect(collector.getDataFor(ComponentName)).toBeUndefined();
    expect(
      collector.getDataFor(ComponentName, { dataTestId: dataTestId1 })
    ).not.toBeUndefined();
    expect(
      collector.getDataFor(ComponentName, { dataTestId: dataTestId2 })
    ).not.toBeUndefined();
    expect(
      collector.getDataFor(ComponentName, { dataTestId: dataTestId1 })
    ).not.toEqual(
      collector.getDataFor(ComponentName, { dataTestId: dataTestId2 })
    );
    expect(
      collector.getCallCount(ComponentName, { dataTestId: dataTestId1 })
    ).toBe(1);
    expect(
      collector.getCallCount(ComponentName, { dataTestId: dataTestId2 })
    ).toBe(1);
    expect(console.warn).not.toBeCalled();

    // reset data only for one specific component
    collector.reset(ComponentName, { dataTestId: dataTestId2 });

    // check if component has been deleted
    expect(
      collector.getDataFor(ComponentName, { dataTestId: dataTestId1 })
    ).not.toBeUndefined();
    expect(
      collector.getDataFor(ComponentName, { dataTestId: dataTestId2 })
    ).toBeUndefined();

    // render with the same data-testid
    render(
      <>
        <UseEffectDeps data-testid={dataTestId1} deps={[]} />
        <UseCallbackDeps data-testid={dataTestId1} deps={[]} />
      </>
    );

    // check the component data, it should log a warning because there are
    // two components with the same name and test id and different path of the script
    expect(console.warn).not.toBeCalled();
    expect(
      collector.getCallCount(ComponentName, { dataTestId: dataTestId1 })
    ).toBe(2);
    expect(
      collector.getComponentData(ComponentName, { dataTestId: dataTestId1 })
    ).not.toBeUndefined();
    expect(
      collector.getCallCount(ComponentName, { dataTestId: dataTestId2 })
    ).toBeUndefined();
    expect(
      collector.getComponentData(ComponentName, { dataTestId: dataTestId2 })
    ).toBeUndefined();
    expect(console.warn).toBeCalled();

    // clean the mock stats
    (console.warn as jest.Mock).mockClear();

    // get data wth dataTestId and relative path
    expect(console.warn).not.toBeCalled();
    expect(
      collector.getCallCount(ComponentName, {
        dataTestId: dataTestId1,
        relativePath: useEffectDepsRelativePath
      })
    ).toBe(2);
    expect(
      collector.getComponentData(ComponentName, {
        dataTestId: dataTestId1,
        relativePath: useEffectDepsRelativePath
      })
    ).not.toBeUndefined();
    expect(
      collector.getCallCount(ComponentName, {
        dataTestId: dataTestId1,
        relativePath: useCallbackDepsRelativePath
      })
    ).toBe(1);
    expect(
      collector.getComponentData(ComponentName, {
        dataTestId: dataTestId1,
        relativePath: useCallbackDepsRelativePath
      })
    ).not.toBeUndefined();
    expect(console.warn).not.toBeCalled();
  });

  test("More components with the same name and different file path", () => {
    render(
      <>
        <UseEffectDeps deps={[]} />
        <UseCallbackDeps deps={[]} />
      </>
    );

    // check if componets exist, it should not log a warning, because functions are called with relativePath
    expect(console.warn).not.toBeCalled();
    expect(
      collector.getDataFor(ComponentName, {
        relativePath: useCallbackDepsRelativePath
      })
    ).not.toBeUndefined();
    expect(
      collector.getDataFor(ComponentName, {
        relativePath: useEffectDepsRelativePath
      })
    ).not.toBeUndefined();
    expect(
      collector.getDataFor(ComponentName, {
        relativePath: useCallbackDepsRelativePath
      })
    ).not.toEqual(
      collector.getDataFor(ComponentName, {
        relativePath: useEffectDepsRelativePath
      })
    );
    expect(
      collector.getCallCount(ComponentName, {
        relativePath: useCallbackDepsRelativePath
      })
    ).toBe(1);
    expect(
      collector.getCallCount(ComponentName, {
        relativePath: useEffectDepsRelativePath
      })
    ).toBe(1);
    expect(console.warn).not.toBeCalled();

    // reset data on component with useCallbackDepsRelativePath
    collector.reset(ComponentName, {
      relativePath: useCallbackDepsRelativePath
    });

    // check if component data is correctly deleted
    expect(
      collector.getCallCount(ComponentName, {
        relativePath: useCallbackDepsRelativePath
      })
    ).toBeUndefined();
    expect(
      collector.getComponentData(ComponentName, {
        relativePath: useCallbackDepsRelativePath
      })
    ).toBeUndefined();
    expect(
      collector.getCallCount(ComponentName, {
        relativePath: useEffectDepsRelativePath
      })
    ).toBe(1);
    expect(
      collector.getComponentData(ComponentName, {
        relativePath: useEffectDepsRelativePath
      })
    ).not.toBeUndefined();

    // new redner should again register the component
    render(
      <>
        <UseEffectDeps deps={[]} />
        <UseCallbackDeps deps={[]} />
      </>
    );

    // check the data
    expect(
      collector.getCallCount(ComponentName, {
        relativePath: useCallbackDepsRelativePath
      })
    ).toBe(1);
    expect(
      collector.getComponentData(ComponentName, {
        relativePath: useCallbackDepsRelativePath
      })
    ).not.toBeUndefined();
    expect(
      collector.getCallCount(ComponentName, {
        relativePath: useEffectDepsRelativePath
      })
    ).toBe(2);
    expect(
      collector.getComponentData(ComponentName, {
        relativePath: useEffectDepsRelativePath
      })
    ).not.toBeUndefined();
  });

  test("Not mocked component", () => {
    render(<EmptyWithUseEffectAndUseCallback />);

    expect(
      collector.getComponentData(EmptyWithUseEffectAndUseCallback.name)
    ).toBeUndefined();
  });

  test("recursiveFuntion", () => {
    recursiveFuntion(10, recursiveFuntion);
    expect(collector.getDataFor(recursiveFuntion.name)).not.toBeUndefined();

    const functionHistory = collector.getDataFor(recursiveFuntion.name);

    expect(functionHistory?.jestFn).not.toBeUndefined();
    expect(functionHistory?.jestFn).toBeCalledTimes(11);
    expect(functionHistory?.calls.length).toBe(11);

    for (let i = 0; i < functionHistory!.calls.length; i++) {
      expect(functionHistory!.calls[i].result).toBe(10 - i);
    }
  });

  test("Stats", () => {
    new TestClass();
    render(<ClassComponent />);
    recursiveFuntion(3, recursiveFuntion);
    render(<EmptyWithUseEffectAndUseCallback />);
    render(
      <>
        <UseEffectDeps data-testid={dataTestId1} deps={[1, 2, 3]} />
        <UseCallbackDeps data-testid={dataTestId2} deps={[{ prop: "value" }]} />
      </>
    );

    expect(collector.getStats()).toMatchSnapshot();
    expect(collector.getStats(TestClass.name)).toMatchSnapshot();
    expect(
      collector.getStats(ComponentName, { dataTestId: dataTestId1 })
    ).toMatchSnapshot();
  });

  test("Unknown function", () => {
    // everything must return udnefined
    expect(collector.getCallCount("SomeComponent")).toBeUndefined();
    expect(collector.getComponentData("SomeComponent")).toBeUndefined();
    expect(collector.getDataFor("SomeComponent")).toBeUndefined();
    expect(collector.getReactHooks("SomeComponent")).not.toBeUndefined();
    expect(collector.getReactHooks("SomeComponent").getAll()).toBeUndefined();
    expect(
      collector.getReactHooks("SomeComponent").getHook("useEffect", -1)
    ).toBeUndefined();
    expect(
      collector.getReactHooks("SomeComponent").getHook("useEffect", 0)
    ).toBeUndefined();
    expect(
      collector.getReactHooks("SomeComponent").getHook("useEffect", 1)
    ).toBeUndefined();
    expect(
      collector.getReactHooks("SomeComponent").getHooksByType("useEffect")
    ).not.toBeUndefined();
    expect(
      collector
        .getReactHooks("SomeComponent")
        .getHooksByType("useEffect")
        .get(-1)
    ).toBeUndefined();
    expect(
      collector
        .getReactHooks("SomeComponent")
        .getHooksByType("useEffect")
        .get(0)
    ).toBeUndefined();
    expect(
      collector
        .getReactHooks("SomeComponent")
        .getHooksByType("useEffect")
        .get(1)
    ).toBeUndefined();
  });
});
