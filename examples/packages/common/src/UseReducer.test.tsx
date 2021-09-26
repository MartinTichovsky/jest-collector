import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { UseReducer } from "./UseReducer";

/**
 * The test is testing state results from the React.useReducer. Whenever you need
 * to test state result from the useReducer to find out if everything works
 * as you expect, you can use it as bellow.
 *
 * This test will pass.
 */
test("Testing useReducer state results", () => {
  render(<UseReducer />);

  // get the first useReducer from the collector
  const useReducer = collector.getReactHooks(UseReducer.name)?.getUseReducer(1);

  // the state should have an initial value
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

  // since last `next()` call there were two dispatch actions
  // and the state was set twice. At first to number one,
  // at second to number two
  expect(useReducer?.next()).toEqual([{ count: 1 }, { count: 2 }]);

  // reset the state counter
  useReducer?.reset();

  // see all states since first render
  expect(useReducer?.next()).toEqual([
    { count: 0 },
    { count: 1 },
    { count: 2 },
    { count: 1 },
    { count: 2 }
  ]);
});
