import React from "react";

/**
 * The inner cmponent used by Template component will call
 * the action in the useEffect. The useEffect is called when
 * the passed text changes.
 */
export const TemplateInner = ({
  action,
  num,
  text,
  unmount
}: {
  action: (text: string) => void;
  num: number;
  text: string;
  unmount: (num: number) => void;
}) => {
  React.useEffect(() => {
    action(text);

    return () => {
      unmount(num);
    };
  }, [text]);

  return <div>Registered template inner {`${text}${num}`}</div>;
};

/**
 * The component has three useEffects. The second one is created based
 * on the property `secondEffect`. The component is passing the setState
 * through the caller to be able manually set the state.
 */
export const MultipleUseEffectsInner = ({
  caller,
  callFunc1,
  callFunc2,
  callFunc3,
  secondEffect
}: {
  caller: {
    setStateInner?: React.Dispatch<React.SetStateAction<number>>;
  };
  callFunc1: () => void;
  callFunc2: () => void;
  callFunc3: () => void;
  secondEffect: boolean;
}) => {
  const [state, setState] = React.useState(0);
  caller.setStateInner = setState;

  React.useEffect(() => {
    callFunc1();
  }, [callFunc1]);

  if (secondEffect) {
    React.useEffect(() => {
      callFunc2();
    }, [callFunc2]);
  }

  React.useEffect(() => {
    callFunc3();
  }, [callFunc3]);

  return <div>More effects {state}</div>;
};
