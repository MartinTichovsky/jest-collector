import React from "react";

export interface ActiveDataTestId {
  name: string;
  dataTestIds: (string | undefined)[];
  relativePath: string;
}
export interface FunctionExecuted {
  dataTestId?: string;
  index: number;
  name: string;
  relativePath: string;
  result: any;
}

export type HooksCounter = { [key in keyof ReactHooksTypes]?: number };

export interface HookWithAction<T = undefined> {
  _originScope: T extends undefined ? string : never;
  action: jest.Mock;
}

export interface HookCallback<T = undefined> extends HookWithAction<T> {
  deps: any[];
  hasBeenChanged: boolean;
}

export interface HookEffect<T = undefined> extends HookWithAction<T> {
  deps: any[];
  unmountAction?: jest.Mock;
}

export interface HookResult {
  args?: any;
  result?: any;
}

export interface HookState<T = undefined> {
  _originState: T extends undefined ? Function : never;
  setState: jest.Mock;
  state: any[];
}

export interface HookUseRef {
  args: any;
  ref: {
    current?: unknown;
  };
  hasBeenChanged: boolean;
}

export interface Options {
  dataTestId?: string;
  relativePath?: string;
}

export interface ReactClassComponentLifecycle {
  render: jest.Mock;
  setState: jest.Mock;
}

export interface ReactHooksTypes<T = undefined> {
  useCallback: HookCallback<T>;
  useContext: HookResult;
  useEffect: HookEffect<T>;
  useImperativeHandle: HookResult;
  useRef: HookUseRef;
  useReducer: HookResult;
  useState: HookState<T>;
  useMemo: HookResult;
}

export type ReactHooks<T = undefined> = {
  [K in keyof ReactHooksTypes]?: ReactHooksTypes<T>[K][];
};

export interface RegisterFunction {
  args: any;
  jestFn: jest.Mock;
  dataTestId?: string;
  name: string;
  relativePath: string;
}

export interface RegisterComponent {
  componentName: string;
  dataTestId?: string;
  implementation: RegisterComponentImplementation;
  relativePath: string;
}

export interface RegisterComponentImplementation {
  render: () => React.ReactNode;
  setState: (...props: any) => void;
}

export interface RegisteredFunction<T = undefined> {
  calls: { args: any; result?: any }[];
  dataTestId?: string;
  component?: ReactClassComponentLifecycle;
  hooks?: ReactHooks<T>;
  hooksCounter: T extends undefined ? HooksCounter : never;
  jestFn: jest.Mock;
  name: string;
  relativePath: string;
}

export interface RegisrterHook {
  componentName: string;
  relativePath: string;
}

export interface RegisterHookProps<K extends keyof ReactHooksTypes> {
  hooks: ReactHooksTypes[K][];
  hookType: K;
  props: ReactHooksTypes[K];
  registered: RegisteredFunction;
  sequence: number;
}

export interface RegisterUseRef extends RegisrterHook {
  props: ReactHooksTypes["useRef"];
}

export interface RegisterUseState extends RegisrterHook {
  props: ReactHooksTypes["useState"];
}

export interface RegisterUseWithAction<K extends "useEffect" | "useCallback">
  extends RegisrterHook {
  hookType: K;
  props: ReactHooksTypes[K];
}
