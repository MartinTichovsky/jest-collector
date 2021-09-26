import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { UseReducer } from "./UseReducer";

/**
 * This test is testing the state results from React.useReducer. Whenever you need
 * to test the state results from useReducer to find out if everything works
 * as you expected, you can use it as below.
 *
 * This test will pass.
 */
test("Testing useReducer state results", () => {
  render(<UseReducer />);

  // get the first useReducer from the collector
  const useReducer = collector.getReactHooks(UseReducer.name)?.getUseReducer(1);

  // the state should have the initial value
  expect(useReducer?.next()).toEqual([{ count: 0 }]);

  // increment the count number
  fireEvent.click(screen.getByTestId("increment"));

  // the state should be set to one
  expect(useReducer?.next()).toEqual([{ count: 1 }]);

  // increment the count number
  fireEvent.click(screen.getByTestId("increment"));

  // the state should be set to two
  expect(useReducer?.next()).toEqual([{ count: 2 }]);

  // decrement the count number
  fireEvent.click(screen.getByTestId("decrement"));
  // increment the count number
  fireEvent.click(screen.getByTestId("increment"));

  // since last `next()` call, there were two dispatch actions
  // and the state has been set twice. At first to number one,
  // at second to number two
  expect(useReducer?.next()).toEqual([{ count: 1 }, { count: 2 }]);

  // reset the state counter
  useReducer?.reset();

  // see all states since the first render
  expect(useReducer?.next()).toEqual([
    { count: 0 },
    { count: 1 },
    { count: 2 },
    { count: 1 },
    { count: 2 }
  ]);
});
