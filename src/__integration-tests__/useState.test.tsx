import { act, render, screen } from "@testing-library/react";
import React from "react";
import {
  DynamicState,
  MultipleStates,
  OneUseState
} from "./components/UseState";

beforeEach(() => {
  collector.reset();
});

describe("useState", () => {
  test("Component with one useState", () => {
    render(<OneUseState />);

    const useState = collector.getReactHooks(OneUseState.name);
    const useStateHooks = useState.getHooksByType("useState");

    expect(useStateHooks.get(1)).not.toBeUndefined();
    expect(useStateHooks.get(2)).toBeUndefined();
    expect(useStateHooks.get(1)?.setState).not.toBeCalled();
    expect(useStateHooks.get(1)?.state).toEqual([0]);
    expect(useState.getUseState(1).getState(1)).toEqual(0);
    expect(useState.getUseState(2).getState(1)).toBeUndefined();
    expect(useState.getUseState(1).getState(2)).toBeUndefined();
  });

  test("Dynamic state", () => {
    const getExpectedText = (num: number) => `State ${num}`;
    const caller = {
      setState: ((_state: number) => {}) as React.Dispatch<
        React.SetStateAction<number>
      >
    };

    render(<DynamicState caller={caller} />);

    const useState = collector.getReactHooks(DynamicState.name).getUseState(1);

    expect(screen.getByText(getExpectedText(0))).toBeTruthy();
    expect(useState.next()).toEqual([0]);

    act(() => {
      caller.setState(1);
    });

    expect(screen.getByText(getExpectedText(1))).toBeTruthy();
    expect(useState.next()).toEqual([1]);

    act(() => {
      caller.setState(3);
    });

    expect(screen.getByText(getExpectedText(3))).toBeTruthy();

    act(() => {
      caller.setState(8);
    });

    expect(useState.next()).toEqual([3, 8]);
    useState.reset();
    expect(useState.next()).toEqual([0, 1, 3, 8]);
  });

  test("Multiple states", () => {
    const getExpectedText = (num: number) => `Render ${num}`;
    const caller = {
      action: (_num: number) => {}
    };

    render(<MultipleStates caller={caller} />);

    const useState = collector.getReactHooks(MultipleStates.name);

    expect(useState.getAll("useState")?.length).toBe(2);

    act(() => {
      caller.action(123);
    });

    expect(screen.getByText(getExpectedText(123))).toBeTruthy();

    act(() => {
      caller.action(987);
    });

    expect(screen.getByText(getExpectedText(987))).toBeTruthy();

    expect(useState.getUseState(2).getState(1)).toBe("");
    expect(useState.getUseState(2).getState(2)).toBe(getExpectedText(123));
    expect(useState.getUseState(2).getState(3)).toBe(getExpectedText(987));
  });
});
