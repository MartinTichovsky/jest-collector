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

describe("UseCallback", () => {
  test("Component with one useCallback", () => {
    const callFunc = jest.fn();

    render(<OneUseCallback callFunc={callFunc} />);

    // get useCallback hooks
    const useCallbackHooks = collector
      .getReactHooks(OneUseCallback.name)
      ?.getHooksByType("useCallback");

    // check the hooks
    expect(useCallbackHooks?.get(1)).not.toBeUndefined();
    expect(useCallbackHooks?.get(1)?.action).toBeCalledTimes(1);
    expect(useCallbackHooks?.get(1)?.action()).toEqual(callFunc);
    expect(callFunc).toBeCalledTimes(1);
    expect(useCallbackHooks?.get(1)?.hasBeenChanged).toBeFalsy();
  });

  test("Deps in the component", () => {
    const deps = [1, { property: "some" }, "Text", false];

    // render the component with passing deps
    render(<WithDeps deps={deps} />);

    // get useCallback hooks
    const useCallbackHooks = collector
      .getReactHooks(WithDeps.name)
      ?.getHooksByType("useCallback");

    // the hook should have passed deps
    expect(useCallbackHooks?.get(1)).not.toBeUndefined();
    expect(useCallbackHooks?.get(1)?.deps).toEqual(deps);
  });

  test("Dynamic changing setState to return a new result from useCallback", () => {
    // create a caller object
    const caller = {
      action: jest.fn(),
      setState: ((_state: number) => {}) as React.Dispatch<
        React.SetStateAction<number>
      >
    };

    render(<Renders caller={caller} />);

    // get useCallback hooks
    const useCallbackHooks = collector
      .getReactHooks(Renders.name)
      ?.getHooksByType("useCallback");

    // manually set the state
    act(() => {
      caller.setState(0);
    });

    // test expected result
    expect(useCallbackHooks?.get(1)).not.toBeUndefined();
    expect(useCallbackHooks?.get(1)?.action).toBeCalledTimes(1);
    expect(useCallbackHooks?.get(1)?.action()).toEqual(caller.action);
    expect(useCallbackHooks?.get(1)?.hasBeenChanged).toBeFalsy();

    // manually set the state
    act(() => {
      caller.setState(2);
    });

    // test expected result
    expect(useCallbackHooks?.get(1)).not.toBeUndefined();
    expect(useCallbackHooks?.get(1)?.action).toBeCalledTimes(3);
    expect(useCallbackHooks?.get(1)?.action()).toEqual(caller.action);
    expect(useCallbackHooks?.get(1)?.hasBeenChanged).toBeTruthy();

    // manually set the state
    act(() => {
      caller.setState(3);
    });

    // test expected result
    expect(useCallbackHooks?.get(1)).not.toBeUndefined();
    expect(useCallbackHooks?.get(1)?.action).toBeCalledTimes(5);
    expect(useCallbackHooks?.get(1)?.action()).toEqual(caller.action);
    expect(useCallbackHooks?.get(1)?.hasBeenChanged).toBeTruthy();

    // manually set the state
    act(() => {
      caller.setState(3);
    });

    // test expected result
    expect(useCallbackHooks?.get(1)).not.toBeUndefined();
    expect(useCallbackHooks?.get(1)?.action).toBeCalledTimes(7);
    expect(useCallbackHooks?.get(1)?.action()).toEqual(caller.action);
    expect(useCallbackHooks?.get(1)?.hasBeenChanged).toBeFalsy();
  });

  test("Return from useCallback", () => {
    const caller = {
      action: (_nume: number) => ""
    };

    render(<WithReturn caller={caller} />);

    // get useCallback hooks
    const useCallbackHooks = collector
      .getReactHooks(WithReturn.name)
      ?.getHooksByType("useCallback");

    // the action should not to be called
    expect(useCallbackHooks?.get(1)?.action).not.toBeCalled();

    // mnually call the action
    caller.action(56);

    // it should have the correct result
    expect(useCallbackHooks?.get(1)?.action).lastCalledWith(56);
    expect(useCallbackHooks?.get(1)?.action).toReturnWith("Call 56");
  });
});
