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
 * when the component and its children are executed. UseEffect
 * will be called and it re-render only Template and its children
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

  // after the render, set the state in Template
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

export const ComponentWithChildrenFunction = ({
  children,
  text
}: {
  children: (text: string) => React.ReactNode;
  text: string;
}) => {
  return <>{children(text)}</>;
};

export const DirectComponent = ({
  templateDataTestId
}: {
  templateDataTestId?: string;
}) => {
  // create a caller object
  const caller = {
    action: jest.fn(),
    templateSetState: ((_state) => {}) as React.Dispatch<
      React.SetStateAction<{ num: number; text: string }>
    >,
    unmount: jest.fn()
  };

  // after the render, set the state in Template
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

export const SimpleComponentInTheSameFile = ({ text }: { text?: string }) => (
  <SimpleComponent text={text} />
);
