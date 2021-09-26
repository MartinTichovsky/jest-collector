import React from "react";

/**
 * This example shows the correct using of the React.useCallback.
 */
export const UseCallback = () => {
  const [state, setState] = React.useState({ num: 0, value: "" });

  const onChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.currentTarget.value;

      setState((prevValue) => ({
        ...prevValue,
        value
      }));
    },
    [setState]
  );

  const onClick = React.useCallback(() => {
    setState((prevValue) => ({
      ...prevValue,
      num: prevValue.num + 1
    }));
  }, [setState]);

  return (
    <>
      <div>Num: {state.num}</div>
      <input data-testid="input" onChange={onChange} />
      <button onClick={onClick}>Increase the state</button>
    </>
  );
};
