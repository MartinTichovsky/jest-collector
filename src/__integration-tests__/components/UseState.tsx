import React from "react";

export const OneUseState = () => {
  const [_state, _setState] = React.useState(0);

  return <div>Some content</div>;
};

export const DynamicState = ({
  caller
}: {
  caller: { setState: React.Dispatch<React.SetStateAction<number>> };
}) => {
  const [state, setState] = React.useState(0);
  caller.setState = setState;

  return <div>State {state}</div>;
};

export const MultipleStates = ({
  caller
}: {
  caller: { action: (num: number) => void };
}) => {
  const [_state, _setState] = React.useState({});
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
