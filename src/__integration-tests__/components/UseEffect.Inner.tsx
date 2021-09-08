import React from "react";

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

export const MoreUseEffectsInner = ({
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

  return <div>More effects</div>;
};
