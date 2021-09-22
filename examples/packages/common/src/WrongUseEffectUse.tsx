import React from "react";

export const WrongUseEffectUse = () => {
  const [state, setState] = React.useState({ num: 0 });

  // the state will be alwais different
  React.useEffect(() => {
    //
  }, [state]);

  return (
    <div>
      State: {state.num}
      <button
        onClick={() =>
          setState((prevState) => ({
            num: prevState.num + 1
          }))
        }
      >
        Increase
      </button>
    </div>
  );
};
