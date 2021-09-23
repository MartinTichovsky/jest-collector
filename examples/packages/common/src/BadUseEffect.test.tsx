import { act, render } from "@testing-library/react";
import React from "react";
import { BadUseEffect, showHide } from "./BadUseEffect";

/**
 * Lets suppose as a programmer not fully familiar with all React hooks
 * and how they work, I expect that the useEffect will be called only
 * once on first render. With the jest collector I can test my expectations.
 * When my expectations are not fulfilled, I can rework the component and
 * test it again.
 *
 * This test will fail, because I expect, that the useEffect will perform
 * the function only once. Instead of that, I did not used correct dependencies
 * and the listeners array will be increased on every call. I need to use
 * an unmount action or rework the whole useEffect action to reach the
 * expected goal of one call.
 */
test("BadUseEffect", () => {
  // render the component
  render(<BadUseEffect num={0} />);

  // get useEffect hooks
  const useEffectHooks = collector
    .getReactHooks(BadUseEffect.name)
    ?.getHooksByType("useEffect");

  // I expect that the useEffect action will be called once
  expect(useEffectHooks?.get(1)?.action).toBeCalledTimes(1);

  // perform all listeners and hide the content of the component
  // if the `num` is equal to zero
  act(() => {
    showHide(0);
  });

  // I expect that after setting the state the useEffect
  // will be still called once, instead of that the listeners
  // will contain two object and the action will be called twice
  expect(useEffectHooks?.get(1)?.action).toBeCalledTimes(1);
});
