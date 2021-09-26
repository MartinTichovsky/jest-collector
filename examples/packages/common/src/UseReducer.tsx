import React from "react";

interface State {
  count: number;
}

type Action = { type: "increment" | "decrement" };

const initialState = { count: 0 };

const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case "increment":
      return { count: state.count + 1 };
    case "decrement":
      return { count: state.count - 1 };
    default:
      throw new Error();
  }
};

/**
 * An example with useReducer.
 */
export const UseReducer = () => {
  const [state, dispatch] = React.useReducer(reducer, initialState);

  return (
    <>
      <div>Count: {state.count}</div>
      <button
        data-testid="decrement"
        onClick={() => dispatch({ type: "decrement" })}
      >
        -
      </button>
      <button
        data-testid="increment"
        onClick={() => dispatch({ type: "increment" })}
      >
        +
      </button>
    </>
  );
};
