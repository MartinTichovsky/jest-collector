import React from "react";
import { recursiveFunction } from "../others/recursive-function";
import {
  UnregisteredComponentWithChildren,
  UnregisteredComponentWithOneUseRef
} from "./common.unregistered";
import { OneUseCallback } from "./UseCallback";
import { Template } from "./UseEffect";
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
  React.useEffect(() => {
    caller.templateSetState({ num: 5, text: "Some text" });
  }, []);

  return (
    <>
      <div>
        <UnregisteredComponentWithChildren>
          <Template data-testid={templateDataTestId} caller={caller} />
        </UnregisteredComponentWithChildren>
      </div>
      <UnregisteredComponentWithOneUseRef />
      <OneUseCallback callFunc={caller.action}>
        <OneUseState />
      </OneUseCallback>
    </>
  );
};

export const ComponentWithChildren = ({
  children
}: React.PropsWithChildren<{}>) => {
  return <>{children}</>;
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
  React.useEffect(() => {
    caller.templateSetState({ num: 5, text: "Some text" });
  }, []);

  return <Template data-testid={templateDataTestId} caller={caller} />;
};

export const DirectComponentInTheSameFile = ({
  templateDataTestId
}: {
  templateDataTestId?: string;
}) => <DirectComponent templateDataTestId={templateDataTestId} />;

export const SimpleComponent = ({ text }: { text?: string }) => {
  return <p>{text}</p>;
};
