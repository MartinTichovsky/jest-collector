import React from "react";

export const DynamicState = ({
  caller
}: {
  caller: { setState: React.Dispatch<React.SetStateAction<number>> };
}) => {
  const [state, setState] = React.useState(0);
  caller.setState = setState;

  return <div>State {state}</div>;
};

/**
 * The component creates two states and through useCallback and
 * the caller provide a possibility to manually change the second
 * state
 */
export const MultipleStates = ({
  caller
}: {
  caller: { action: (num: number) => void };
}) => {
  React.useState({});
  const [text, setText] = React.useState("");

  const action = React.useCallback(
    (num: number) => {
      setText(`Render ${num}`);
    },
    [setText]
  );

  caller.action = action;

  return <div>{text}</div>;
};

export const MultipeCalls = () => {
  const [state1, setState1] = React.useState(0);
  const [state2, setState2] = React.useState(0);
  const onClick = () => {
    setState1(state1 + 1);
    setState2(state2 + 1);
  };

  return <button onClick={onClick}>Content {state1}</button>;
};

export const OneUseState = () => {
  React.useState(0);

  return <div>Some content</div>;
};
