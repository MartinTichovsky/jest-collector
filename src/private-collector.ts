import { ControllerAbstract } from "./private-collector.abstract";
import {
  ActiveDataTestId,
  FunctionCalled,
  FunctionExecuted,
  HookChecker,
  Options,
  ReactHooks,
  ReactHooksTypes,
  RegisterComponent,
  RegisteredFunction,
  RegisterHookProps,
  RegisterUseContext,
  RegisterUseRef,
  RegisterUseState,
  RegisterUseWithAction
} from "./private-collector.types";

export class PrivateCollector extends ControllerAbstract {
  private activeDataTestId: ActiveDataTestId[] = [];
  private registeredFunctions: RegisteredFunction[] = [];

  public functionCalled({
    args,
    dataTestId,
    jestFn,
    name,
    relativePath
  }: FunctionCalled) {
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
      registered.calls.push({ args, stats: { time: 0 } });
      registered.hooksCounter = {};
      this.unregisterAllHooks(registered);

      return registered.calls.length - 1;
    } else {
      this.registeredFunctions.push({
        calls: [{ args, stats: { time: 0 } }],
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
    result,
    time
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
      registered.calls[index].stats.time = time;
    }
  }

  public getActiveDataTestId(name: string, relativePath: string) {
    const active = this.activeDataTestId.find(
      (item) => item.name === name && item.relativePath === relativePath
    );

    return active?.dataTestIds[active.dataTestIds.length - 1];
  }

  public getCallCount(name: string, options?: Options) {
    const registered = this.getFunction(name, options);

    if (
      registered &&
      registered.lifecycle &&
      registered.lifecycle.render &&
      registered.lifecycle.render.mock
    ) {
      return registered.lifecycle.render.mock.calls.length;
    }

    return registered ? registered.calls.length : undefined;
  }

  public getFunction(name: string, options?: Options) {
    if (options?.relativePath !== undefined) {
      return this.registeredFunctions.find(
        (item) =>
          item.name === name &&
          item.dataTestId === options?.dataTestId &&
          item.relativePath === options?.relativePath
      );
    }

    const registered = this.registeredFunctions.filter(
      (item) => item.name === name && item.dataTestId === options?.dataTestId
    );

    if (registered.length > 1) {
      console.warn(
        `More subjects with name '${name}' and different relative path detected. Use relative path to get exact result.`
      );
    }

    return registered.length ? registered[0] : undefined;
  }

  private getHookWithoutScope<K extends keyof ReactHooksTypes>(
    registered: RegisteredFunction | undefined,
    hookType: K,
    sequence: number
  ): ReactHooksTypes<never>[K] | undefined {
    const filtered = this.getOnlyRegisteredHooks(registered);

    return filtered &&
      filtered.hooks &&
      hookType in filtered.hooks &&
      sequence > 0 &&
      sequence <= filtered.hooks[hookType]!.length
      ? this.removeHelperProps<K>(
          filtered.hooks[hookType]![sequence - 1] as ReactHooksTypes<never>[K]
        )
      : undefined;
  }

  public getOnlyRegisteredHooks(
    registered: RegisteredFunction | undefined
  ): RegisteredFunction | undefined {
    if (!registered || !registered.hooks) {
      return undefined;
    }

    const result = {};

    for (let key in registered.hooks) {
      result[key] = (registered.hooks[key] as HookChecker[]).filter(
        (item) => item.isRegistered
      );
    }

    return {
      ...registered,
      hooks: result
    };
  }

  public getReactHooks(componentName: string, options?: Options) {
    const registered = this.getFunction(componentName, options);

    return {
      getAll: <K extends keyof ReactHooksTypes>(hookType?: K) => {
        const filtered = this.getOnlyRegisteredHooks(registered);

        return filtered && filtered.hooks
          ? ((hookType
              ? filtered.hooks[hookType]?.map((item) =>
                  this.removeHelperProps(item)
                )
              : this.removePropsFromAllHooks(
                  filtered.hooks
                )) as K extends undefined
              ? ReactHooks<never>
              : ReactHooks<never>[K])
          : undefined;
      },
      getHook: <K extends keyof ReactHooksTypes>(
        hookType: K,
        sequence: number
      ) => this.getHookWithoutScope(registered, hookType, sequence),
      getHooksByType: <K extends keyof ReactHooksTypes>(hookType: K) => ({
        get: (sequence: number) =>
          this.getHookWithoutScope(registered, hookType, sequence)
      }),
      getUseState: (sequence: number) => {
        let stateIndex = 0;
        const filtered = this.getOnlyRegisteredHooks(registered);

        return {
          getState: (stateSequence: number) =>
            filtered &&
            filtered.hooks &&
            filtered.hooks["useState"] &&
            sequence > 0 &&
            sequence <= filtered.hooks["useState"].length &&
            filtered.hooks["useState"][sequence - 1].state &&
            stateSequence > 0 &&
            stateSequence <=
              filtered.hooks["useState"][sequence - 1].state.length
              ? filtered.hooks["useState"][sequence - 1].state[
                  stateSequence - 1
                ]
              : undefined,
          next: () => {
            const useState = this.getHookWithoutScope(
              registered,
              "useState",
              sequence
            );
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

  public getReactLifecycle(componentName: string, options?: Options) {
    const registered = this.getFunction(componentName, options);

    return registered?.lifecycle;
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

    if (!registered.lifecycle) {
      registered.lifecycle = {
        render: jest.fn(render),
        setState: jest.fn(setState)
      };
    }

    return registered.lifecycle;
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
      hooks: registered.hooks![hookType]!,
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
      hooks: registered.hooks![hookType]!,
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
      hooks: registered.hooks![hookType]!,
      hookType,
      props,
      sequence
    });
  }

  private removeHelperProps<K extends keyof ReactHooksTypes>(
    item: ReactHooksTypes[K]
  ) {
    const result: ReactHooksTypes<never>[K] = {
      ...item
    };

    if (result["_originScope"]) {
      delete result["_originScope"];
    }

    if (result["_originState"]) {
      delete result["_originState"];
    }

    if (result["isRegistered"]) {
      delete result["isRegistered"];
    }

    return result;
  }

  private removePropsFromHook(hooks: HookChecker[]) {
    return hooks
      .filter((item) => item.isRegistered)
      .map((item) => this.removeHelperProps(item));
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

  public reset(name?: string, options?: Options) {
    if (!name) {
      this.activeDataTestId = [];
      this.registeredFunctions = [];
      return;
    }

    const index = this.registeredFunctions.findIndex(
      (item) =>
        item.name === name &&
        item.dataTestId === options?.dataTestId &&
        item.relativePath === options?.relativePath
    );

    if (index !== -1) {
      this.registeredFunctions.splice(index, 1);
    }
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
