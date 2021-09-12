import React from "react";
import { SimpleComponent } from "./common";

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
  React.useEffect(() => {
    //
  }, []);

  return (
    <>
      <SimpleComponent text={text} />
      <SimpleComponent text={text} />
    </>
  );
};
