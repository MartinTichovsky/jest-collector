import { act, render, screen } from "@testing-library/react";
import React from "react";
import {
  OneUseEffect,
  OneUseEffectWithUnregisteredComponent,
  RegisteredRenders,
  RegisteredTemplate,
  RegisteredWithDeps,
  RegisteredWithUmount
} from "./registered/UseEffect";
import { RegisteredTemplateInner } from "./registered/UseEffect.Inner";
import {
  UnegisteredWithDeps,
  UnregisteredRenders,
  UnregisteredWithOneUseEffect,
  UnregisteredWithTwoUseEffects,
  UnregisteredWithUmount
} from "./unregistered/UseEffect";

beforeEach(() => {
  collector.reset();
});

const defaultTest = (callFunc: () => void, dataTestId?: string) => {
  expect(screen.getByText("Some content")).toBeTruthy();
  expect(
    collector.hasRegisteredComponent(OneUseEffect.name, dataTestId)
  ).toBeTruthy();
  expect(callFunc).toBeCalledTimes(1);
  expect(collector.getFunctionCallCount(OneUseEffect.name, dataTestId)).toBe(1);

  expect(
    collector.getRegisteredReactComponent(OneUseEffect.name, dataTestId)
  ).toMatchSnapshot();

  const useEffectHooks = collector.getRegisteredReactComponentHooks(
    OneUseEffect.name,
    "useEffect",
    dataTestId
  );

  expect(useEffectHooks?.getRender(1)).not.toBeUndefined();
  expect(useEffectHooks?.getRender(2)).toBeUndefined();
  expect(useEffectHooks?.getRenderHooks(1, 1)).not.toBeUndefined();
  expect(useEffectHooks?.getRenderHooks(1, 2)).toBeUndefined();
  expect(useEffectHooks?.getRenderHooks(2, 1)).toBeUndefined();
  expect(useEffectHooks?.getRenderHooks(1, 1)?.action).not.toBeUndefined();
  expect(useEffectHooks?.getRenderHooks(1, 1)?.action).toBeCalledTimes(1);
  expect(useEffectHooks?.getRenderHooks(1, 1)?.deps).toEqual([]);
  expect(useEffectHooks?.getRenderHooks(1, 1)?.unmountAction).toBeUndefined();

  expect(
    collector.getRegisteredFunction(OneUseEffect.name, dataTestId)
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

  test("Component with one useEffect and unregistered component", () => {
    const callFunc = jest.fn();

    render(<OneUseEffectWithUnregisteredComponent callFunc={callFunc} />);

    expect(screen.getByText("Unregistered component")).toBeTruthy();
    expect(
      collector.hasRegisteredComponent(
        OneUseEffectWithUnregisteredComponent.name
      )
    ).toBeTruthy();
    expect(
      collector.hasUnregisteredComponent(UnregisteredWithOneUseEffect.name)
    ).toBeTruthy();
    expect(callFunc).toBeCalledTimes(2);
    expect(
      collector.getFunctionCallCount(OneUseEffectWithUnregisteredComponent.name)
    ).toBe(1);
    expect(
      collector.getFunctionCallCount(UnregisteredWithOneUseEffect.name)
    ).toBeUndefined();

    expect(
      collector.getUnregisteredReactComponent(UnregisteredWithOneUseEffect.name)
    ).toMatchSnapshot();

    const useEffectHooks = collector.getUnregisteredReactComponentHooks(
      UnregisteredWithOneUseEffect.name,
      "useEffect"
    );

    expect(useEffectHooks?.getHook(1)).not.toBeUndefined();
    expect(useEffectHooks?.getHook(2)).toBeUndefined();
    expect(useEffectHooks?.getHook(1)?.action).not.toBeUndefined();
    expect(useEffectHooks?.getHook(1)?.action).toBeCalledTimes(1);
    expect(useEffectHooks?.getHook(1)?.deps).toEqual([]);
    expect(useEffectHooks?.getHook(1)?.unmountAction).toBeUndefined();
  });

  test("Unmount unregistered component", () => {
    const { unmount } = render(<UnregisteredWithUmount />);

    expect(screen.getByText("Unregistered with unmount")).toBeTruthy();
    expect(
      collector.hasUnregisteredComponent(UnregisteredWithUmount.name)
    ).toBeTruthy();

    expect(
      collector.getFunctionCallCount(UnregisteredWithUmount.name)
    ).toBeUndefined();

    expect(
      collector.getUnregisteredReactComponent(UnregisteredWithUmount.name)
    ).toMatchSnapshot();

    const useEffectHooks = collector.getUnregisteredReactComponentHooks(
      UnregisteredWithUmount.name,
      "useEffect"
    );

    expect(useEffectHooks?.getHook(1)).not.toBeUndefined();
    expect(useEffectHooks?.getHook(2)).toBeUndefined();
    expect(useEffectHooks?.getHook(1)?.action).not.toBeUndefined();
    expect(useEffectHooks?.getHook(1)?.action).toBeCalledTimes(1);
    expect(useEffectHooks?.getHook(1)?.deps).toEqual([]);
    expect(useEffectHooks?.getHook(1)?.unmountAction).not.toBeUndefined();
    expect(useEffectHooks?.getHook(1)?.unmountAction).not.toBeCalled();

    unmount();
    expect(useEffectHooks?.getHook(1)?.unmountAction).toBeCalledTimes(1);
  });

  test("Unmount registered component", () => {
    const { unmount } = render(<RegisteredWithUmount />);

    expect(screen.getByText("Registered with unmount")).toBeTruthy();
    expect(
      collector.hasRegisteredComponent(RegisteredWithUmount.name)
    ).toBeTruthy();

    expect(collector.getFunctionCallCount(RegisteredWithUmount.name)).toBe(1);

    expect(
      collector.getRegisteredReactComponent(RegisteredWithUmount.name)
    ).toMatchSnapshot();

    const useEffectHooks = collector.getRegisteredReactComponentHooks(
      RegisteredWithUmount.name,
      "useEffect"
    );

    expect(useEffectHooks?.getRender(1)).not.toBeUndefined();
    expect(useEffectHooks?.getRender(2)).toBeUndefined();
    expect(useEffectHooks?.getRenderHooks(1, 1)?.action).not.toBeUndefined();
    expect(useEffectHooks?.getRenderHooks(1, 1)?.action).toBeCalledTimes(1);
    expect(useEffectHooks?.getRenderHooks(1, 1)?.deps).toEqual([]);
    expect(
      useEffectHooks?.getRenderHooks(1, 1)?.unmountAction
    ).not.toBeUndefined();
    expect(
      useEffectHooks?.getRenderHooks(1, 1)?.unmountAction
    ).not.toBeCalled();

    unmount();
    expect(useEffectHooks?.getRenderHooks(1, 1)?.unmountAction).toBeCalledTimes(
      1
    );
  });

  test("Unregistered with two effect", () => {
    render(<UnregisteredWithTwoUseEffects />);

    expect(
      collector.hasUnregisteredComponent(UnregisteredWithTwoUseEffects.name)
    ).toBeTruthy();

    expect(
      collector.getUnregisteredReactComponent(
        UnregisteredWithTwoUseEffects.name
      )
    ).toMatchSnapshot();

    const useEffects = collector.getUnregisteredReactComponent(
      UnregisteredWithTwoUseEffects.name
    );

    expect(useEffects?.["useEffect"]?.length).toBe(2);
  });

  test("Deps in registered component", () => {
    const deps = [1, { property: "some" }, "Text", false];
    render(<RegisteredWithDeps deps={deps} />);

    expect(screen.getByText("Registered with deps")).toBeTruthy();
    expect(
      collector.hasRegisteredComponent(RegisteredWithDeps.name)
    ).toBeTruthy();

    expect(collector.getFunctionCallCount(RegisteredWithDeps.name)).toBe(1);

    expect(
      collector.getRegisteredReactComponent(RegisteredWithDeps.name)
    ).toMatchSnapshot();

    const useEffectHooks = collector.getRegisteredReactComponentHooks(
      RegisteredWithDeps.name,
      "useEffect"
    );

    expect(useEffectHooks?.getRender(1)).not.toBeUndefined();
    expect(useEffectHooks?.getRender(2)).toBeUndefined();
    expect(useEffectHooks?.getRenderHooks(1, 1)?.action).not.toBeUndefined();
    expect(useEffectHooks?.getRenderHooks(1, 1)?.action).toBeCalledTimes(1);
    expect(useEffectHooks?.getRenderHooks(1, 1)?.deps).toEqual(deps);
    expect(useEffectHooks?.getRenderHooks(1, 1)?.unmountAction).toBeUndefined();
  });

  test("Deps in unregistered component", () => {
    const deps = [1, { property: "some" }, "Text", false];
    render(<UnegisteredWithDeps deps={deps} />);

    expect(screen.getByText("Unegistered with deps")).toBeTruthy();
    expect(
      collector.hasRegisteredComponent(UnegisteredWithDeps.name)
    ).toBeFalsy();

    expect(
      collector.getFunctionCallCount(UnegisteredWithDeps.name)
    ).toBeUndefined();

    expect(
      collector.getRegisteredReactComponent(UnegisteredWithDeps.name)
    ).toMatchSnapshot();

    const useEffectHooks = collector.getUnregisteredReactComponentHooks(
      UnegisteredWithDeps.name,
      "useEffect"
    );

    expect(useEffectHooks?.getHook(1)).not.toBeUndefined();
    expect(useEffectHooks?.getHook(2)).toBeUndefined();
    expect(useEffectHooks?.getHook(1)?.action).not.toBeUndefined();
    expect(useEffectHooks?.getHook(1)?.action).toBeCalledTimes(1);
    expect(useEffectHooks?.getHook(1)?.deps).toEqual(deps);
    expect(useEffectHooks?.getHook(1)?.unmountAction).toBeUndefined();
  });

  test("Dynamic render - registered component", () => {
    const getExpectedText = (num: number) => `Registered renders ${num}`;
    const caller = {
      action: jest.fn(),
      setState: ((state: number) => {}) as React.Dispatch<
        React.SetStateAction<number>
      >
    };
    render(<RegisteredRenders caller={caller} />);

    const useEffectHooks = collector.getRegisteredReactComponentHooks(
      RegisteredRenders.name,
      "useEffect"
    );

    const testSuite = (num: number) => {
      if (num) {
        // manually set state
        act(() => {
          caller.setState(num);
        });
      }

      // check if render is correct and contains correct text
      expect(screen.getByText(getExpectedText(num))).toBeTruthy();
      expect(collector.getFunctionCallCount(RegisteredRenders.name)).toBe(
        num + 1
      );

      // only first action shhould be called
      expect(useEffectHooks?.getRenderHooks(1, 1)?.action).not.toBeUndefined();
      expect(useEffectHooks?.getRenderHooks(1, 1)?.action).toBeCalledTimes(1);
      expect(caller.action).toBeCalledTimes(1);

      // for each renders
      for (let i = 1; i <= num + 1; i++) {
        expect(useEffectHooks?.getRender(i)).not.toBeUndefined();

        // other actions except the first one must not be called
        if (i > 1) {
          expect(
            useEffectHooks?.getRenderHooks(i, 1)?.action
          ).not.toBeUndefined();
          expect(useEffectHooks?.getRenderHooks(i, 1)?.action).not.toBeCalled();
        }
      }

      // no more render should exist
      expect(useEffectHooks?.getRender(num + 2)).toBeUndefined();
      expect(
        useEffectHooks?.getRenderHooks(num + 2, 1)?.action
      ).toBeUndefined();
    };

    testSuite(0);
    testSuite(1);
    testSuite(2);
  });

  test("Dynamic render - unregistered component", () => {
    const getExpectedText = (num: number) => `Unregistered renders ${num}`;
    const caller = {
      action: jest.fn(),
      setState: ((state: number) => {}) as React.Dispatch<
        React.SetStateAction<number>
      >
    };

    render(<UnregisteredRenders caller={caller} />);

    const useEffectHooks = collector.getUnregisteredReactComponentHooks(
      UnregisteredRenders.name,
      "useEffect"
    );

    const testSuite = (num: number) => {
      if (num) {
        // manually set state
        act(() => {
          caller.setState(num);
        });
      }

      // check if render is correct and contains correct text
      expect(screen.getByText(getExpectedText(num))).toBeTruthy();
      expect(
        collector.getFunctionCallCount(UnregisteredRenders.name)
      ).toBeUndefined();

      // only first action shhould be called
      expect(useEffectHooks?.getHook(1)?.action).not.toBeUndefined();
      expect(useEffectHooks?.getHook(1)?.action).toBeCalledTimes(1);

      // for each calls
      for (let i = 1; i <= num + 1; i++) {
        expect(caller.action).toBeCalledTimes(1);

        // other actions except the first one must not be called
        if (i > 1) {
          expect(useEffectHooks?.getHook(i)?.action).not.toBeUndefined();
          expect(useEffectHooks?.getHook(i)?.action).not.toBeCalled();
        }
      }

      // no more effects should exist
      expect(useEffectHooks?.getHook(num + 2)).toBeUndefined();
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

    const { unmount } = render(<RegisteredTemplate caller={caller} />);

    const useEffectHooks = collector.getRegisteredReactComponentHooks(
      RegisteredTemplateInner.name,
      "useEffect"
    );

    // first render
    expect(screen.getByText(getExpectedText("", 0))).toBeTruthy();
    expect(collector.getFunctionCallCount(RegisteredTemplateInner.name)).toBe(
      1
    );
    expect(useEffectHooks?.getRenderHooks(1, 1)?.deps).toEqual([""]);
    expect(useEffectHooks?.getRenderHooks(1, 1)?.action).not.toBeUndefined();
    expect(useEffectHooks?.getRenderHooks(1, 1)?.action).toBeCalledTimes(1);
    expect(
      useEffectHooks?.getRenderHooks(1, 1)?.unmountAction
    ).not.toBeCalled();
    expect(caller.action).toBeCalledTimes(1);
    expect(caller.unmount).not.toBeCalled();
    expect(caller.action).toHaveBeenLastCalledWith("");

    // second render - changing number should re-render component but not re-call useEffect
    act(() => {
      caller.setState({ num: 1, text: "" });
    });

    expect(screen.getByText(getExpectedText("", 1))).toBeTruthy();
    expect(collector.getFunctionCallCount(RegisteredTemplateInner.name)).toBe(
      2
    );
    expect(useEffectHooks?.getRenderHooks(1, 1)?.deps).toEqual([""]);
    expect(useEffectHooks?.getRenderHooks(1, 1)?.action).not.toBeUndefined();
    expect(useEffectHooks?.getRenderHooks(1, 1)?.action).toBeCalledTimes(1);
    expect(
      useEffectHooks?.getRenderHooks(1, 1)?.unmountAction
    ).not.toBeCalled();
    expect(caller.action).toBeCalledTimes(1);
    expect(caller.unmount).not.toBeCalled();
    expect(caller.action).toHaveBeenLastCalledWith("");

    // third render - changing text should re-render component and re-call useEffect
    act(() => {
      caller.setState({ num: 1, text: "text" });
    });

    expect(screen.getByText(getExpectedText("text", 1))).toBeTruthy();
    expect(collector.getFunctionCallCount(RegisteredTemplateInner.name)).toBe(
      3
    );
    expect(useEffectHooks?.getRenderHooks(1, 1)?.deps).toEqual([""]);
    expect(useEffectHooks?.getRenderHooks(1, 1)?.action).toBeCalledTimes(1);
    expect(useEffectHooks?.getRenderHooks(2, 1)?.action).not.toBeCalled();
    expect(useEffectHooks?.getRenderHooks(3, 1)?.action).toBeCalledTimes(1);
    expect(useEffectHooks?.getRenderHooks(1, 1)?.unmountAction).toBeCalledTimes(
      1
    );
    expect(useEffectHooks?.getRenderHooks(2, 1)?.unmountAction).toBeUndefined();
    expect(
      useEffectHooks?.getRenderHooks(3, 1)?.unmountAction
    ).not.toBeCalled();
    expect(caller.action).toBeCalledTimes(2);
    expect(caller.unmount).toBeCalledTimes(1);
    expect(caller.action).toHaveBeenLastCalledWith("text");
    expect(caller.unmount).toHaveBeenLastCalledWith(0);

    // fourth render - changing number should re-render component and not re-call useEffect
    act(() => {
      caller.setState({ num: 5, text: "text" });
    });

    expect(screen.getByText(getExpectedText("text", 5))).toBeTruthy();
    expect(collector.getFunctionCallCount(RegisteredTemplateInner.name)).toBe(
      4
    );
    expect(useEffectHooks?.getRenderHooks(3, 1)?.deps).toEqual(["text"]);
    expect(useEffectHooks?.getRenderHooks(1, 1)?.action).toBeCalledTimes(1);
    expect(useEffectHooks?.getRenderHooks(2, 1)?.action).not.toBeCalled();
    expect(useEffectHooks?.getRenderHooks(3, 1)?.action).toBeCalledTimes(1);
    expect(useEffectHooks?.getRenderHooks(2, 1)?.action).not.toBeCalled();
    expect(useEffectHooks?.getRenderHooks(1, 1)?.unmountAction).toBeCalledTimes(
      1
    );
    expect(useEffectHooks?.getRenderHooks(2, 1)?.unmountAction).toBeUndefined();
    expect(
      useEffectHooks?.getRenderHooks(3, 1)?.unmountAction
    ).not.toBeCalled();
    expect(useEffectHooks?.getRenderHooks(4, 1)?.unmountAction).toBeUndefined();
    expect(caller.action).toBeCalledTimes(2);
    expect(caller.unmount).toBeCalledTimes(1);
    expect(caller.action).toHaveBeenLastCalledWith("text");
    expect(caller.unmount).toHaveBeenLastCalledWith(0);
  });
});
