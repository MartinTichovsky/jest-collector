import { act, render, screen } from "@testing-library/react";
import React from "react";
import { DynamicRef, OneUseRef } from "./components/UseRef";

beforeEach(() => {
  collector.reset();
});

describe("useRef", () => {
  test("Component with one useRef", () => {
    render(<OneUseRef />);

    // get the useRef hooks
    const useRefHooks = collector
      .getReactHooks(OneUseRef.name)
      .getHooksByType("useRef");

    // the useRef should create an object with the default value
    expect(useRefHooks.get(1)).not.toBeUndefined();
    expect(useRefHooks.get(2)).toBeUndefined();
    expect(useRefHooks.get(1)?.args).toEqual("text");
    expect(useRefHooks.get(1)?.ref.current).toEqual("text");
    expect(useRefHooks.get(1)?.hasBeenChanged).toBeFalsy();
  });

  test("The useRef should hold the same value", () => {
    const getExpectedText = (num1: number, num2: number) =>
      `Ref ${num1} - ${num2} - something`;

    // create a caller object
    const caller = {
      setState: ((_state: number) => {}) as React.Dispatch<
        React.SetStateAction<number>
      >
    };

    render(<DynamicRef caller={caller} />);

    // the correct text should be in the document
    expect(screen.getByText(getExpectedText(0, 0))).toBeTruthy();

    // get useRef hooks
    const useRefHooks = collector
      .getReactHooks(DynamicRef.name)
      .getHooksByType("useRef");

    // the useRefs should create an object with default value
    expect(useRefHooks.get(1)).not.toBeUndefined();
    expect(useRefHooks.get(2)).not.toBeUndefined();
    expect(useRefHooks.get(3)).toBeUndefined();
    expect(useRefHooks.get(1)?.args).toEqual("something");
    expect(useRefHooks.get(1)?.ref.current).toEqual("something");
    expect(useRefHooks.get(1)?.hasBeenChanged).toBeFalsy();
    expect(useRefHooks.get(2)?.args).toEqual(0);
    expect(useRefHooks.get(2)?.ref.current).toEqual(0);
    expect(useRefHooks.get(2)?.hasBeenChanged).toBeFalsy();

    // manualy set state
    act(() => {
      caller.setState(7);
    });

    // the correct text should be in the document
    expect(screen.getByText(getExpectedText(7, 0))).toBeTruthy();

    // the useRefs should return not changed objects
    expect(useRefHooks.get(1)?.args).toEqual("something");
    expect(useRefHooks.get(1)?.ref.current).toEqual("something");
    expect(useRefHooks.get(1)?.hasBeenChanged).toBeFalsy();
    expect(useRefHooks.get(2)?.args).toEqual(7);
    expect(useRefHooks.get(2)?.ref.current).toEqual(0);
    expect(useRefHooks.get(2)?.hasBeenChanged).toBeFalsy();
  });
});
