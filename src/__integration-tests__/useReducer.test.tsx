import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { act } from "react-dom/test-utils";
import { OneUseReducer } from "./components/UseReducer";

beforeEach(() => {
  collector.reset();
});

describe("UseReducer", () => {
  test("Component with one useReducer", () => {
    console.error = jest.fn();

    render(<OneUseReducer />);

    // get useReducer hooks
    const useReducerHooks = collector
      .getReactHooks(OneUseReducer.name)
      ?.getHooksByType("useReducer");

    const useReducer = collector
      .getReactHooks(OneUseReducer.name)
      ?.getUseReducer(1);

    // the component should be rendered once
    expect(collector.getCallCount(OneUseReducer.name)).toBe(1);

    // the correct text should be in the document
    expect(screen.getByTestId("result")).toHaveTextContent("Count: 0");

    // useReducer should be registered and have the initial value
    expect(useReducerHooks?.get(1)).not.toBeUndefined();
    expect(useReducerHooks?.get(2)).toBeUndefined();
    expect(useReducerHooks?.get(1)?.dispatch).not.toBeCalled();
    // test the states with three possible ways
    expect(useReducerHooks?.get(1)?.state).toEqual([{ count: 0 }]);
    expect(useReducer?.getState(1)).toEqual({ count: 0 });
    expect(useReducer?.next()).toEqual([{ count: 0 }]);

    // increment the counter
    fireEvent.click(screen.getByTestId("increment"));

    // the component should be rendered twice
    expect(collector.getCallCount(OneUseReducer.name)).toBe(2);

    // the correct text should be in the document
    expect(screen.getByTestId("result")).toHaveTextContent("Count: 1");

    // the dispatch should be called and the state should be incremented
    expect(useReducerHooks?.get(1)).not.toBeUndefined();
    expect(useReducerHooks?.get(2)).toBeUndefined();
    expect(useReducerHooks?.get(1)?.dispatch).toBeCalledTimes(1);
    expect(useReducerHooks?.get(1)?.dispatch).lastCalledWith({
      type: "increment"
    });
    // test the states with three possible ways
    expect(useReducerHooks?.get(1)?.state).toEqual([
      { count: 0 },
      { count: 1 }
    ]);
    expect(useReducer?.getState(2)).toEqual({ count: 1 });
    expect(useReducer?.next()).toEqual([{ count: 1 }]);

    // decrement the counter
    fireEvent.click(screen.getByTestId("decrement"));

    // the component should be rendered three times
    expect(collector.getCallCount(OneUseReducer.name)).toBe(3);

    // the correct text should be in the document
    expect(screen.getByTestId("result")).toHaveTextContent("Count: 0");

    // the dispatch should be called and the state should be decremented
    expect(useReducerHooks?.get(1)).not.toBeUndefined();
    expect(useReducerHooks?.get(2)).toBeUndefined();
    expect(useReducerHooks?.get(1)?.dispatch).toBeCalledTimes(2);
    expect(useReducerHooks?.get(1)?.dispatch).lastCalledWith({
      type: "decrement"
    });
    // test the states with three possible ways
    expect(useReducerHooks?.get(1)?.state).toEqual([
      { count: 0 },
      { count: 1 },
      { count: 0 }
    ]);
    expect(useReducer?.getState(3)).toEqual({ count: 0 });
    expect(useReducer?.next()).toEqual([{ count: 0 }]);

    // reset the counter
    useReducer?.reset();

    // get all states since beginning
    expect(useReducer?.next()).toEqual([
      { count: 0 },
      { count: 1 },
      { count: 0 }
    ]);

    // directly call the dispatch
    act(() => {
      useReducerHooks?.get(1)?.dispatch({ type: "decrement" });
    });

    // the component should be rendered three times
    expect(collector.getCallCount(OneUseReducer.name)).toBe(4);

    // the correct text should be in the document
    expect(screen.getByTestId("result")).toHaveTextContent("Count: -1");

    // calling the dispatch directly with not defined type should throw an error
    expect(() => {
      act(() => {
        useReducerHooks?.get(1)?.dispatch({ type: "unknown" });
      });
    }).toThrowError();
  });
});
