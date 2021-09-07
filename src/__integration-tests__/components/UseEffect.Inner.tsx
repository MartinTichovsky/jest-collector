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
