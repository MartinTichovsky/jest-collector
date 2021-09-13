import React from "react";

export const DynamicMemo = ({
  caller
}: {
  caller: {
    setState: React.Dispatch<
      React.SetStateAction<{ num1: number; num2: number }>
    >;
  };
}) => {
  const [state, setState] = React.useState({ num1: 0, num2: 10 });
  caller.setState = setState;

  const memo1 = React.useMemo(() => state.num1 + 1, [state.num1]);
  const memo2 = React.useMemo(() => state.num2 + 2, [state.num2]);

  return (
    <div>
      Memo {`state:${state.num1}-${state.num2}`} {`memo:${memo1}-${memo2}`}
    </div>
  );
};

export const OneUseMemo = () => {
  const memo = React.useMemo(() => "text", []);

  return <div>Memorized {memo}</div>;
};

export const UseMemoWithAction = ({
  caller
}: {
  caller: {
    setState: React.Dispatch<
      React.SetStateAction<{ num1: number; num2: number }>
    >;
  };
}) => {
  const [state, setState] = React.useState({ num1: 0, num2: 9 });
  caller.setState = setState;

  const memo = React.useMemo(() => () => state.num2, [state.num1]);

  return <div>Memorized function {memo()}</div>;
};
