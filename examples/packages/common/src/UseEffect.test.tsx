import { act, render, screen } from "@testing-library/react";
import React from "react";
import { BadUseEffect, content, CorrectUseEffect, showHide } from "./UseEffect";

/**
 * Let's suppose as a programmer not fully familiar with all React hooks
 * and how they work, I expect that the useEffect will be called only
 * once at first render. With the Jest Collector I can test my expectations.
 * When my expectations are not fulfilled, I can rework the component and
 * test it again.
 *
 * This test will fail because I expect, that useEffect will perform
 * the function only once. Instead of that, I did not use correct dependencies
 * and the listeners array will be increased at every call. I need to use
 * an unmount action or rework the whole useEffect action to reach the
 * expected goal of one call.
 */
test("Bad using state in useEffect", () => {
  // render the component
  render(<BadUseEffect num={0} />);

  // the content should be visible
  expect(screen.getByText(content)).toBeTruthy();

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

  // the content should not be visible
  expect(() => screen.getByText(content)).toThrowError();

  // I expect that after setting the state, useEffect
  // will be still called once. Instead of that the listeners
  // will contain two objects and the action will be called twice
  expect(useEffectHooks?.get(1)?.action).toBeCalledTimes(1);
});

/**
 * This test will pass.
 */
test("Correct using state in useEffect", () => {
  // render the component
  render(<CorrectUseEffect num={0} />);

  // the content should be visible
  expect(screen.getByText(content)).toBeTruthy();

  // get useEffect hooks
  const useEffectHooks = collector
    .getReactHooks(CorrectUseEffect.name)
    ?.getHooksByType("useEffect");

  // I expect that the useEffect action will be called once
  expect(useEffectHooks?.get(1)?.action).toBeCalledTimes(1);

  // perform all listeners and hide the content of the component
  // if the `num` is equal to zero
  act(() => {
    showHide(0);
  });

  // the content should not be visible
  expect(() => screen.getByText(content)).toThrowError();

  // I expect that after setting the state, useEffect
  // will be still called once
  expect(useEffectHooks?.get(1)?.action).toBeCalledTimes(1);
});
