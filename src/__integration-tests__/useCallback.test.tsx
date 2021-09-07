import { act, render } from "@testing-library/react";
import React from "react";
import { OneUseCallback, Renders, WithDeps } from "./components/UseCallback";

beforeEach(() => {
  collector.reset();
});

describe("useCallback", () => {
  test("Component with one useCallback", () => {
    const callFunc = jest.fn();

    render(<OneUseCallback callFunc={callFunc} />);

    const hooks = collector
      .getReactComponentHooks(OneUseCallback.name)
      .getHooksByType("useCallback");

    expect(hooks.get(1)).not.toBeUndefined();
    expect(hooks.get(1)?.action).not.toBeCalled();
    expect(hooks.get(1)?.action()).toEqual(callFunc);
    expect(hooks.get(1)?.hasBeenChanged).toBeFalsy();
  });

  test("Deps in the component", () => {
    const deps = [1, { property: "some" }, "Text", false];
    render(<WithDeps deps={deps} />);

    const hooks = collector
      .getReactComponentHooks(WithDeps.name)
      .getHooksByType("useCallback");

    expect(hooks?.get(1)).not.toBeUndefined();
    expect(hooks?.get(1)?.deps).toEqual(deps);
  });

  test("Dynamic render", () => {
    const caller = {
      action: jest.fn(),
      setState: ((_state: number) => {}) as React.Dispatch<
        React.SetStateAction<number>
      >
    };

    render(<Renders caller={caller} />);

    const hooks = collector
      .getReactComponentHooks(Renders.name)
      .getHooksByType("useCallback");

    const testSuite = (num: number, expectedCallCount: number) => {
      if (num > 1) {
        // manually set state
        act(() => {
          caller.setState(num);
        });
      }

      expect(hooks.get(1)).not.toBeUndefined();
      expect(hooks.get(1)?.action).toBeCalledTimes(expectedCallCount);
      expect(hooks.get(1)?.action()).toEqual(caller.action);
    };

    testSuite(1, 1);
    expect(hooks.get(1)?.hasBeenChanged).toBeFalsy();
    testSuite(2, 3);
    expect(hooks.get(1)?.hasBeenChanged).toBeTruthy();
    testSuite(3, 5);
    expect(hooks.get(1)?.hasBeenChanged).toBeTruthy();
    testSuite(3, 7);
    expect(hooks.get(1)?.hasBeenChanged).toBeFalsy();
  });
});
