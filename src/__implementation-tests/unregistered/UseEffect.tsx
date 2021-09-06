import React from "react";

export const UnregisteredWithOneUseEffect = ({
  callFunc
}: {
  callFunc: () => void;
}) => {
  React.useEffect(() => {
    callFunc();
  }, []);

  return <div>Unregistered component</div>;
};

export const UnregisteredWithTwoUseEffects = () => {
  React.useEffect(() => {
    // some action
  }, []);

  React.useEffect(() => {
    // some action
  }, []);

  return <div></div>;
};

export const UnregisteredWithUmount = () => {
  React.useEffect(() => {
    return () => {
      // some unmount action
    };
  }, []);

  return <div>Unregistered with unmount</div>;
};

export const UnegisteredWithDeps = ({ deps }: { deps: unknown[] }) => {
  React.useEffect(() => {
    // some unmount action
  }, [...deps]);

  return <div>Unegistered with deps</div>;
};

export const UnregisteredRenders = ({
  caller
}: {
  caller: {
    action: () => void;
    setState?: React.Dispatch<React.SetStateAction<number>>;
  };
}) => {
  const [state, setState] = React.useState(0);
  caller.setState = setState;

  React.useEffect(() => {
    caller.action();
  }, []);

  return <div>Unregistered renders {state}</div>;
};
