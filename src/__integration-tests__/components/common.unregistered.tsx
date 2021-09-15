import React from "react";
import { SimpleComponent } from "./common";
import { OneUseRef } from "./UseRef";

export class UnregisteredClassComponent extends React.Component {
  render() {
    return <div>Class component content</div>;
  }
}

export const EmptyWithUseEffectAndUseCallback = () => {
  React.useEffect(() => {
    // some action here
  }, []);

  React.useCallback(() => {
    // some action here
  }, []);

  return <></>;
};

export const ElementWithSimpleComponent = ({ text }: { text?: string }) => {
  return <div>{text}</div>;
};

export const UnregisteredComponentWithSimpleComponent = ({
  text
}: {
  text?: string;
}) => {
  return <SimpleComponent text={text} />;
};

export const UnregisteredComponentWithChildren = ({
  children
}: React.PropsWithChildren<{}>) => {
  return <>{children}</>;
};

export const UnregisteredComponentWithOneUseRef = () => {
  return (
    <>
      <OneUseRef />
    </>
  );
};
