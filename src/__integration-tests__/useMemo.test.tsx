import { act, render, screen } from "@testing-library/react";
import React from "react";
import {
  DynamicMemo,
  OneUseMemo,
  UseMemoWithAction
} from "./components/UseMemo";

beforeEach(() => {
  collector.reset();
});

describe("useMemo", () => {
  test("Component with one useMemo", () => {
    render(<OneUseMemo />);

    // the correct text should be in the document
    expect(screen.getByText("Memorized text")).toBeTruthy();

    // get the useRef hooks
    const useMemoHooks = collector
      .getReactHooks(OneUseMemo.name)
      .getHooksByType("useMemo");

    // the useRef should create an object with the default value
    expect(useMemoHooks.get(1)).not.toBeUndefined();
    expect(useMemoHooks.get(2)).toBeUndefined();
    expect(useMemoHooks.get(1)?.result).toEqual("text");
    expect(useMemoHooks.get(1)?.hasBeenChanged).toBeFalsy();
  });

  test("The useMemo should change when change the state", () => {
    const getExpectedText = (num1: number, num2: number) =>
      `Memo state:${num1}-${num2} memo:${num1 + 1}-${num2 + 2}`;

    // create a caller object
    const caller = {
      setState: ((_state: {
        num1: number;
        num2: number;
      }) => {}) as React.Dispatch<
        React.SetStateAction<{ num1: number; num2: number }>
      >
    };

    render(<DynamicMemo caller={caller} />);

    // the correct text should be in the document
    expect(screen.getByText(getExpectedText(0, 10))).toBeTruthy();

    // get useRef hooks
    const useMemoHooks = collector
      .getReactHooks(DynamicMemo.name)
      .getHooksByType("useMemo");

    // the useMemo should return a number from state, first memo state+1 and second memo state+2
    expect(useMemoHooks.get(1)).not.toBeUndefined();
    expect(useMemoHooks.get(2)).not.toBeUndefined();
    expect(useMemoHooks.get(3)).toBeUndefined();
    expect(useMemoHooks.get(1)?.result).toEqual(1);
    expect(useMemoHooks.get(1)?.hasBeenChanged).toBeFalsy();
    expect(useMemoHooks.get(2)?.result).toEqual(12);
    expect(useMemoHooks.get(2)?.hasBeenChanged).toBeFalsy();

    // manualy set the state
    act(() => {
      caller.setState({ num1: 0, num2: 11 });
    });

    // the correct text should be in the document
    expect(screen.getByText(getExpectedText(0, 11))).toBeTruthy();

    // only the second memo should chnge
    expect(useMemoHooks.get(1)?.result).toEqual(1);
    expect(useMemoHooks.get(1)?.hasBeenChanged).toBeFalsy();
    expect(useMemoHooks.get(2)?.result).toEqual(13);
    expect(useMemoHooks.get(2)?.hasBeenChanged).toBeTruthy();

    // manualy set the state
    act(() => {
      caller.setState({ num1: 25, num2: 11 });
    });

    // the correct text should be in the document
    expect(screen.getByText(getExpectedText(25, 11))).toBeTruthy();

    // only the first memo should chnge
    expect(useMemoHooks.get(1)?.result).toEqual(26);
    expect(useMemoHooks.get(1)?.hasBeenChanged).toBeTruthy();
    expect(useMemoHooks.get(2)?.result).toEqual(13);
    expect(useMemoHooks.get(2)?.hasBeenChanged).toBeFalsy();
  });

  test("UseMemo return a function", () => {
    const getExpectedText = (num: number) => `Memorized function ${num}`;

    // create a caller object
    const caller = {
      setState: ((_state: {
        num1: number;
        num2: number;
      }) => {}) as React.Dispatch<
        React.SetStateAction<{ num1: number; num2: number }>
      >
    };

    render(<UseMemoWithAction caller={caller} />);

    // the correct text should be in the document
    expect(screen.getByText(getExpectedText(9))).toBeTruthy();

    // get useRef hooks
    const useMemoHooks = collector
      .getReactHooks(UseMemoWithAction.name)
      .getHooksByType("useMemo");

    // the useMemo should return a function and the function should be mocked
    expect(useMemoHooks.get(1)).not.toBeUndefined();
    expect(useMemoHooks.get(2)).toBeUndefined();
    expect(useMemoHooks.get(1)?.result).toBeCalledTimes(1);
    expect(useMemoHooks.get(1)?.result).lastReturnedWith(9);
    expect(useMemoHooks.get(1)?.hasBeenChanged).toBeFalsy();

    // manualy set the state
    act(() => {
      caller.setState({ num1: 0, num2: 11 });
    });

    // the useMemo is holding the previous number, so the text should not change
    expect(screen.getByText(getExpectedText(9))).toBeTruthy();

    // the useMemo should return the same value
    expect(useMemoHooks.get(1)).not.toBeUndefined();
    expect(useMemoHooks.get(2)).toBeUndefined();
    expect(useMemoHooks.get(1)?.result).toBeCalledTimes(2);
    expect(useMemoHooks.get(1)?.result).lastReturnedWith(9);
    expect(useMemoHooks.get(1)?.hasBeenChanged).toBeFalsy();

    // manualy set the state
    act(() => {
      caller.setState({ num1: 5, num2: 15 });
    });

    // num1 has been changed so now should be in the document new number
    expect(screen.getByText(getExpectedText(15))).toBeTruthy();

    // the useMemo should return new value
    expect(useMemoHooks.get(1)).not.toBeUndefined();
    expect(useMemoHooks.get(2)).toBeUndefined();
    expect(useMemoHooks.get(1)?.result).toBeCalledTimes(3);
    expect(useMemoHooks.get(1)?.result).lastReturnedWith(15);
    expect(useMemoHooks.get(1)?.hasBeenChanged).toBeTruthy();
  });
});
