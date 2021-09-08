import React from "react";
import { MoreUseEffectsInner, TemplateInner } from "./UseEffect.Inner";

export const OneUseEffect = ({ callFunc }: { callFunc: () => void }) => {
  React.useEffect(() => {
    callFunc();
  }, []);

  return <div>Some content</div>;
};

export const MoreUseEffects = ({
  caller,
  callFunc1,
  callFunc2,
  callFunc3,
  secondEffect
}: {
  caller: {
    setStateInner?: React.Dispatch<React.SetStateAction<number>>;
    setStateParent?: React.Dispatch<React.SetStateAction<number>>;
  };
  callFunc1: () => void;
  callFunc2: () => void;
  callFunc3: () => void;
  secondEffect: boolean;
}) => {
  const [, setState] = React.useState(0);
  caller.setStateParent = setState;

  return (
    <div>
      <MoreUseEffectsInner
        caller={caller}
        callFunc1={callFunc1}
        callFunc2={callFunc2}
        callFunc3={callFunc3}
        secondEffect={secondEffect}
      />
    </div>
  );
};

export const WithUmount = () => {
  React.useEffect(() => {
    return () => {
      // some unmount action
    };
  }, []);

  return <div>Registered with unmount</div>;
};

export const WithDeps = ({ deps }: { deps: unknown[] }) => {
  React.useEffect(() => {
    // some unmount action
  }, [...deps]);

  return <div>Registered with deps</div>;
};

export const Renders = ({
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

export const Template = ({
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
    <TemplateInner
      action={caller.action}
      num={state.num}
      text={state.text}
      unmount={caller.unmount}
    />
  );
};
