import React from "react";

export class ClassComponent extends React.Component<{}, { text: string }> {
  state = { text: "something" };

  render() {
    return (
      <>
        <button type="button" onClick={() => this.setState({ text: "text" })}>
          Click
        </button>
        <div>Component context - {this.state.text}</div>
      </>
    );
  }
}
