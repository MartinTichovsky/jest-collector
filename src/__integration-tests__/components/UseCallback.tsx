import React from "react";

export const OneUseCallback = ({ callFunc }: { callFunc: () => void }) => {
  React.useCallback(() => {
    return callFunc;
  }, []);

  return <div></div>;
};

export const WithDeps = ({ deps }: { deps: unknown[] }) => {
  React.useCallback(() => {
    // some action
  }, [...deps]);

  return <div></div>;
};

export const Renders = ({
  caller
}: {
  caller: {
    action: (state: number) => void;
    setState?: React.Dispatch<React.SetStateAction<number>>;
  };
}) => {
  const [state, setState] = React.useState(0);
  caller.setState = setState;

  const action = React.useCallback(() => {
    return caller.action;
  }, [state]);

  action();

  return <div></div>;
};
