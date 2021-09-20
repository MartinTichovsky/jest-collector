import React from "react";
import { ValidationProvider } from "./validation-provider";

export const Validation = ({
  children,
  value
}: React.PropsWithChildren<{ value?: string }>) => {
  return <ValidationProvider value={value}>{children}</ValidationProvider>;
};
