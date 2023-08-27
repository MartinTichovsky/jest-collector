import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { UseCallback } from "./UseCallback";

/**
 * Whenever it is needed to test if you passed to useCallback right deps.
 * This test is really simple and it shows how you can test useCallback.
 * It will be useful when you pass more complex deps and you want to be sure
 * that you used everything correctly. There is no other way, how to test if
 * useCallback has been changed.
 *
 * This test will pass.
 */
test("Testing if the useCallbacks has been changed when re-render the component", () => {
  render(<UseCallback />);

  // get useCallback hooks
  const useCallbackHooks = collector
    .getReactHooks(UseCallback.name)
    ?.getHooksByType("useCallback");

  // the first useCallback should exist
  expect(useCallbackHooks?.get(1)).not.toBeUndefined();
  // the second useCallback should exist
  expect(useCallbackHooks?.get(2)).not.toBeUndefined();

  // increase the state and re-render the component
  fireEvent.click(screen.getByRole("button"));

  // the first useCallback should not be changed
  expect(useCallbackHooks?.get(1)?.hasBeenChanged).toBeFalsy();
  // the second useCallback should not be changed
  expect(useCallbackHooks?.get(2)?.hasBeenChanged).toBeFalsy();

  // input a text and re-render the component
  fireEvent.change(screen.getByTestId("input"), {
    target: { value: "text" }
  });

  // the first useCallback should not be changed
  expect(useCallbackHooks?.get(1)?.hasBeenChanged).toBeFalsy();
  // the second useCallback should not be changed
  expect(useCallbackHooks?.get(2)?.hasBeenChanged).toBeFalsy();
});
