import React from "react";

export const EmptyWithUseEffectAndUseCallback = () => {
  React.useEffect(() => {
    // some action here
  }, []);

  React.useCallback(() => {
    // some action here
  }, []);

  return <></>;
};
