import React from "react";

export const UnregisteredWithOneUseCallback = ({
  callFunc
}: {
  callFunc: () => void;
}) => {
  React.useCallback(() => {
    return callFunc;
  }, []);

  return <div></div>;
};

export const UnegisteredWithDeps = ({ deps }: { deps: unknown[] }) => {
  React.useCallback(() => {
    // some action
  }, [...deps]);

  return <div></div>;
};

export const UnregisteredRenders = ({
  caller
}: {
  caller: {
    action: (state: number) => void;
    setState?: React.Dispatch<React.SetStateAction<number>>;
  };
}) => {
  const [state, setState] = React.useState(0);
  caller.setState = setState;

  React.useCallback(() => {
    return caller.action;
  }, []);

  return <div></div>;
};
