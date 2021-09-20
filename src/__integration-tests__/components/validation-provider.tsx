import React from "react";

export const reactContext = React.createContext<string | undefined>(undefined);

export const ValidationProvider = ({
  children,
  value
}: React.PropsWithChildren<{ value?: string }>) => {
  return (
    <reactContext.Provider value={value}>{children}</reactContext.Provider>
  );
};
