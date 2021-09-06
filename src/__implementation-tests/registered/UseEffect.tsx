import React from "react";
import { UnregisteredWithOneUseEffect } from "../unregistered/UseEffect";
import { RegisteredTemplateInner } from "./UseEffect.Inner";

export const OneUseEffect = ({ callFunc }: { callFunc: () => void }) => {
  React.useEffect(() => {
    callFunc();
  }, []);

  return <div>Some content</div>;
};

export const OneUseEffectWithUnregisteredComponent = ({
  callFunc
}: {
  callFunc: () => void;
}) => {
  React.useEffect(() => {
    callFunc();
  }, []);

  return (
    <div>
      <UnregisteredWithOneUseEffect callFunc={callFunc} />
    </div>
  );
};

export const RegisteredWithUmount = () => {
  React.useEffect(() => {
    return () => {
      // some unmount action
    };
  }, []);

  return <div>Registered with unmount</div>;
};

export const RegisteredWithDeps = ({ deps }: { deps: unknown[] }) => {
  React.useEffect(() => {
    // some unmount action
  }, [...deps]);

  return <div>Registered with deps</div>;
};

export const RegisteredRenders = ({
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

  return <div>Registered renders {state}</div>;
};

export const RegisteredTemplate = ({
  caller
}: {
  caller: {
    action: (text: string) => void;
    setState?: React.Dispatch<
      React.SetStateAction<{ num: number; text: string }>
    >;
    unmount: (num: number) => void;
  };
}) => {
  const [state, setState] = React.useState({ num: 0, text: "" });
  caller.setState = setState;

  return (
    <RegisteredTemplateInner
      action={caller.action}
      num={state.num}
      text={state.text}
      unmount={caller.unmount}
    />
  );
};
