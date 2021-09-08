import React from "react";

export const reactContext1 = React.createContext<any>(undefined);
export const reactContext2 = React.createContext<{ text?: string }>({});

export const UseContext = () => {
  const context1 = React.useContext(reactContext1);
  const context2 = React.useContext(reactContext2);

  return <div>{`Context ${context1 || ""} ${context2.text || ""}`.trim()}</div>;
};
