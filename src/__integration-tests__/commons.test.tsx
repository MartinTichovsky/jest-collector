import { render } from "@testing-library/react";
import React from "react";
import { EmptyWithUseEffectAndUseCallback } from "./components/common.unregistered";
import { WithDeps as UseCallbackDeps } from "./components/UseCallback";
import { WithDeps as UseEffectDeps } from "./components/UseEffect";

beforeEach(() => {
  collector.reset();
});

const ComponentName = "WithDeps";

describe("Commons tests", () => {
  test("Unkwon function", () => {
    expect(collector.getCallCount("SomeComponent")).toBeUndefined();
    expect(collector.getComponent("SomeComponent")).toBeUndefined();
    expect(collector.getFunction("SomeComponent")).toBeUndefined();
    expect(
      collector.getReactComponentHooks("SomeComponent")
    ).not.toBeUndefined();
    expect(
      collector.getReactComponentHooks("SomeComponent").getAll()
    ).toBeUndefined();
    expect(
      collector.getReactComponentHooks("SomeComponent").getHook("useEffect", -1)
    ).toBeUndefined();
    expect(
      collector.getReactComponentHooks("SomeComponent").getHook("useEffect", 0)
    ).toBeUndefined();
    expect(
      collector.getReactComponentHooks("SomeComponent").getHook("useEffect", 1)
    ).toBeUndefined();
    expect(
      collector
        .getReactComponentHooks("SomeComponent")
        .getHooksByType("useEffect")
    ).not.toBeUndefined();
    expect(
      collector
        .getReactComponentHooks("SomeComponent")
        .getHooksByType("useEffect")
        .get(-1)
    ).toBeUndefined();
    expect(
      collector
        .getReactComponentHooks("SomeComponent")
        .getHooksByType("useEffect")
        .get(0)
    ).toBeUndefined();
    expect(
      collector
        .getReactComponentHooks("SomeComponent")
        .getHooksByType("useEffect")
        .get(1)
    ).toBeUndefined();
  });

  test("More components with the same name should log a warning", () => {
    console.warn = jest.fn();

    render(
      <>
        <UseEffectDeps deps={[]} />
        <UseCallbackDeps deps={[]} />
      </>
    );

    expect(console.warn).not.toBeCalled();
    collector.getFunction(ComponentName);
    expect(console.warn).toBeCalled();
  });

  test("More components with the same name and data test id", () => {
    console.warn = jest.fn();

    const dataTestId1 = "test-id-1";
    const dataTestId2 = "test-id-2";

    render(
      <>
        <UseEffectDeps data-testid={dataTestId1} deps={[]} />
        <UseCallbackDeps data-testid={dataTestId2} deps={[]} />
      </>
    );

    expect(console.warn).not.toBeCalled();
    expect(collector.getFunction(ComponentName)).toBeUndefined();
    expect(
      collector.getFunction(ComponentName, { dataTestId: dataTestId1 })
    ).not.toBeUndefined();
    expect(
      collector.getFunction(ComponentName, { dataTestId: dataTestId2 })
    ).not.toBeUndefined();
    expect(
      collector.getFunction(ComponentName, { dataTestId: dataTestId1 })
    ).not.toEqual(
      collector.getFunction(ComponentName, { dataTestId: dataTestId2 })
    );
    expect(
      collector.getCallCount(ComponentName, { dataTestId: dataTestId1 })
    ).toBe(1);
    expect(
      collector.getCallCount(ComponentName, { dataTestId: dataTestId2 })
    ).toBe(1);
    expect(console.warn).not.toBeCalled();
  });

  test("More components with the same name and file path", () => {
    console.warn = jest.fn();

    const relativePath1 = "/src/__integration-tests__/components/UseEffect.tsx";
    const relativePath2 =
      "/src/__integration-tests__/components/UseCallback.tsx";

    render(
      <>
        <UseEffectDeps deps={[]} />
        <UseCallbackDeps deps={[]} />
      </>
    );

    expect(console.warn).not.toBeCalled();
    expect(
      collector.getFunction(ComponentName, { relativePath: relativePath1 })
    ).not.toBeUndefined();
    expect(
      collector.getFunction(ComponentName, { relativePath: relativePath2 })
    ).not.toBeUndefined();
    expect(
      collector.getFunction(ComponentName, { relativePath: relativePath1 })
    ).not.toEqual(
      collector.getFunction(ComponentName, { relativePath: relativePath2 })
    );
    expect(
      collector.getCallCount(ComponentName, { relativePath: relativePath1 })
    ).toBe(1);
    expect(
      collector.getCallCount(ComponentName, { relativePath: relativePath2 })
    ).toBe(1);
    expect(console.warn).not.toBeCalled();
  });

  test("Not mocked component", () => {
    render(<EmptyWithUseEffectAndUseCallback />);

    expect(
      collector.getComponent(EmptyWithUseEffectAndUseCallback.name)
    ).toBeUndefined();
  });
});
