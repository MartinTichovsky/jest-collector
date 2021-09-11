import { act, render, screen } from "@testing-library/react";
import React from "react";
import {
  MultipleUseEffects,
  OneUseEffect,
  Renders,
  Template,
  WithDeps,
  WithUmount
} from "./components/UseEffect";
import {
  MultipleUseEffectsInner,
  TemplateInner
} from "./components/UseEffect.Inner";
import { removeStatsFromCalls } from "./utils";

beforeEach(() => {
  collector.reset();
});

const defaultTestSuite = (callFunc: () => void, dataTestId?: string) => {
  // the text should be in the document
  expect(screen.getByText("Some content")).toBeTruthy();

  // the component should be registered
  expect(
    collector.hasComponent(OneUseEffect.name, { dataTestId })
  ).toBeTruthy();

  // the component should be called once
  expect(callFunc).toBeCalledTimes(1);
  expect(collector.getCallCount(OneUseEffect.name, { dataTestId })).toBe(1);

  // get all hooks
  const hooks = collector.getReactHooks(OneUseEffect.name, {
    dataTestId
  });

  // one hook should exist with the action that should be called once
  expect(hooks).not.toBeUndefined();
  expect(hooks?.getAll()).toMatchSnapshot();
  expect(hooks?.getHook("useEffect", 1)).not.toBeUndefined();
  expect(hooks?.getHook("useEffect", 2)).toBeUndefined();
  expect(hooks?.getHook("useEffect", 1)?.action).toBeCalledTimes(1);
  expect(hooks?.getHook("useEffect", 1)?.deps).toEqual([]);
  expect(hooks?.getHook("useEffect", 1)?.unmount).toBeUndefined();

  // check the component data
  expect(
    removeStatsFromCalls(
      collector.getComponentData(OneUseEffect.name, { dataTestId })
    )
  ).toMatchSnapshot();
};

describe("useEffect", () => {
  test("Default - Component with one useEffect", () => {
    const callFunc = jest.fn();

    render(<OneUseEffect callFunc={callFunc} />);

    defaultTestSuite(callFunc);
  });

  test("Default with test id - Component with one useEffect", () => {
    const callFunc = jest.fn();
    const dataTestId = "test-id";

    render(<OneUseEffect callFunc={callFunc} data-testid={dataTestId} />);

    defaultTestSuite(callFunc, dataTestId);
  });

  test("Deps in the component", () => {
    const deps = [1, { property: "some" }, "Text", false];

    render(<WithDeps deps={deps} />);

    // the correct text should be in the document
    expect(screen.getByText("Registered with deps")).toBeTruthy();
    // the component should be registered
    expect(collector.hasComponent(WithDeps.name)).toBeTruthy();
    expect(collector.getCallCount(WithDeps.name)).toBe(1);
    // the component data must mutch the snapshot
    expect(
      removeStatsFromCalls(collector.getComponentData(WithDeps.name))
    ).toMatchSnapshot();

    // get the useEffect hooks
    const useEffectHooks = collector
      .getReactHooks(WithDeps.name)
      .getHooksByType("useEffect");

    // deps must mutch the passed value
    expect(useEffectHooks.get(1)).not.toBeUndefined();
    expect(useEffectHooks.get(2)).toBeUndefined();
    expect(useEffectHooks.get(1)?.action).toBeCalledTimes(1);
    expect(useEffectHooks.get(1)?.deps).toEqual(deps);
    expect(useEffectHooks.get(1)?.unmount).toBeUndefined();
  });

  test("Dynamic render", () => {
    const getExpectedText = (num: number) => `Registered renders ${num}`;
    // reate a caller object
    const caller = {
      action: jest.fn(),
      setState: ((_state: number) => {}) as React.Dispatch<
        React.SetStateAction<number>
      >
    };

    render(<Renders caller={caller} />);

    // get useEffect hooks
    const useEffectHooks = collector
      .getReactHooks(Renders.name)
      .getHooksByType("useEffect");

    // check if the render is correct and contains correct text
    expect(screen.getByText(getExpectedText(0))).toBeTruthy();
    // the component should be called once
    expect(collector.getCallCount(Renders.name)).toBe(1);
    // the action should be called once
    expect(useEffectHooks.get(1)?.action).toBeCalledTimes(1);
    expect(caller.action).toBeCalledTimes(1);
    // no more actions should be defined
    expect(useEffectHooks.get(2)).toBeUndefined();

    // manually set the state
    act(() => {
      caller.setState(1);
    });

    // check if render is correct and contains correct text
    expect(screen.getByText(getExpectedText(1))).toBeTruthy();
    // the component should be called twice
    expect(collector.getCallCount(Renders.name)).toBe(2);
    // the action should be called once
    expect(useEffectHooks.get(1)?.action).toBeCalledTimes(1);
    expect(caller.action).toBeCalledTimes(1);
    // no more actions should be defined
    expect(useEffectHooks.get(2)).toBeUndefined();

    // manually set the state
    act(() => {
      caller.setState(2);
    });

    // check if render is correct and contains correct text
    expect(screen.getByText(getExpectedText(2))).toBeTruthy();
    // the component should be called three times
    expect(collector.getCallCount(Renders.name)).toBe(3);
    // the action should be called once
    expect(useEffectHooks.get(1)?.action).toBeCalledTimes(1);
    expect(caller.action).toBeCalledTimes(1);
    // no more actions should be defined
    expect(useEffectHooks.get(2)).toBeUndefined();
  });

  test("Multiple useEffects", () => {
    const getExpectedText = (num: number) => `More effects ${num}`;

    const callFunc11 = jest.fn();
    const callFunc12 = jest.fn();
    const callFunc13 = jest.fn();
    const callFunc21 = jest.fn();
    const callFunc22 = jest.fn();
    const callFunc23 = jest.fn();

    // crate the caller to be able to set the state in the parent and the inner component
    const caller = {
      setStateInner: ((_state: number) => {}) as React.Dispatch<
        React.SetStateAction<number>
      >,
      setStateParent: ((_state: boolean | undefined) => {}) as React.Dispatch<
        React.SetStateAction<boolean | undefined>
      >
    };

    render(
      <MultipleUseEffects
        caller={caller}
        callFunc1={callFunc11}
        callFunc2={callFunc12}
        callFunc3={callFunc13}
        secondEffect={true}
      />
    );

    // get useEffect hooks
    const useEffectHooks = collector
      .getReactHooks(MultipleUseEffectsInner.name)
      .getHooksByType("useEffect");

    // the correct text must be in the document
    expect(screen.getByText(getExpectedText(0))).toBeTruthy();
    // the parent component should be called once
    expect(collector.getCallCount(MultipleUseEffects.name)).toBe(1);
    // the inner component should be called once
    expect(collector.getCallCount(MultipleUseEffectsInner.name)).toBe(1);
    // the inner component should have three useEffect hooks
    expect(
      collector.getReactHooks(MultipleUseEffectsInner.name).getAll("useEffect")
        ?.length
    ).toBe(3);
    // check the actions, each must be called once
    expect(callFunc11).toBeCalledTimes(1);
    expect(callFunc12).toBeCalledTimes(1);
    expect(callFunc13).toBeCalledTimes(1);
    expect(useEffectHooks.get(1)?.action).toBeCalledTimes(1);
    expect(useEffectHooks.get(2)?.action).toBeCalledTimes(1);
    expect(useEffectHooks.get(3)?.action).toBeCalledTimes(1);
    expect(useEffectHooks.get(4)).toBeUndefined();

    // manually set the state of the inner component - second render
    act(() => {
      caller.setStateInner(1);
    });

    // the correct text must be in the document
    expect(screen.getByText(getExpectedText(1))).toBeTruthy();
    // the parent component should be called once
    expect(collector.getCallCount(MultipleUseEffects.name)).toBe(1);
    // the inner component should be called twice
    expect(collector.getCallCount(MultipleUseEffectsInner.name)).toBe(2);
    // the inner component should have three useEffect hooks
    expect(
      collector.getReactHooks(MultipleUseEffectsInner.name).getAll("useEffect")
        ?.length
    ).toBe(3);
    // check the actions, each must be called once
    expect(callFunc11).toBeCalledTimes(1);
    expect(callFunc12).toBeCalledTimes(1);
    expect(callFunc13).toBeCalledTimes(1);
    expect(useEffectHooks.get(1)?.action).toBeCalledTimes(1);
    expect(useEffectHooks.get(2)?.action).toBeCalledTimes(1);
    expect(useEffectHooks.get(3)?.action).toBeCalledTimes(1);
    expect(useEffectHooks.get(4)).toBeUndefined();

    // manually set the state of the inner component - third render
    act(() => {
      caller.setStateInner(1);
    });

    // the correct text must be in the document
    expect(screen.getByText(getExpectedText(1))).toBeTruthy();
    // the parent component should be called once
    expect(collector.getCallCount(MultipleUseEffects.name)).toBe(1);
    // the inner component should be called three times
    expect(collector.getCallCount(MultipleUseEffectsInner.name)).toBe(3);
    // the inner component should have three useEffect hooks
    expect(
      collector.getReactHooks(MultipleUseEffectsInner.name).getAll("useEffect")
        ?.length
    ).toBe(3);
    // check the actions, each must be called once
    expect(callFunc11).toBeCalledTimes(1);
    expect(callFunc12).toBeCalledTimes(1);
    expect(callFunc13).toBeCalledTimes(1);
    expect(useEffectHooks.get(1)?.action).toBeCalledTimes(1);
    expect(useEffectHooks.get(2)?.action).toBeCalledTimes(1);
    expect(useEffectHooks.get(3)?.action).toBeCalledTimes(1);
    expect(useEffectHooks.get(4)).toBeUndefined();

    // call the parent component and force to rerender all
    act(() => {
      caller.setStateParent(false);
    });

    // the correct text must be in the document
    expect(screen.getByText(getExpectedText(1))).toBeTruthy();
    // the parent component should be called once
    expect(collector.getCallCount(MultipleUseEffects.name)).toBe(2);
    // the inner component should be called four times
    expect(collector.getCallCount(MultipleUseEffectsInner.name)).toBe(4);
    // the inner component should have three useEffect hooks
    expect(
      collector.getReactHooks(MultipleUseEffectsInner.name).getAll("useEffect")
        ?.length
    ).toBe(3);
    // check the actions, each must be called once
    expect(callFunc11).toBeCalledTimes(1);
    expect(callFunc12).toBeCalledTimes(1);
    expect(callFunc13).toBeCalledTimes(1);
    expect(useEffectHooks.get(1)?.action).toBeCalledTimes(1);
    expect(useEffectHooks.get(2)?.action).toBeCalledTimes(1);
    expect(useEffectHooks.get(3)?.action).toBeCalledTimes(1);
    expect(useEffectHooks.get(4)).toBeUndefined();

    // render the component again an force the component to register only two useEffect hooks
    render(
      <MultipleUseEffects
        caller={caller}
        callFunc1={callFunc11}
        callFunc2={callFunc12}
        callFunc3={callFunc13}
        secondEffect={false}
      />
    );

    // the correct text must be in the document
    expect(screen.getByText(getExpectedText(0))).toBeTruthy();
    // the parent component should be called once
    expect(collector.getCallCount(MultipleUseEffects.name)).toBe(3);
    // the inner component should be called four times
    expect(collector.getCallCount(MultipleUseEffectsInner.name)).toBe(5);
    // the inner component should have two useEffect hooks
    expect(
      collector.getReactHooks(MultipleUseEffectsInner.name).getAll("useEffect")
        ?.length
    ).toBe(2);
    // check the actions, except for the second function others must be called twice
    expect(callFunc11).toBeCalledTimes(2);
    expect(callFunc12).toBeCalledTimes(1);
    expect(callFunc13).toBeCalledTimes(2);
    // the useEffects changed the order, because the second useEffect was not created
    expect(useEffectHooks.get(1)?.action).toBeCalledTimes(2);
    expect(useEffectHooks.get(2)?.action).toBeCalledTimes(2);
    expect(useEffectHooks.get(3)).toBeUndefined();

    /*
      render directly the inner component, it should register less effects
      and create the inner component with parent=null because it is no
      longer rendered under the MultipleUseEffects component
    */
    render(
      <MultipleUseEffectsInner
        caller={caller}
        callFunc1={callFunc21}
        callFunc2={callFunc22}
        callFunc3={callFunc23}
        secondEffect={false}
      />
    );

    // get the useEffect hooks for the specific component with parent=null
    const useEffectHooksForSecondRender = collector
      .getReactHooks(MultipleUseEffectsInner.name, { parent: null })
      .getHooksByType("useEffect");

    // there must be two MultipleUseEffectsInner components registered in the collector
    expect(collector.getAllDataFor(MultipleUseEffectsInner.name).length).toBe(
      2
    );

    // the component should be rendered once
    expect(
      collector.getCallCount(MultipleUseEffectsInner.name, { parent: null })
    ).toBe(1);
    // it should have two useEffects
    expect(
      collector
        .getReactHooks(MultipleUseEffectsInner.name, { parent: null })
        .getAll("useEffect")?.length
    ).toBe(2);
    // the functions passed in the first wave of test must still have the same call count
    expect(callFunc11).toBeCalledTimes(2);
    expect(callFunc12).toBeCalledTimes(1);
    expect(callFunc13).toBeCalledTimes(2);
    // the functions passed to the inner component should be called once
    expect(callFunc21).toBeCalledTimes(1);
    expect(callFunc22).not.toBeCalled();
    expect(callFunc23).toBeCalledTimes(1);
    // there are two effects only, because the second one is skipped
    expect(useEffectHooksForSecondRender.get(1)?.action).toBeCalledTimes(1);
    expect(useEffectHooksForSecondRender.get(2)?.action).toBeCalledTimes(1);
    expect(useEffectHooksForSecondRender.get(3)).toBeUndefined();

    // one more render of the inner component, this time with the second useEffect to be called
    render(
      <MultipleUseEffectsInner
        caller={caller}
        callFunc1={callFunc21}
        callFunc2={callFunc22}
        callFunc3={callFunc23}
        secondEffect={true}
      />
    );

    // there must be two MultipleUseEffectsInner components registered in the collector
    expect(collector.getAllDataFor(MultipleUseEffectsInner.name).length).toBe(
      2
    );
    // the component should be rendered twice
    expect(
      collector.getCallCount(MultipleUseEffectsInner.name, { parent: null })
    ).toBe(2);
    // it should have three useEffects
    expect(
      collector
        .getReactHooks(MultipleUseEffectsInner.name, { parent: null })
        .getAll("useEffect")?.length
    ).toBe(3);

    // the functions passed in the first wave of test must still have the same call count
    expect(callFunc11).toBeCalledTimes(2);
    expect(callFunc12).toBeCalledTimes(1);
    expect(callFunc13).toBeCalledTimes(2);
    // the functions passed to the inner component should be called twice except for the second useEffect
    expect(callFunc21).toBeCalledTimes(2);
    expect(callFunc22).toBeCalledTimes(1);
    expect(callFunc23).toBeCalledTimes(2);
    /*
      now the second useEffect from the previous render becomes the third one 
      because the second useEffect is now registered
    */
    expect(useEffectHooksForSecondRender.get(1)?.action).toBeCalledTimes(2);
    expect(useEffectHooksForSecondRender.get(2)?.action).toBeCalledTimes(1);
    expect(useEffectHooksForSecondRender.get(3)?.action).toBeCalledTimes(2);
    expect(useEffectHooksForSecondRender.get(4)).toBeUndefined();
  });

  test("Parent render test", () => {
    const getExpectedText = (text: string, num: number) =>
      `Registered template inner ${text}${num}`;
    // set a caller object
    const caller = {
      action: jest.fn(),
      templateSetState: ((_state) => {}) as React.Dispatch<
        React.SetStateAction<{ num: number; text: string }>
      >,
      unmount: jest.fn()
    };

    const { unmount } = render(<Template caller={caller} />);

    // get the useEffect hooks
    const useEffectHooks = collector
      .getReactHooks(TemplateInner.name)
      .getHooksByType("useEffect");

    // check on the first render
    // the correct text should be in the document
    expect(screen.getByText(getExpectedText("", 0))).toBeTruthy();
    // the component should be called once
    expect(collector.getCallCount(TemplateInner.name)).toBe(1);
    // the component should contain the correct data
    expect(useEffectHooks.get(1)?.deps).toEqual([""]);
    expect(useEffectHooks.get(1)?.action).toBeCalledTimes(1);
    expect(useEffectHooks?.get(1)?.unmount).not.toBeCalled();
    // check the actions
    expect(caller.action).toBeCalledTimes(1);
    expect(caller.unmount).not.toBeCalled();
    expect(caller.action).toHaveBeenLastCalledWith("");

    // second render - changing number should re-render component but not re-call useEffect
    act(() => {
      caller.templateSetState({ num: 1, text: "" });
    });

    // check on the second render
    // the correct text should be in the document
    expect(screen.getByText(getExpectedText("", 1))).toBeTruthy();
    // the component should be called twice
    expect(collector.getCallCount(TemplateInner.name)).toBe(2);
    // the component should contain the correct data
    expect(useEffectHooks.get(1)?.deps).toEqual([""]);
    expect(useEffectHooks.get(1)?.action).toBeCalledTimes(1);
    expect(useEffectHooks.get(1)?.unmount).not.toBeCalled();
    // check the actions
    expect(caller.action).toBeCalledTimes(1);
    expect(caller.unmount).not.toBeCalled();
    expect(caller.action).toHaveBeenLastCalledWith("");

    // third render - changing text should re-render component and re-call useEffect
    act(() => {
      caller.templateSetState({ num: 1, text: "text" });
    });

    // check on the second render
    // the correct text should be in the document
    expect(screen.getByText(getExpectedText("text", 1))).toBeTruthy();
    // the component should be three times
    expect(collector.getCallCount(TemplateInner.name)).toBe(3);
    // the component should contain the correct data
    expect(useEffectHooks.get(1)?.deps).toEqual(["text"]);
    expect(useEffectHooks.get(1)?.action).toBeCalledTimes(2);
    expect(useEffectHooks.get(1)?.unmount).toBeCalledTimes(1);
    // check the actions
    expect(caller.action).toBeCalledTimes(2);
    expect(caller.unmount).toBeCalledTimes(1);
    expect(caller.action).toHaveBeenLastCalledWith("text");
    expect(caller.unmount).toHaveBeenLastCalledWith(0);

    // fourth render - changing number should re-render component and not re-call useEffect
    act(() => {
      caller.templateSetState({ num: 5, text: "text" });
    });

    // check on the fourth render
    // the correct text should be in the document
    expect(screen.getByText(getExpectedText("text", 5))).toBeTruthy();
    // the component should be four times
    expect(collector.getCallCount(Template.name)).toBe(4);
    // the component should contain the correct data
    expect(useEffectHooks.get(1)?.deps).toEqual(["text"]);
    expect(useEffectHooks.get(1)?.action).toBeCalledTimes(2);
    expect(useEffectHooks.get(1)?.unmount).toBeCalledTimes(1);
    // check the actions
    expect(caller.action).toBeCalledTimes(2);
    expect(caller.unmount).toBeCalledTimes(1);
    expect(caller.action).toHaveBeenLastCalledWith("text");
    expect(caller.unmount).toHaveBeenLastCalledWith(0);

    unmount();

    // check on the unmount
    // the text should not be in the document
    expect(() => screen.getByText(getExpectedText("text", 5))).toThrowError();
    // the component should be four times
    expect(collector.getCallCount(Template.name)).toBe(4);
    // the component should contain the correct data and the unmount should be called twice
    expect(useEffectHooks.get(1)?.deps).toEqual(["text"]);
    expect(useEffectHooks.get(1)?.action).toBeCalledTimes(2);
    expect(useEffectHooks.get(1)?.unmount).toBeCalledTimes(2);
    // check the actions
    expect(caller.action).toBeCalledTimes(2);
    expect(caller.unmount).toBeCalledTimes(2);
    expect(caller.action).toHaveBeenLastCalledWith("text");
    expect(caller.unmount).toHaveBeenLastCalledWith(1);

    // reset only one specific data
    collector.reset(Template.name);

    // check if the data for TemplateInner component are still available
    expect(collector.getCallCount(Template.name)).toBeUndefined();
    expect(collector.getCallCount(TemplateInner.name)).toBe(4);
    expect(collector.getComponentData(TemplateInner.name)).not.toBeUndefined();
  });

  test("Unmount registered component", () => {
    const { unmount } = render(<WithUmount />);

    // the correct text should be in the document
    expect(screen.getByText("Registered with unmount")).toBeTruthy();
    // the component should be registered
    expect(collector.hasComponent(WithUmount.name)).toBeTruthy();
    expect(collector.getCallCount(WithUmount.name)).toBe(1);
    // the component data must mutch the snapshot
    expect(
      removeStatsFromCalls(collector.getComponentData(WithUmount.name))
    ).toMatchSnapshot();

    // get useEffect hooks
    const useEffectHooks = collector
      .getReactHooks(WithUmount.name)
      .getHooksByType("useEffect");

    // the unmount action should not be called
    expect(useEffectHooks?.get(1)).not.toBeUndefined();
    expect(useEffectHooks?.get(2)).toBeUndefined();
    expect(useEffectHooks?.get(1)?.action).toBeCalledTimes(1);
    expect(useEffectHooks?.get(1)?.deps).toEqual([]);
    expect(useEffectHooks?.get(1)?.unmount).not.toBeCalled();

    unmount();

    // the unmount action should be called
    expect(useEffectHooks?.get(1)?.unmount).toBeCalledTimes(1);
  });
});
