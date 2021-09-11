import { CollectorAbstract } from "./private-collector.abstract";
import {
  CallStats,
  FunctionCalled,
  FunctionExecuted,
  GetStatsOptions,
  HookChecker,
  Identity,
  Options,
  ReactHooks,
  ReactHooksTypes,
  RegisteredFunction,
  RegisterHookProps,
  RegisterReactClass,
  RegisterUseContext,
  RegisterUseRef,
  RegisterUseState,
  RegisterUseWithAction,
  Stats
} from "./private-collector.types";

export class PrivateCollector extends CollectorAbstract {
  private activeFunction: Identity[] = [];
  private dataTestIdInheritance = false;
  private registeredFunctions: RegisteredFunction[] = [];

  get isDataTestIdInherited() {
    return this.dataTestIdInheritance;
  }

  public enableDataTestIdInheritance() {
    this.dataTestIdInheritance = true;
  }
  public disableDataTestIdInheritance() {
    this.dataTestIdInheritance = false;
  }

  private findByParent(
    item: Identity | null,
    parent: Partial<Identity<unknown>> | null
  ): boolean {
    return parent === null
      ? item === null
      : item
      ? (parent.dataTestId ? item.dataTestId === parent.dataTestId : true) &&
        (parent.name ? item.name === parent.name : true) &&
        (parent.parent
          ? this.findByParent(item.parent, parent.parent)
          : true) &&
        (parent.relativePath ? item.relativePath === parent.relativePath : true)
      : false;
  }

  public functionCalled({
    args,
    dataTestId,
    jestFn,
    name,
    nthChild,
    parent,
    relativePath
  }: FunctionCalled) {
    if (!parent) {
      parent = this.activeFunction.length
        ? this.activeFunction[this.activeFunction.length - 1]
        : null;
    }

    if (dataTestId === undefined && this.isDataTestIdInherited) {
      dataTestId = parent?.dataTestId;
    }

    const registered = this.getDataFor(name, {
      dataTestId,
      nthChild,
      parent: parent || null,
      relativePath
    });

    if (registered) {
      registered.calls.push({ args, stats: { time: 0 } });
      registered.hooksCounter = {};
      this.unregisterAllHooks(registered);
      this.activeFunction.push(registered.current);

      return {
        current: registered.current,
        dataTestId,
        index: registered.calls.length - 1,
        parent
      };
    } else {
      const current: Identity = {
        parent,
        dataTestId,
        name,
        nthChild,
        relativePath
      };

      this.activeFunction.push(current);

      this.registeredFunctions.push({
        calls: [{ args, stats: { time: 0 } }],
        current,
        hooksCounter: {},
        jestFn,
        parent: parent || null
      });

      return { current, dataTestId, index: 0, parent };
    }
  }

  public functionExecuted({
    children,
    name,
    dataTestId,
    index,
    nthChild,
    parent,
    relativePath,
    result,
    time
  }: FunctionExecuted) {
    const registered = this.getDataFor(name, {
      dataTestId,
      nthChild,
      parent: parent || null,
      relativePath
    });

    if (!registered) {
      return;
    }

    if (!children.length) {
      this.activeFunction.pop();
    } else {
      this.activeFunction[this.activeFunction.length - 1].children = children;
    }

    const parentIndex = parent ? this.activeFunction.indexOf(parent) : -1;

    if (parentIndex !== -1 && parent!.children) {
      parent!.children.shift();
    }

    if (parentIndex !== -1 && parent!.children && !parent!.children.length) {
      delete parent!.children;
      this.activeFunction.splice(parentIndex, 1);
    }

    if (index < registered.calls.length) {
      registered.calls[index].result = result;
      registered.calls[index].stats.time = time;
    }
  }

  public getActiveFunction() {
    return this.activeFunction.length
      ? this.activeFunction[this.activeFunction.length - 1]
      : undefined;
  }

  public getCallCount(name: string, options?: Options) {
    const registered = this.getDataFor(name, options);

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

  public getAllDataFor(name: string, options?: Options) {
    const registered = this.registeredFunctions.filter(
      (item) =>
        item.current.dataTestId === options?.dataTestId &&
        item.current.name === name &&
        (options?.nthChild === undefined ||
          item.current.nthChild === options.nthChild) &&
        (options?.parent === undefined ||
          this.findByParent(item.parent, options.parent)) &&
        (options?.relativePath === undefined ||
          item.current.relativePath === options.relativePath)
    );

    return registered;
  }

  public getDataFor(name: string, options?: Options) {
    const registered = this.getAllDataFor(name, options);

    if (!options?.ignoreWarning && registered.length > 1) {
      console.warn(
        `More subjects with name '${name}' detected. Use relative path or parent to get exact result.`
      );
    }

    return registered.length ? registered[0] : undefined;
  }

  private getHookWithoutScope<K extends keyof ReactHooksTypes>(
    registered: RegisteredFunction | undefined,
    hookType: K,
    sequence: number
  ): ReactHooksTypes<unknown>[K] | undefined {
    const filtered = this.getOnlyRegisteredHooks(registered);

    return filtered &&
      filtered.hooks &&
      hookType in filtered.hooks &&
      sequence > 0 &&
      sequence <= filtered.hooks[hookType]!.length
      ? this.removeHelperProps<K>(
          filtered.hooks[hookType]![sequence - 1] as ReactHooksTypes[K]
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

  public getReactHooks(
    componentName: string,
    options?: Options
  ): {
    getAll: <K extends keyof ReactHooksTypes>(
      hookType?: K
    ) =>
      | (K extends undefined ? ReactHooks<unknown> : ReactHooks<unknown>[K])
      | undefined;
    getHook: <K extends keyof ReactHooksTypes>(
      hookType: K,
      sequence: number
    ) => ReactHooksTypes<unknown>[K] | undefined;
    getHooksByType: <K extends keyof ReactHooksTypes>(
      hookType: K
    ) => {
      get: (sequence: number) => ReactHooksTypes<unknown>[K] | undefined;
    };
    getUseState: (sequence: number) => {
      getState: (stateSequence: number) => unknown | undefined;
      next: () => unknown[];
      reset: () => void;
    };
  };

  public getReactHooks(componentName: string, options?: Options) {
    const registered = this.getDataFor(componentName, options);

    return {
      getAll: (hookType?: keyof ReactHooksTypes) => {
        const filtered = this.getOnlyRegisteredHooks(registered);

        return filtered && filtered.hooks
          ? hookType
            ? filtered.hooks[hookType]?.map((item) =>
                this.removeHelperProps(item)
              )
            : this.removePropsFromAllHooks(filtered.hooks)
          : undefined;
      },
      getHook: (hookType: keyof ReactHooksTypes, sequence: number) =>
        this.getHookWithoutScope(registered, hookType, sequence),
      getHooksByType: (hookType: keyof ReactHooksTypes) => ({
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
    const registered = this.getDataFor(componentName, options);

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

  public getStats(
    nameOrOptions?: string | GetStatsOptions,
    options?: GetStatsOptions
  ): Stats[] | Stats | undefined {
    return nameOrOptions === undefined || typeof nameOrOptions !== "string"
      ? this.registeredFunctions.map((registered) =>
          this.makeStats(registered, nameOrOptions)
        )
      : this.makeStats(this.getDataFor(nameOrOptions, options), options);
  }

  public hasRegistered(name: string, options?: Options) {
    return this.getDataFor(name, options) !== undefined;
  }

  private makeStats<T extends RegisteredFunction | undefined>(
    registered?: T,
    options?: GetStatsOptions
  ): T extends undefined ? undefined : Stats;
  private makeStats(
    registered?: RegisteredFunction,
    options?: GetStatsOptions
  ): Stats | undefined {
    if (registered === undefined) {
      return undefined;
    }

    return {
      calls: registered.calls.map((call) => ({
        args: undefined,
        stats: this.resolveStats(call.stats, options)
      })),
      dataTestId: registered.current.dataTestId,
      name: registered.current.name,
      numberOfCalls: registered.calls.length,
      parent: registered.parent,
      path: registered.current.relativePath
    };
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
    const current = this.getActiveFunction();
    const registered = this.getDataFor(componentName, {
      dataTestId: current?.dataTestId,
      parent: current?.parent || null,
      relativePath
    });

    if (!registered) {
      return props;
    }

    this.registerHook(registered, hookType);

    const existingHook = (
      registered.hooks![hookType] as ReactHooksTypes[K][]
    )?.find((item) => item._originScope === props._originScope);

    const sequence = this.getSequenceNumber(registered, hookType);

    if (existingHook) {
      existingHook.isRegistered = true;
      registered.hooksCounter[hookType] = sequence + 1;
      return existingHook;
    }

    return this.registerHookProps({
      registered,
      hooks: registered.hooks![hookType] as ReactHooksTypes[K][],
      hookType,
      props,
      sequence
    });
  }

  public registerReactClass({
    componentName,
    dataTestId,
    implementation: { render, setState },
    relativePath
  }: RegisterReactClass) {
    const registered = this.getDataFor(componentName, {
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

  public registerUseContext({
    componentName,
    props,
    relativePath
  }: RegisterUseContext) {
    const hookType = "useContext";
    const current = this.getActiveFunction();
    const registered = this.getDataFor(componentName, {
      dataTestId: current?.dataTestId,
      parent: current?.parent || null,
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
    const current = this.getActiveFunction();
    const registered = this.getDataFor(componentName, {
      dataTestId: current?.dataTestId,
      parent: current?.parent || null,
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
    const current = this.getActiveFunction();
    const registered = this.getDataFor(componentName, {
      dataTestId: current?.dataTestId,
      parent: current?.parent || null,
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
    const result: ReactHooksTypes<unknown>[K] = {
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

    const result: ReactHooks<unknown> = {};

    for (let key in hooks) {
      result[key] = this.removePropsFromHook(hooks[key]);
    }

    return result;
  }

  public reset(name?: string, options?: Options) {
    if (!name) {
      this.activeFunction = [];
      this.dataTestIdInheritance = false;
      this.registeredFunctions = [];
      return;
    }

    const registered = this.getDataFor(name, options);

    if (!registered) {
      return;
    }

    const index = this.registeredFunctions.indexOf(registered);

    if (index !== -1) {
      this.registeredFunctions.splice(index, 1);
    }
  }

  private resolveStats(stats: CallStats, options?: GetStatsOptions) {
    const result = {
      ...stats
    };

    if (options?.excludeTime) {
      delete result.time;
    }

    return result;
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
