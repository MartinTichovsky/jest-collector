import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { BadUseState } from "./UseState";

/**
 * In this case, the result will be always as I expected. The word
 * "something" will be set in the input, but when I see the states
 * I can clearly see that there is a problem.
 *
 * This test will fail because of the "something" value will be set
 * twice.
 */
test("Bad useState using", () => {
  render(<BadUseState />);

  // get the fist useState from the collector
  const useState = collector.getReactHooks(BadUseState.name)?.getUseState(1);

  // the default value is set to an empty value
  expect(useState?.next()).toEqual([{ message: "" }]);

  // input a text
  fireEvent.change(screen.getByTestId("input"), {
    target: { value: "s" }
  });

  // test if the input contains the typed text
  expect(screen.getByTestId("input")).toHaveValue("s");
  // test if the state was set to the expected value
  expect(useState?.next()).toEqual([{ message: "s" }]);

  // input a text
  fireEvent.change(screen.getByTestId("input"), {
    target: { value: "so" }
  });

  // test if the input contains the typed text
  expect(screen.getByTestId("input")).toHaveValue("so");
  // test if the state was set to the expected value
  expect(useState?.next()).toEqual([{ message: "so" }]);

  // input a text
  fireEvent.change(screen.getByTestId("input"), {
    target: { value: "somet" }
  });

  // test if the input contains the typed text
  expect(screen.getByTestId("input")).toHaveValue("something");
  // test if the state was set to expected text. Because of
  // useEffect I expected, that the state will be set twice.
  // But because of wrong condition, there will be one more
  // set state with the same value. The set state will
  // be called twice with an object { message: "something" }
  expect(useState?.next()).toEqual([
    { message: "somet" },
    { message: "something" }
  ]);
});
