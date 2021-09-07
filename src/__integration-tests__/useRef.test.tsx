import { act, render, screen } from "@testing-library/react";
import React from "react";
import { DynamicRef, OneUseRef } from "./components/UseRef";

beforeEach(() => {
  collector.reset();
});

describe("useRef", () => {
  test("Component with one useRef", () => {
    render(<OneUseRef />);

    const useRefHooks = collector
      .getReactComponentHooks(OneUseRef.name)
      .getHooksByType("useRef");

    expect(useRefHooks.get(1)).not.toBeUndefined();
    expect(useRefHooks.get(2)).toBeUndefined();
    expect(useRefHooks.get(1)?.args).toEqual("text");
    expect(useRefHooks.get(1)?.ref.current).toEqual("text");
    expect(useRefHooks.get(1)?.hasBeenChanged).toBeFalsy();
  });

  test("Dynamic render", () => {
    const getExpectedText = (num1: number, num2: number) =>
      `Ref ${num1} - ${num2} - something`;
    const caller = {
      setState: ((_state: number) => {}) as React.Dispatch<
        React.SetStateAction<number>
      >
    };

    render(<DynamicRef caller={caller} />);

    expect(screen.getByText(getExpectedText(0, 0))).toBeTruthy();

    const useRefHooks = collector
      .getReactComponentHooks(DynamicRef.name)
      .getHooksByType("useRef");

    expect(useRefHooks.get(1)).not.toBeUndefined();
    expect(useRefHooks.get(2)).not.toBeUndefined();
    expect(useRefHooks.get(3)).toBeUndefined();
    expect(useRefHooks.get(1)?.args).toEqual("something");
    expect(useRefHooks.get(1)?.ref.current).toEqual("something");
    expect(useRefHooks.get(1)?.hasBeenChanged).toBeFalsy();
    expect(useRefHooks.get(2)?.args).toEqual(0);
    expect(useRefHooks.get(2)?.ref.current).toEqual(0);
    expect(useRefHooks.get(2)?.hasBeenChanged).toBeFalsy();

    act(() => {
      caller.setState(7);
    });

    expect(screen.getByText(getExpectedText(7, 0))).toBeTruthy();

    expect(useRefHooks.get(1)?.args).toEqual("something");
    expect(useRefHooks.get(1)?.ref.current).toEqual("something");
    expect(useRefHooks.get(1)?.hasBeenChanged).toBeFalsy();
    expect(useRefHooks.get(2)?.args).toEqual(7);
    expect(useRefHooks.get(2)?.ref.current).toEqual(0);
    expect(useRefHooks.get(2)?.hasBeenChanged).toBeFalsy();
  });
});
