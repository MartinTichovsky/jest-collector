import React from "react";
import { MultipleUseEffectsInner, TemplateInner } from "./UseEffect.Inner";

/**
 * The component contains multiple children div elements in a tree to force React
 * to create multiple nested children. The component has one setState which is
 * passed through the caller to be able manually set the state and force the whole
 * component re-render.
 */
export const MultipleUseEffects = ({
  caller,
  callFunc1,
  callFunc2,
  callFunc3,
  secondEffect
}: {
  caller: {
    setStateInner?: React.Dispatch<React.SetStateAction<number>>;
    setStateParent?: React.Dispatch<React.SetStateAction<undefined | boolean>>;
  };
  callFunc1: () => void;
  callFunc2: () => void;
  callFunc3: () => void;
  secondEffect: boolean;
}) => {
  const [, setState] = React.useState<boolean | undefined>(undefined);
  caller.setStateParent = setState;

  return (
    <div>
      <div>
        <div>
          <MultipleUseEffectsInner
            caller={caller}
            callFunc1={callFunc1}
            callFunc2={callFunc2}
            callFunc3={callFunc3}
            secondEffect={secondEffect}
          />
        </div>
      </div>
    </div>
  );
};

export const OneUseEffect = ({ callFunc }: { callFunc: () => void }) => {
  React.useEffect(() => {
    callFunc();
  }, []);

  return <div>Some content</div>;
};

/**
 * The component passes setState to the caller to be able
 * manually set the state and re-render the component.
 */
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

/**
 * The component contains direct TemplateInner component. It should
 * create different React object with no children. The component
 * passes setState to the caller to be able manually set the state.
 */
export const Template = ({
  caller
}: {
  caller: {
    action: (text: string) => void;
    templateSetState?: React.Dispatch<
      React.SetStateAction<{ num: number; text: string }>
    >;
    unmount: (num: number) => void;
  };
}) => {
  const [state, setState] = React.useState({ num: 0, text: "" });
  caller.templateSetState = setState;

  return (
    <TemplateInner
      action={caller.action}
      num={state.num}
      text={state.text}
      unmount={caller.unmount}
    />
  );
};

export const WithDeps = ({ deps }: { deps: unknown[] }) => {
  React.useEffect(() => {
    // some unmount action
  }, [...deps]);

  return <div>Registered with deps</div>;
};

export const WithUmount = () => {
  React.useEffect(() => {
    return () => {
      // some unmount action
    };
  }, []);

  return <div>Registered with unmount</div>;
};
