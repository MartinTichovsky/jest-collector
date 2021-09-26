import "@testing-library/jest-dom";
import { act, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import {
  ComponentWithChildren,
  ComponentWithChildrenFunction,
  SimpleComponent
} from "./components/common";
import {
  DynamicState,
  MultipeCalls,
  MultipleStates,
  OneUseState,
  OneUseStateWithChildren
} from "./components/UseState";

beforeEach(() => {
  collector.reset();
});

describe("UseState", () => {
  test("Component with one useState", () => {
    render(<OneUseState />);

    // get all hooks
    const useState = collector.getReactHooks(OneUseState.name);
    // get useState hooks
    const useStateHooks = useState?.getHooksByType("useState");

    // useState hook should exist
    expect(useStateHooks?.get(1)).not.toBeUndefined();
    expect(useStateHooks?.get(2)).toBeUndefined();
    expect(useStateHooks?.get(1)?.initialState).toEqual(0);
    expect(useStateHooks?.get(1)?.setState).not.toBeCalled();
    expect(useStateHooks?.get(1)?.state).toEqual([0]);

    // testing the state results
    expect(useState?.getUseState(1).getState(1)).toEqual(0);
    expect(useState?.getUseState(2).getState(1)).toBeUndefined();
    expect(useState?.getUseState(1).getState(2)).toBeUndefined();
  });

  test("Disabled button should work", () => {
    let setComponentState: React.Dispatch<React.SetStateAction<boolean>>;

    const Button = ({ children, ...rest }: React.PropsWithChildren<{}>) => {
      return (
        <button data-testid={testId} {...rest}>
          {children}
        </button>
      );
    };

    const Component = ({
      Button
    }: {
      Button: React.ComponentType<
        React.ButtonHTMLAttributes<HTMLButtonElement>
      >;
    }) => {
      const [state, setState] = React.useState(false);
      setComponentState = setState;

      const ButtonElement = React.useCallback(
        ({ disabled }: { disabled: boolean }) => {
          return <Button disabled={disabled}>Button</Button>;
        },
        []
      );

      return <ButtonElement disabled={state} />;
    };

    const testId = "test-id";

    render(<Component Button={Button} />);

    const button = screen.getByTestId(testId);

    expect(button).toBeTruthy();
    expect(button).not.toBeDisabled();

    act(() => {
      setComponentState(true);
    });

    expect(button).toBeDisabled();
  });

  test("Dynamic state changing", () => {
    const getExpectedText = (num: number) => `State ${num}`;
    // create a caller object to be able manually call useState
    const caller = {
      setState: ((_state: number) => {}) as React.Dispatch<
        React.SetStateAction<number>
      >
    };

    render(<DynamicState caller={caller} />);

    // get the first useState hook
    const useState = collector.getReactHooks(DynamicState.name)?.getUseState(1);

    // the correct text should be in the document
    expect(screen.getByText(getExpectedText(0))).toBeTruthy();
    // it should contain the correct state result
    expect(useState?.next()).toEqual([0]);

    // manually set the state
    act(() => {
      caller.setState(1);
    });

    // the correct text should be in the document
    expect(screen.getByText(getExpectedText(1))).toBeTruthy();
    // it should contain the correct state result
    expect(useState?.next()).toEqual([1]);

    // manually set the state
    act(() => {
      caller.setState(3);
    });

    // the correct text should be in the document
    expect(screen.getByText(getExpectedText(3))).toBeTruthy();

    // manually set the state
    act(() => {
      caller.setState(8);
    });

    // it should contain correct state results since last calling useState.next()
    expect(useState?.next()).toEqual([3, 8]);

    // reset the state itterator
    useState?.reset();

    // check all states created since render
    expect(useState?.next()).toEqual([0, 1, 3, 8]);
  });

  test("It should not re-render the children - use case 1", () => {
    const caller = {
      setState: ((_state: number) => {}) as React.Dispatch<
        React.SetStateAction<number>
      >
    };
    const testText = "Some text";

    render(
      <OneUseStateWithChildren caller={caller}>
        <ComponentWithChildren>{testText}</ComponentWithChildren>
      </OneUseStateWithChildren>
    );

    // the text should be in the document
    expect(screen.getByText(testText)).toBeTruthy();

    // children of OneUseStateWithChildren should be rendered once
    expect(collector.getCallCount(ComponentWithChildren.name)).toBe(1);

    act(() => {
      caller.setState(1);
    });

    // children of OneUseStateWithChildren should be rendered once
    expect(collector.getCallCount(ComponentWithChildren.name)).toBe(1);
  });

  test("It should not re-render the children - use case 2", () => {
    const caller = {
      setState: ((_state: number) => {}) as React.Dispatch<
        React.SetStateAction<number>
      >
    };
    const testText = "Some text";

    render(
      <ComponentWithChildren>
        <OneUseStateWithChildren caller={caller}>
          <ComponentWithChildrenFunction text={testText}>
            {(text) => <SimpleComponent text={text} />}
          </ComponentWithChildrenFunction>
        </OneUseStateWithChildren>
      </ComponentWithChildren>
    );

    // the text should be in the document
    expect(screen.getByText(testText)).toBeTruthy();

    // children of OneUseStateWithChildren should be rendered once
    expect(collector.getCallCount(ComponentWithChildrenFunction.name)).toBe(1);

    act(() => {
      caller.setState(1);
    });

    // children of OneUseStateWithChildren should be rendered once
    expect(collector.getCallCount(ComponentWithChildrenFunction.name)).toBe(1);
  });

  test("Multiple states with dynamic changing", () => {
    const getExpectedText = (num: number) => `Render ${num}`;
    /*
      create a caller object to be able manually call the action
      and set the state
    */
    const caller = {
      action: (_num: number) => {}
    };

    render(<MultipleStates caller={caller} />);

    // get all hooks
    const useState = collector.getReactHooks(MultipleStates.name);

    // two useState hooks should exist
    expect(useState?.getAll("useState")?.length).toBe(2);

    // manually set the state
    act(() => {
      caller.action(123);
    });

    // the correct text should be in the document
    expect(screen.getByText(getExpectedText(123))).toBeTruthy();

    // manually set the state
    act(() => {
      caller.action(987);
    });

    // the correct text should be in the document
    expect(screen.getByText(getExpectedText(987))).toBeTruthy();

    // all states in the render sequence should contain the correct value
    expect(useState?.getUseState(2).getState(1)).toBe("");
    expect(useState?.getUseState(2).getState(2)).toBe(getExpectedText(123));
    expect(useState?.getUseState(2).getState(3)).toBe(getExpectedText(987));
  });

  test("Parallel states", () => {
    const getExpectedText = (num: number) => `State ${num}`;
    const dataTestId1 = "test-id-1";
    const dataTestId2 = "test-id-2";
    // crete a caller objects
    const caller1 = {
      setState: ((_num: number) => {}) as React.Dispatch<
        React.SetStateAction<number>
      >
    };
    const caller2 = {
      setState: ((_num: number) => {}) as React.Dispatch<
        React.SetStateAction<number>
      >
    };

    console.warn = jest.fn();

    render(
      <ComponentWithChildren>
        <div data-testid={dataTestId1}>
          <DynamicState caller={caller1} />
        </div>
        <div data-testid={dataTestId2}>
          <DynamicState caller={caller2} />
        </div>
      </ComponentWithChildren>
    );

    expect(collector.getCallCount(DynamicState.name)).toBe(2);

    expect(screen.getByTestId(dataTestId1)).toHaveTextContent(
      getExpectedText(0)
    );
    expect(screen.getByTestId(dataTestId2)).toHaveTextContent(
      getExpectedText(0)
    );

    act(() => caller1.setState(7));

    expect(collector.getCallCount(DynamicState.name)).toBe(3);

    expect(screen.getByTestId(dataTestId1)).toHaveTextContent(
      getExpectedText(7)
    );
    expect(screen.getByTestId(dataTestId2)).toHaveTextContent(
      getExpectedText(0)
    );

    act(() => caller2.setState(11));

    expect(screen.getByTestId(dataTestId1)).toHaveTextContent(
      getExpectedText(7)
    );
    expect(screen.getByTestId(dataTestId2)).toHaveTextContent(
      getExpectedText(11)
    );

    const dynamicState1Hooks = collector.getReactHooks(DynamicState.name, {
      nthChild: 1
    });
    const dynamicState2Hooks = collector.getReactHooks(DynamicState.name, {
      nthChild: 2
    });

    expect(collector.getCallCount(DynamicState.name)).toBe(4);
    expect(dynamicState1Hooks?.getAll("useState")?.length).toBe(1);
    expect(dynamicState2Hooks?.getAll("useState")?.length).toBe(1);
    expect(
      dynamicState1Hooks?.getHooksByType("useState").get(1)?.setState
    ).toBeCalledTimes(1);
    expect(
      dynamicState2Hooks?.getHooksByType("useState").get(1)?.setState
    ).toBeCalledTimes(1);
  });

  test("Multiple calls", () => {
    const getExpectedText = (num: number) => `Content ${num}`;
    render(<MultipeCalls />);
    expect(screen.getByRole("button")).toHaveTextContent(getExpectedText(1));
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByRole("button")).toHaveTextContent(getExpectedText(2));
    expect(collector.getCallCount(MultipeCalls.name)).toBe(2);
  });
});
