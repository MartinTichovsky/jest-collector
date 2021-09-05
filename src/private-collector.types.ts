export type ComponentHooksTypes = {
  useCallback: HookCallback;
  useContext: HookResult;
  useEffect: HookEffect;
  useRef: HookResult;
  useReducer: HookResult;
  useState: HookState;
  useMemo: HookResult;
};

export type ComponentHooks = {
  [key in keyof ComponentHooksTypes]?: ComponentHooksTypes[key][];
};

export interface FunctionExecuted {
  dataTestId?: string;
  index: number;
  name: string;
  result: any;
}

export interface HookCallback {
  action?: jest.Mock;
  deps?: any[];
}

export interface HookEffect {
  action?: jest.Mock;
  deps?: any[];
  unmountAction?: jest.Mock;
}

export interface HookResult {
  args?: any;
  result?: any;
}

export interface HookState {
  mockedSetState?: jest.Mock;
  setState?: Function;
  state?: any;
}

export interface RegisterFunction {
  args: any;
  jestFn: jest.Mock;
  dataTestId?: string;
  name: string;
}

export interface RegisterHook {
  componentName: string;
  type: keyof ComponentHooksTypes;
  props?: HookState | HookEffect;
}

export interface SetHook {
  componentName: string | undefined;
  dataTestId?: string;
  index: number | undefined;
  props: HookEffect | HookState;
  renderIndex: number | undefined;
  type: keyof ComponentHooksTypes;
}