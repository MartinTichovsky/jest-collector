import { act, render } from "@testing-library/react";
import React from "react";
import {
  UnegisteredWithDeps,
  UnregisteredRenders,
  UnregisteredWithOneUseCallback
} from "./unregistered/UseCallback";

beforeEach(() => {
  collector.reset();
});

describe("useCallback", () => {
  test("Unregistered component with one useCallback", () => {
    const callFunc = jest.fn();

    render(<UnregisteredWithOneUseCallback callFunc={callFunc} />);

    const useCallbackHooks = collector.getUnregisteredReactComponentHooks(
      UnregisteredWithOneUseCallback.name,
      "useCallback"
    );

    expect(useCallbackHooks?.getHook(1)).not.toBeUndefined();
    expect(useCallbackHooks?.getHook(1)?.action).not.toBeUndefined();
    expect(useCallbackHooks?.getHook(1)?.action?.()).toEqual(callFunc);
  });

  test("Deps in unregistered component", () => {
    const deps = [1, { property: "some" }, "Text", false];
    render(<UnegisteredWithDeps deps={deps} />);

    const useCallbackHooks = collector.getUnregisteredReactComponentHooks(
      UnegisteredWithDeps.name,
      "useCallback"
    );

    expect(useCallbackHooks?.getHook(1)).not.toBeUndefined();
    expect(useCallbackHooks?.getHook(1)?.deps).not.toBeUndefined();
    expect(useCallbackHooks?.getHook(1)?.deps).toEqual(deps);
  });

  test("Dynamic render - unregistered component", () => {
    const caller = {
      action: jest.fn(),
      setState: ((state: number) => {}) as React.Dispatch<
        React.SetStateAction<number>
      >
    };

    render(<UnregisteredRenders caller={caller} />);

    const useCallbackHooks = collector.getUnregisteredReactComponentHooks(
      UnregisteredRenders.name,
      "useCallback"
    );

    const testSuite = (num: number) => {
      if (num) {
        // manually set state
        act(() => {
          caller.setState(num);
        });
      }

      expect(useCallbackHooks?.getHook(num)).not.toBeUndefined();
      expect(useCallbackHooks?.getHook(num)?.action).not.toBeUndefined();
      expect(useCallbackHooks?.getHook(num)?.action?.()).toEqual(caller.action);
    };

    testSuite(1);
    testSuite(2);
    testSuite(3);
  });
});
