import { act, render } from "@testing-library/react";
import React from "react";
import {
  OneUseCallback,
  Renders,
  WithDeps,
  WithReturn
} from "./components/UseCallback";

beforeEach(() => {
  collector.reset();
});

describe("useCallback", () => {
  test("Component with one useCallback", () => {
    const callFunc = jest.fn();

    render(<OneUseCallback callFunc={callFunc} />);

    const useCallbackHooks = collector
      .getReactHooks(OneUseCallback.name)
      .getHooksByType("useCallback");

    expect(useCallbackHooks.get(1)).not.toBeUndefined();
    expect(useCallbackHooks.get(1)?.action).not.toBeCalled();
    expect(useCallbackHooks.get(1)?.action()).toEqual(callFunc);
    expect(useCallbackHooks.get(1)?.hasBeenChanged).toBeFalsy();
  });

  test("Deps in the component", () => {
    const deps = [1, { property: "some" }, "Text", false];
    render(<WithDeps deps={deps} />);

    const useCallbackHooks = collector
      .getReactHooks(WithDeps.name)
      .getHooksByType("useCallback");

    expect(useCallbackHooks?.get(1)).not.toBeUndefined();
    expect(useCallbackHooks?.get(1)?.deps).toEqual(deps);
  });

  test("Dynamic render", () => {
    const caller = {
      action: jest.fn(),
      setState: ((_state: number) => {}) as React.Dispatch<
        React.SetStateAction<number>
      >
    };

    render(<Renders caller={caller} />);

    const useCallbackHooks = collector
      .getReactHooks(Renders.name)
      .getHooksByType("useCallback");

    const testSuite = (num: number, expectedCallCount: number) => {
      if (num > 1) {
        // manually set state
        act(() => {
          caller.setState(num);
        });
      }

      expect(useCallbackHooks.get(1)).not.toBeUndefined();
      expect(useCallbackHooks.get(1)?.action).toBeCalledTimes(
        expectedCallCount
      );
      expect(useCallbackHooks.get(1)?.action()).toEqual(caller.action);
    };

    testSuite(1, 1);
    expect(useCallbackHooks.get(1)?.hasBeenChanged).toBeFalsy();
    testSuite(2, 3);
    expect(useCallbackHooks.get(1)?.hasBeenChanged).toBeTruthy();
    testSuite(3, 5);
    expect(useCallbackHooks.get(1)?.hasBeenChanged).toBeTruthy();
    testSuite(3, 7);
    expect(useCallbackHooks.get(1)?.hasBeenChanged).toBeFalsy();
  });

  test("Component with one useCallback", () => {
    const callFunc = jest.fn();

    render(<OneUseCallback callFunc={callFunc} />);

    const useCallbackHooks = collector
      .getReactHooks(OneUseCallback.name)
      .getHooksByType("useCallback");

    expect(useCallbackHooks.get(1)).not.toBeUndefined();
    expect(useCallbackHooks.get(1)?.action).not.toBeCalled();
    expect(useCallbackHooks.get(1)?.action()).toEqual(callFunc);
    expect(useCallbackHooks.get(1)?.hasBeenChanged).toBeFalsy();
  });

  test("Dynamic state", () => {
    const caller = {
      action: (_nume: number) => ""
    };

    render(<WithReturn caller={caller} />);

    const useCallbackHooks = collector
      .getReactHooks(WithReturn.name)
      .getHooksByType("useCallback");

    expect(useCallbackHooks.get(1)?.action).not.toBeCalled();

    caller.action(56);

    expect(useCallbackHooks.get(1)?.action).lastCalledWith(56);
    expect(useCallbackHooks.get(1)?.action).toReturnWith("Call 56");
  });
});
