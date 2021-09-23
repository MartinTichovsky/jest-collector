import React from "react";

type Listener = { action: (isVisible: boolean) => void; num: number };

const listeners: Listener[] = [];

export const showHide = (num: number) =>
  listeners.forEach((item) => {
    item.action(item.num === num);
  });

/**
 * This example shows bad using dependencies in useEffect.
 *
 * Lets say, you have a component and you would like to toggle visibility
 * externally, depends on some condition. This use is showing using
 * a state in useEffect. When the state is an object, the state will be always
 * different because the useState always returns a new object. When you do not
 * use state in deps, the `state.num` will be always the initial value.
 * To fix this issue, you can provide an ubsubscribe action which will remove
 * the created object from `listeners` when the useEffect unmounts. Or you
 * can use useRef. Pass the state to the useRef object on each render and use
 * it instead of `state.num` like this `ref.current.num`. The useRef always
 * returns the same object so in the `ref.curren.num` will be always the
 * actual number.
 */
export const BadUseEffect = ({ num }: { num: number }) => {
  const [state, setState] = React.useState({ isVisible: true, num });

  React.useEffect(() => {
    listeners.push({
      action: (isVisible) =>
        setState((prevState) => ({ ...prevState, isVisible })),
      num: state.num
    });
  }, [setState, state]);

  return (
    <div>
      {state.isVisible && <div>Content is visible</div>}
      <button
        onClick={() =>
          setState((prevState) => ({ ...prevState, num: prevState.num + 1 }))
        }
      >
        Increase number
      </button>
    </div>
  );
};
