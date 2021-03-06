import React from "react";

export const OneUseCallback = ({
  callFunc,
  children
}: React.PropsWithChildren<{ callFunc: () => void }>) => {
  const action = React.useCallback(() => {
    return callFunc;
  }, []);

  action()();

  return <div>{children}</div>;
};

/**
 * The component passes setState to be able manually call it and test useCallback
 */
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

export const WithDeps = ({ deps }: { deps: unknown[] }) => {
  React.useCallback(() => {
    // some action
  }, [...deps]);

  return <div></div>;
};

export const WithReturn = ({
  caller
}: {
  caller: { action: (num: number) => string };
}) => {
  caller.action = React.useCallback((num: number) => {
    return `Call ${num}`;
  }, []);

  return <div></div>;
};
