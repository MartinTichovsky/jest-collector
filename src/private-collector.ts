import { ControllerAbstract } from "./private-collector.abstract";
import {
  ActiveDataTestId,
  FunctionExecuted,
  Options,
  ReactHooks,
  ReactHooksTypes,
  RegisterComponent,
  RegisteredFunction,
  RegisterFunction,
  RegisterHookProps,
  RegisterUseContext,
  RegisterUseRef,
  RegisterUseState,
  RegisterUseWithAction
} from "./private-collector.types";

export class PrivateCollector extends ControllerAbstract {
  private activeDataTestId: ActiveDataTestId[] = [];
  private registeredFunctions: RegisteredFunction[] = [];

  private deleteUnregisteredHooks(registered: RegisteredFunction) {
    if (!registered.hooks) {
      return;
    }

    for (let hookType in registered.hooks) {
      for (let i = registered.hooks[hookType].length - 1; i >= 0; i--) {
        if (!registered.hooks[hookType][i].isRegistered) {
          registered.hooks[hookType].splice(i, 1);
        }
      }
    }
  }

  public functionCalled({
    args,
    dataTestId,
    jestFn,
    name,
    relativePath
  }: RegisterFunction) {
    const active = this.activeDataTestId.find(
      (item) => item.name === name && item.relativePath === relativePath
    );

    if (active) {
      active.dataTestIds.push(dataTestId);
    } else {
      this.activeDataTestId.push({
        dataTestIds: [dataTestId],
        name,
        relativePath
      });
    }

    const registered = this.getFunction(name, { dataTestId, relativePath });

    if (registered) {
      registered.calls.push({ args });
      registered.hooksCounter = {};
      this.unregisterAllHooks(registered);

      return registered.calls.length - 1;
    } else {
      this.registeredFunctions.push({
        calls: [{ args }],
        dataTestId,
        hooksCounter: {},
        jestFn,
        name,
        relativePath
      });

      return 0;
    }
  }

  public functionExecuted({
    name,
    dataTestId,
    index,
    relativePath,
    result
  }: FunctionExecuted) {
    const active = this.activeDataTestId.find(
      (item) => item.name === name && item.relativePath === relativePath
    );
    const registered = this.getFunction(name, { dataTestId, relativePath });

    if (!active || !registered) {
      return;
    }

    active.dataTestIds = active.dataTestIds.slice(
      0,
      active.dataTestIds.length - 1
    );

    if (index < registered.calls.length) {
      registered.calls[index].result = result;
    }

    this.deleteUnregisteredHooks(registered);
  }

  public getActiveDataTestId(name: string, relativePath: string) {
    const active = this.activeDataTestId.find(
      (item) => item.name === name && item.relativePath === relativePath
    );

    return active?.dataTestIds[active.dataTestIds.length - 1];
  }

  public getCallCount(name: string, options?: Options) {
    const registered = this.getFunction(name, options);
    return registered ? registered.calls.length : undefined;
  }

  public getFunction(name: string, options?: Options) {
    if (options?.relativePath !== undefined) {
      return this.registeredFunctions.find(
        (item) =>
          item.dataTestId === options?.dataTestId &&
          item.name === name &&
          item.relativePath === options?.relativePath
      );
    }

    const registered = this.registeredFunctions.filter(
      (item) => item.name === name && item.dataTestId === options?.dataTestId
    );

    if (registered.length > 1) {
      console.warn(
        `More functions with name '${name}' and different relative path detected. Use relative path to get exact result.`
      );
    }

    return registered.length ? registered[0] : undefined;
  }

  private getHookWithoutScope(
    registered: RegisteredFunction | undefined,
    hookType: keyof ReactHooksTypes,
    sequence: number
  ) {
    return registered &&
      registered.hooks &&
      hookType in registered.hooks &&
      sequence > 0 &&
      sequence <= registered.hooks[hookType]!.length
      ? this.removeHelperProps(registered.hooks[hookType]![sequence - 1])
      : undefined;
  }

  public getReactComponentHooks(componentName: string, options?: Options) {
    const registered = this.getFunction(componentName, options);

    return {
      getAll: <K extends keyof ReactHooksTypes>(hookType?: K) =>
        registered && registered.hooks
          ? ((hookType
              ? registered.hooks[hookType]?.map((item) => ({
                  ...item,
                  _originScope: undefined
                }))
              : this.removePropsFromAllHooks(
                  registered.hooks
                )) as K extends undefined
              ? ReactHooks<never>
              : ReactHooks<never>[K])
          : undefined,
      getHook: <K extends keyof ReactHooksTypes>(
        hookType: K,
        sequence: number
      ) =>
        this.getHookWithoutScope(registered, hookType, sequence) as
          | ReactHooksTypes<never>[K]
          | undefined,
      getHooksByType: <K extends keyof ReactHooksTypes>(hookType: K) => ({
        get: (sequence: number) =>
          this.getHookWithoutScope(registered, hookType, sequence) as
            | ReactHooksTypes<never>[K]
            | undefined
      }),
      getUseState: (sequence: number) => {
        let stateIndex = 0;

        return {
          getState: (stateSequence: number) =>
            registered &&
            registered.hooks &&
            registered.hooks["useState"] &&
            sequence > 0 &&
            sequence <= registered.hooks["useState"].length &&
            registered.hooks["useState"][sequence - 1].state &&
            stateSequence > 0 &&
            stateSequence <=
              registered.hooks["useState"][sequence - 1].state.length
              ? registered.hooks["useState"][sequence - 1].state[
                  stateSequence - 1
                ]
              : undefined,
          next: () => {
            const useState = this.getHookWithoutScope(
              registered,
              "useState",
              sequence
            ) as ReactHooksTypes["useState"] | undefined;
            const result = useState
              ? useState.state.slice(stateIndex, useState.state.length)
              : [];

            if (useState) {
              stateIndex = useState.state.length;
            }

            return result;
          },
          reset: () => {
            stateIndex = 0;
          }
        };
      }
    };
  }

  public getReactComponentLifecycle(componentName: string, options?: Options) {
    const registered = this.getFunction(componentName, options);

    return registered?.component;
  }

  private getSequenceNumber(
    registered: RegisteredFunction,
    hookType: keyof ReactHooksTypes
  ) {
    if (!(hookType in registered.hooksCounter)) {
      registered.hooksCounter[hookType] = 1;
    }

    return registered.hooksCounter[hookType]!;
  }

  public hasFunction(name: string, options?: Options) {
    return this.getFunction(name, options) !== undefined;
  }

  public registerClassComponent({
    componentName,
    dataTestId,
    implementation: { render, setState },
    relativePath
  }: RegisterComponent) {
    const registered = this.getFunction(componentName, {
      dataTestId,
      relativePath
    });

    if (!registered) {
      return undefined;
    }

    if (!registered.component) {
      registered.component = {
        render: jest.fn(render),
        setState: jest.fn(setState)
      };
    }

    return registered.component;
  }

  private registerHook<K extends keyof ReactHooksTypes>(
    registered: RegisteredFunction,
    hookType: K
  ) {
    if (!registered.hooks) {
      registered.hooks = {};
    }

    if (!(hookType in registered.hooks)) {
      registered.hooks[hookType] = [];
    }
  }

  private registerHookProps<K extends keyof ReactHooksTypes>({
    hooks,
    hookType,
    props,
    registered,
    sequence
  }: RegisterHookProps<K>) {
    if (hooks.length >= sequence) {
      for (let i = hooks.length; i >= sequence - 1; i--) {
        if (i === sequence - 1) {
          hooks[i] = props;
        } else {
          hooks[i] = hooks[i - 1];
        }
      }
    } else {
      hooks[sequence - 1] = props;
    }

    registered.hooksCounter[hookType] = sequence + 1;
    return hooks[sequence - 1];
  }

  public registerHookWithAction<K extends "useEffect" | "useCallback">({
    componentName,
    hookType,
    props,
    relativePath
  }: RegisterUseWithAction<K>) {
    const registered = this.getFunction(componentName, {
      dataTestId: this.getActiveDataTestId(componentName, relativePath),
      relativePath
    });

    if (!registered) {
      return props;
    }

    this.registerHook(registered, hookType);

    const existingHook = (
      registered.hooks![hookType] as ReactHooksTypes[K][]
    )?.find((item) => item._originScope === props._originScope);

    if (existingHook) {
      existingHook.isRegistered = true;
      return existingHook;
    }

    const sequence = this.getSequenceNumber(registered, hookType);

    return this.registerHookProps({
      registered,
      hooks: registered.hooks![hookType] as ReactHooksTypes[K][],
      hookType,
      props,
      sequence
    });
  }

  public registerUseContext({
    componentName,
    props,
    relativePath
  }: RegisterUseContext) {
    const hookType = "useContext";
    const registered = this.getFunction(componentName, {
      dataTestId: this.getActiveDataTestId(componentName, relativePath),
      relativePath
    });

    if (!registered) {
      return props;
    }

    this.registerHook(registered, hookType);

    const sequence = this.getSequenceNumber(registered, hookType);

    this.registerHookProps({
      registered,
      hooks: registered.hooks![hookType] as ReactHooksTypes["useContext"][],
      hookType,
      props,
      sequence
    });
  }

  public registerUseState({
    componentName,
    props,
    relativePath
  }: RegisterUseState) {
    const hookType = "useState";
    const registered = this.getFunction(componentName, {
      dataTestId: this.getActiveDataTestId(componentName, relativePath),
      relativePath
    });

    if (!registered) {
      return props;
    }

    this.registerHook(registered, hookType);

    const existingHook = registered.hooks![hookType]?.find(
      (item) => item._originState === props._originState
    );

    if (existingHook) {
      existingHook.isRegistered = true;
      return existingHook;
    }

    const sequence = this.getSequenceNumber(registered, hookType);

    return this.registerHookProps({
      registered,
      hooks: registered.hooks![hookType] as ReactHooksTypes["useState"][],
      hookType,
      props,
      sequence
    });
  }

  public registerUseRef({
    componentName,
    props,
    relativePath
  }: RegisterUseRef) {
    const hookType = "useRef";
    const registered = this.getFunction(componentName, {
      dataTestId: this.getActiveDataTestId(componentName, relativePath),
      relativePath
    });

    if (!registered) {
      return props;
    }

    this.registerHook(registered, hookType);

    const existingHook = registered.hooks![hookType]?.find(
      (item) => item.ref === props.ref
    );

    if (existingHook) {
      existingHook.isRegistered = true;
      return existingHook;
    }

    const sequence = this.getSequenceNumber(registered, hookType);

    return this.registerHookProps({
      registered,
      hooks: registered.hooks![hookType] as ReactHooksTypes["useRef"][],
      hookType,
      props,
      sequence
    });
  }

  private removeHelperProps(item: {}) {
    const result = {
      ...item
    };
    delete result["_originScope"];
    delete result["_originState"];
    delete result["isRegistered"];

    return result;
  }

  private removePropsFromHook(hooks: {}[]) {
    return hooks.map((item) => this.removeHelperProps(item));
  }

  public removePropsFromAllHooks(hooks?: ReactHooks) {
    if (!hooks) {
      return undefined;
    }

    const result: ReactHooks<never> = {};

    for (let key in hooks) {
      result[key] = this.removePropsFromHook(hooks[key]);
    }

    return result;
  }

  public reset() {
    this.activeDataTestId = [];
    this.registeredFunctions = [];
  }

  private unregisterAllHooks(registered: RegisteredFunction) {
    if (!registered.hooks) {
      return;
    }

    for (let hookType in registered.hooks) {
      for (let hook of registered.hooks[hookType]) {
        hook.isRegistered = false;
      }
    }
  }
}
