import React from "react";

const action = (value: string, listener: (value: string) => void) => {
  if (value.match(/^somet(h(i(n(g)?)?)?)?$/)) {
    listener(`something`);
  }
};

/**
 * This example shows bad set state in actions.
 *
 * Scenario:
 * Lets say I have an input an I would like to predict what a
 * user wants to write. When the user wrote "somet" I will fill
 * the rest of the word to "something". But because I provided
 * wrong condition, the "action" will set the same state twice.
 */
export const BadUseState = () => {
  const [state, setState] = React.useState({ message: "" });

  React.useEffect(() => {
    action(state.message, (message) => {
      setState({ message });
    });
  }, [state.message, setState]);

  return (
    <input
      data-testid="input"
      name="message"
      onChange={(event) => setState({ message: event.currentTarget.value })}
      value={state.message}
    />
  );
};
