import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { act } from "react-dom/test-utils";
import { OneUseReducer } from "./components/UseReducer";

beforeEach(() => {
  collector.reset();
});

describe("useReducer", () => {
  test("Component with one useReducer", () => {
    console.error = jest.fn();

    render(<OneUseReducer />);

    // get the useReducer hooks
    const useReducerHooks = collector
      .getReactHooks(OneUseReducer.name)
      .getHooksByType("useReducer");

    // the component should be rendered once
    expect(collector.getCallCount(OneUseReducer.name)).toBe(1);

    // correct text should be in the document
    expect(screen.getByTestId("result")).toHaveTextContent("Count: 0");

    // the useReducer should be registered and have initial value
    expect(useReducerHooks.get(1)).not.toBeUndefined();
    expect(useReducerHooks.get(2)).toBeUndefined();
    expect(useReducerHooks.get(1)?.dispatch).not.toBeCalled();
    expect(useReducerHooks.get(1)?.state).toEqual({ count: 0 });

    // increment the counter
    fireEvent.click(screen.getByTestId("increment"));

    // the component should be rendered twice
    expect(collector.getCallCount(OneUseReducer.name)).toBe(2);

    // correct text should be in the document
    expect(screen.getByTestId("result")).toHaveTextContent("Count: 1");

    // the dispatch should be called and state should be incremented
    expect(useReducerHooks.get(1)).not.toBeUndefined();
    expect(useReducerHooks.get(2)).toBeUndefined();
    expect(useReducerHooks.get(1)?.dispatch).toBeCalledTimes(1);
    expect(useReducerHooks.get(1)?.dispatch).lastCalledWith({
      type: "increment"
    });
    expect(useReducerHooks.get(1)?.state).toEqual({ count: 1 });

    // decrement the counter
    fireEvent.click(screen.getByTestId("decrement"));

    // the component should be rendered three times
    expect(collector.getCallCount(OneUseReducer.name)).toBe(3);

    // correct text should be in the document
    expect(screen.getByTestId("result")).toHaveTextContent("Count: 0");

    // the dispatch should be called and state should be decremented
    expect(useReducerHooks.get(1)).not.toBeUndefined();
    expect(useReducerHooks.get(2)).toBeUndefined();
    expect(useReducerHooks.get(1)?.dispatch).toBeCalledTimes(2);
    expect(useReducerHooks.get(1)?.dispatch).lastCalledWith({
      type: "decrement"
    });
    expect(useReducerHooks.get(1)?.state).toEqual({ count: 0 });

    // directly call the dispatch
    act(() => {
      useReducerHooks.get(1)?.dispatch({ type: "decrement" });
    });

    // the component should be rendered three times
    expect(collector.getCallCount(OneUseReducer.name)).toBe(4);

    // correct text should be in the document
    expect(screen.getByTestId("result")).toHaveTextContent("Count: -1");

    // call dispatch directly with not defined type should throw an error
    expect(() => {
      act(() => {
        useReducerHooks.get(1)?.dispatch({ type: "unknown" });
      });
    }).toThrowError();
  });
});
