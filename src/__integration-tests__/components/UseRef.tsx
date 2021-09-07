import React from "react";

export const OneUseRef = () => {
  const ref = React.useRef("text");

  return <div>Any content with {ref.current}</div>;
};

export const DynamicRef = ({
  caller
}: {
  caller: { setState: React.Dispatch<React.SetStateAction<number>> };
}) => {
  const [state, setState] = React.useState(0);
  caller.setState = setState;

  const staticRef = React.useRef("something");
  const ref = React.useRef(state);

  return (
    <div>
      Ref {state} - {ref.current} - {staticRef.current}
    </div>
  );
};
