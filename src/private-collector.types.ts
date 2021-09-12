import React from "react";

export interface Call {
  args: any;
  stats: CallStats;
  result?: any;
}

export interface CallStats {
  time?: number;
}

export type FunctionCalled = FunctionIdentity &
  NthChild & {
    args: any;
    jestFn: jest.Mock;
    originMock: boolean;
    parent?: Identity | null;
  };

export type FunctionExecuted = FunctionIdentity &
  NthChild & {
    children: FunctionIdentity[];
    index: number;
    parent: Identity | null;
    result: any;
    time: number;
  };

export interface FunctionIdentity {
  dataTestId?: string;
  name: string;
  relativePath: string;
}

export interface GetStatsOptions extends Options {
  excludeTime?: boolean;
}

export type HooksCounter = { [key in keyof ReactHooksTypes]?: number };

export type HookCallback<T = undefined> = HookWithAction<T> & {
  deps: any[];
  hasBeenChanged: boolean;
};

export type HookChecker<T = undefined> = T extends undefined
  ? {
      isRegistered: boolean;
    }
  : {};

export interface HookContext {
  args: any;
  context: any;
}

export type HookEffect<T = undefined> = HookWithAction<T> & {
  deps: any[];
  unmount?: jest.Mock;
};

export interface HookRef {
  args: any;
  ref: {
    current?: unknown;
  };
  hasBeenChanged: boolean;
}

export interface HookResult {
  args?: any;
  result?: any;
}

export type HookState<T = undefined> = {
  setState: jest.Mock;
  state: any[];
} & (T extends undefined ? { _originState: Function } : {});

export type HookWithAction<T = undefined> = {
  action: jest.Mock;
} & (T extends undefined ? { _originScope: string } : {});

export type Identity<T = undefined> = FunctionIdentity &
  NthChild & {
    originMock: boolean;
    parent: (T extends undefined ? Identity : Partial<Identity>) | null;
  } & (T extends undefined
    ? { children?: (FunctionIdentity & NthChild)[] }
    : {});

export interface NthChild {
  nthChild?: number;
}

export interface Options extends NthChild {
  dataTestId?: string;
  ignoreWarning?: true;
  parent?: Partial<Identity<unknown>> | null;
  relativePath?: string;
}

export interface ReactClassLifecycle {
  render: jest.Mock;
  setState: jest.Mock;
}

export interface ReactHooksTypes<T = undefined> {
  useCallback: HookCallback<T> & HookChecker<T>;
  useContext: HookContext & HookChecker<T>;
  useEffect: HookEffect<T> & HookChecker<T>;
  useImperativeHandle: HookResult & HookChecker<T>;
  useRef: HookRef & HookChecker<T>;
  useReducer: HookResult & HookChecker<T>;
  useState: HookState<T> & HookChecker<T>;
  useMemo: HookResult & HookChecker<T>;
}

export type ReactHooks<T = undefined> = {
  [K in keyof ReactHooksTypes]?: ReactHooksTypes<T>[K][];
};

export interface RegisterReactClass {
  componentName: string;
  dataTestId?: string;
  implementation: RegisterReactClassImplementation;
  relativePath: string;
}

export interface RegisterReactClassImplementation {
  render: () => React.ReactNode;
  setState: (...props: any) => void;
}

export type RegisteredFunction<T = undefined> = {
  calls: Call[];
  current: Identity;
  hooks?: ReactHooks<T>;
  jestFn: jest.Mock;
  lifecycle?: ReactClassLifecycle;
  parent: Identity | null;
} & (T extends undefined ? { hooksCounter: HooksCounter } : {});

export interface RegisterHook {
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

export interface RegisterUseContext extends RegisterHook {
  props: ReactHooksTypes["useContext"];
}

export interface RegisterUseRef extends RegisterHook {
  props: ReactHooksTypes["useRef"];
}

export interface RegisterUseState extends RegisterHook {
  props: ReactHooksTypes["useState"];
}

export interface RegisterUseWithAction<K extends "useEffect" | "useCallback">
  extends RegisterHook {
  hookType: K;
  props: ReactHooksTypes[K];
}

export interface Stats {
  calls: Call[];
  dataTestId?: string;
  name: string;
  numberOfCalls: number;
  parent: Identity | null;
  path: string;
}
