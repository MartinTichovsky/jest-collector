import { act, render, screen } from "@testing-library/react";
import React from "react";
import {
  OneUseEffect,
  Renders,
  Template,
  WithDeps,
  WithUmount
} from "./components/UseEffect";
import { TemplateInner } from "./components/UseEffect.Inner";

beforeEach(() => {
  collector.reset();
});

const defaultTest = (callFunc: () => void, dataTestId?: string) => {
  expect(screen.getByText("Some content")).toBeTruthy();
  expect(
    collector.hasComponent(OneUseEffect.name, { dataTestId })
  ).toBeTruthy();
  expect(callFunc).toBeCalledTimes(1);
  expect(collector.getCallCount(OneUseEffect.name, { dataTestId })).toBe(1);

  const hooks = collector.getReactComponentHooks(OneUseEffect.name, {
    dataTestId
  });

  expect(hooks).not.toBeUndefined();
  expect(hooks?.getAll()).toMatchSnapshot();
  expect(hooks?.getHook("useEffect", 1)).not.toBeUndefined();
  expect(hooks?.getHook("useEffect", 2)).toBeUndefined();
  expect(hooks?.getHook("useEffect", 1)?.action).toBeCalledTimes(1);
  expect(hooks?.getHook("useEffect", 1)?.deps).toEqual([]);
  expect(hooks?.getHook("useEffect", 1)?.unmountAction).toBeUndefined();

  expect(
    collector.getComponent(OneUseEffect.name, { dataTestId })
  ).toMatchSnapshot();
};

describe("useEffect", () => {
  test("Default - Component with one useEffect", () => {
    const callFunc = jest.fn();

    render(<OneUseEffect callFunc={callFunc} />);

    defaultTest(callFunc);
  });

  test("Default with test id - Component with one useEffect", () => {
    const callFunc = jest.fn();
    const dataTestId = "test-id";

    render(<OneUseEffect callFunc={callFunc} data-testid={dataTestId} />);

    defaultTest(callFunc, dataTestId);
  });

  test("Unmount registered component", () => {
    const { unmount } = render(<WithUmount />);

    expect(screen.getByText("Registered with unmount")).toBeTruthy();
    expect(collector.hasComponent(WithUmount.name)).toBeTruthy();
    expect(collector.getCallCount(WithUmount.name)).toBe(1);
    expect(collector.getComponent(WithUmount.name)).toMatchSnapshot();

    const useEffectHooks = collector
      .getReactComponentHooks(WithUmount.name)
      .getHooksByType("useEffect");

    expect(useEffectHooks?.get(1)).not.toBeUndefined();
    expect(useEffectHooks?.get(2)).toBeUndefined();
    expect(useEffectHooks?.get(1)?.action).toBeCalledTimes(1);
    expect(useEffectHooks?.get(1)?.deps).toEqual([]);
    expect(useEffectHooks?.get(1)?.unmountAction).not.toBeCalled();

    unmount();
    expect(useEffectHooks?.get(1)?.unmountAction).toBeCalledTimes(1);
  });

  test("Deps in the component", () => {
    const deps = [1, { property: "some" }, "Text", false];

    render(<WithDeps deps={deps} />);

    expect(screen.getByText("Registered with deps")).toBeTruthy();
    expect(collector.hasComponent(WithDeps.name)).toBeTruthy();
    expect(collector.getCallCount(WithDeps.name)).toBe(1);
    expect(collector.getComponent(WithDeps.name)).toMatchSnapshot();

    const useEffectHooks = collector
      .getReactComponentHooks(WithDeps.name)
      .getHooksByType("useEffect");

    expect(useEffectHooks.get(1)).not.toBeUndefined();
    expect(useEffectHooks.get(2)).toBeUndefined();
    expect(useEffectHooks.get(1)?.action).toBeCalledTimes(1);
    expect(useEffectHooks.get(1)?.deps).toEqual(deps);
    expect(useEffectHooks.get(1)?.unmountAction).toBeUndefined();
  });

  test("Dynamic render", () => {
    const getExpectedText = (num: number) => `Registered renders ${num}`;
    const caller = {
      action: jest.fn(),
      setState: ((_state: number) => {}) as React.Dispatch<
        React.SetStateAction<number>
      >
    };

    render(<Renders caller={caller} />);

    const useEffectHooks = collector
      .getReactComponentHooks(Renders.name)
      .getHooksByType("useEffect");

    const testSuite = (num: number) => {
      if (num) {
        // manually set state
        act(() => {
          caller.setState(num);
        });
      }

      // check if render is correct and contains correct text
      expect(screen.getByText(getExpectedText(num))).toBeTruthy();
      expect(collector.getCallCount(Renders.name)).toBe(num + 1);

      // only first action shhould be called
      expect(useEffectHooks.get(1)?.action).toBeCalledTimes(1);
      expect(caller.action).toBeCalledTimes(1);

      // no more hooks should exist
      for (let i = 1; i <= num; i++) {
        expect(useEffectHooks.get(i + 1)).toBeUndefined();
        expect(useEffectHooks.get(i + 1)?.action).toBeUndefined();
      }
    };

    testSuite(0);
    testSuite(1);
    testSuite(2);
  });

  test("Parent render test", () => {
    const getExpectedText = (text: string, num: number) =>
      `Registered template inner ${text}${num}`;
    const caller = {
      action: jest.fn(),
      setState: ((state) => {}) as React.Dispatch<
        React.SetStateAction<{ num: number; text: string }>
      >,
      unmount: jest.fn()
    };

    const { unmount } = render(<Template caller={caller} />);

    const useEffectHooks = collector
      .getReactComponentHooks(TemplateInner.name)
      .getHooksByType("useEffect");

    // first render
    expect(screen.getByText(getExpectedText("", 0))).toBeTruthy();
    expect(collector.getCallCount(TemplateInner.name)).toBe(1);
    expect(useEffectHooks.get(1)?.deps).toEqual([""]);
    expect(useEffectHooks.get(1)?.action).toBeCalledTimes(1);
    expect(useEffectHooks?.get(1)?.unmountAction).not.toBeCalled();
    expect(caller.action).toBeCalledTimes(1);
    expect(caller.unmount).not.toBeCalled();
    expect(caller.action).toHaveBeenLastCalledWith("");

    // second render - changing number should re-render component but not re-call useEffect
    act(() => {
      caller.setState({ num: 1, text: "" });
    });

    expect(screen.getByText(getExpectedText("", 1))).toBeTruthy();
    expect(collector.getCallCount(TemplateInner.name)).toBe(2);
    expect(useEffectHooks.get(1)?.deps).toEqual([""]);
    expect(useEffectHooks.get(1)?.action).toBeCalledTimes(1);
    expect(useEffectHooks.get(1)?.unmountAction).not.toBeCalled();
    expect(caller.action).toBeCalledTimes(1);
    expect(caller.unmount).not.toBeCalled();
    expect(caller.action).toHaveBeenLastCalledWith("");

    // third render - changing text should re-render component and re-call useEffect
    act(() => {
      caller.setState({ num: 1, text: "text" });
    });

    expect(screen.getByText(getExpectedText("text", 1))).toBeTruthy();
    expect(collector.getCallCount(TemplateInner.name)).toBe(3);
    expect(useEffectHooks.get(1)?.deps).toEqual(["text"]);
    expect(useEffectHooks.get(1)?.action).toBeCalledTimes(2);
    expect(useEffectHooks.get(1)?.unmountAction).toBeCalledTimes(1);
    expect(caller.action).toBeCalledTimes(2);
    expect(caller.unmount).toBeCalledTimes(1);
    expect(caller.action).toHaveBeenLastCalledWith("text");
    expect(caller.unmount).toHaveBeenLastCalledWith(0);

    // fourth render - changing number should re-render component and not re-call useEffect
    act(() => {
      caller.setState({ num: 5, text: "text" });
    });

    expect(screen.getByText(getExpectedText("text", 5))).toBeTruthy();
    expect(collector.getCallCount(Template.name)).toBe(4);
    expect(useEffectHooks.get(1)?.deps).toEqual(["text"]);
    expect(useEffectHooks.get(1)?.action).toBeCalledTimes(2);
    expect(useEffectHooks.get(1)?.unmountAction).toBeCalledTimes(1);
    expect(caller.action).toBeCalledTimes(2);
    expect(caller.unmount).toBeCalledTimes(1);
    expect(caller.action).toHaveBeenLastCalledWith("text");
    expect(caller.unmount).toHaveBeenLastCalledWith(0);
  });
});
