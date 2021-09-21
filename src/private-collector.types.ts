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
    parent?: RegisteredFunction | null;
  };

export type FunctionExecuted = {
  children: FunctionIdentity[];
  index: number;
  registered: RegisteredFunction;
  result: any;
  time: number;
};

export interface FunctionIdentity {
  dataTestId: string | null;
  name: string;
  relativePath: string;
}

export interface GetRegistered {
  dataTestId: string | null;
  name: string;
  nthChild?: number;
  parent: RegisteredFunction | null;
  relativePath?: string;
}

export interface GetStatsOptions extends Options {
  excludeTime?: boolean;
}

export type HooksCounter = { [key in keyof ReactHooksTypes]?: number };

export type HookCallback<T = undefined> = HookWithAction<T> & {
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
  unmount?: jest.Mock;
};

export type HookMemo<T = undefined> = {
  deps: any[];
  hasBeenChanged: boolean;
  result: jest.Mock | unknown;
} & HookOriginScope<T>;

export type HookOriginScope<T = undefined> = T extends undefined
  ? { _originScope: string }
  : {};

export interface HookReducer {
  dispatch: jest.Mock;
  initialState: unknown;
  reducer: unknown;
  state: unknown;
}

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
  deps: any[];
} & HookOriginScope<T>;

export type Identity = FunctionIdentity &
  NthChild & {
    originMock: boolean;
  };

export type IdentityWithParent = Identity & {
  parent: IdentityWithParent | null;
};

export interface NthChild {
  nthChild?: number;
}

export interface Options extends NthChild {
  dataTestId?: string | null;
  ignoreWarning?: true;
  parent?: OptionsParent | null;
  relativePath?: string;
}

export interface OptionsWithName extends Options {
  name?: string;
}

export type OptionsParent = Partial<Identity> & {
  parent?: OptionsParent | null;
};

export interface ReactClassLifecycle {
  render?: jest.Mock;
  setState?: jest.Mock;
}

export interface ReactHooksTypes<T = undefined> {
  useCallback: HookCallback<T> & HookChecker<T>;
  useContext: HookContext & HookChecker<T>;
  useEffect: HookEffect<T> & HookChecker<T>;
  useImperativeHandle: HookResult & HookChecker<T>;
  useMemo: HookMemo & HookChecker<T>;
  useRef: HookRef & HookChecker<T>;
  useReducer: HookReducer & HookChecker<T>;
  useState: HookState<T> & HookChecker<T>;
}

export type ReactHooks<T = undefined> = {
  [K in keyof ReactHooksTypes]?: ReactHooksTypes<T>[K][];
};

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

export interface RegisterReactClass {
  implementation: RegisterReactClassImplementation;
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
  parent: RegisteredFunction | null;
} & (T extends undefined ? { hooksCounter?: HooksCounter } : {}) &
  (T extends undefined ? { children?: (FunctionIdentity & NthChild)[] } : {});

export interface RegisterUseContext extends RegisterHook {
  props: ReactHooksTypes["useContext"];
}

export interface RegisterUseReducer extends RegisterHook {
  props: ReactHooksTypes["useReducer"];
}

export interface RegisterUseRef extends RegisterHook {
  props: ReactHooksTypes["useRef"];
}

export interface RegisterUseMemo extends RegisterHook {
  props: ReactHooksTypes["useMemo"];
}

export interface RegisterUseState extends RegisterHook {
  props: ReactHooksTypes["useState"];
}

export interface RegisterUseWithAction<K extends "useEffect" | "useCallback">
  extends RegisterHook {
  hookType: K;
  props: ReactHooksTypes[K];
}

export interface Stats extends NthChild {
  calls: Call[];
  dataTestId: string | null;
  name: string;
  numberOfCalls: number;
  parent: IdentityWithParent | null;
  relativePath: string;
}
