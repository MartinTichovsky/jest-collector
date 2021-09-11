import React, { useEffect } from "react";
import { recursiveFunction } from "../others/recursive-function";
import { OneUseCallback } from "./UseCallback";
import { Template } from "./UseEffect";
import { OneUseRef } from "./UseRef";
import { OneUseState } from "./UseState";

/**
 * The component calls recursive function before all children,
 * when the component and its children are executed, useEffect
 * will be called and re-render only Template and its children
 */
export const ComplexComponent = ({
  templateDataTestId
}: {
  templateDataTestId?: string;
}) => {
  recursiveFunction(2, recursiveFunction);

  // create the caller object
  const caller = {
    action: jest.fn(),
    templateSetState: ((_state) => {}) as React.Dispatch<
      React.SetStateAction<{ num: number; text: string }>
    >,
    unmount: jest.fn()
  };

  // after render, set state in the Template, it is assigned inside Template
  useEffect(() => {
    caller.templateSetState({ num: 5, text: "Some text" });
  }, []);

  return (
    <>
      <Template data-testid={templateDataTestId} caller={caller} />
      <OneUseRef />
      <OneUseCallback callFunc={caller.action}>
        <OneUseState />
      </OneUseCallback>
    </>
  );
};

export const DirectComponent = ({
  templateDataTestId
}: {
  templateDataTestId?: string;
}) => {
  // create the caller object
  const caller = {
    action: jest.fn(),
    templateSetState: ((_state) => {}) as React.Dispatch<
      React.SetStateAction<{ num: number; text: string }>
    >,
    unmount: jest.fn()
  };

  // after render, set state in the Template, it is assigned inside Template
  useEffect(() => {
    caller.templateSetState({ num: 5, text: "Some text" });
  }, []);

  return <Template data-testid={templateDataTestId} caller={caller} />;
};
