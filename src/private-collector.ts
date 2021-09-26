import { CollectorAbstract, GetAllHooks } from "./private-collector.abstract";
import {
  CallStats,
  FunctionCalled,
  FunctionExecuted,
  GetRegistered,
  GetStatsOptions,
  IdentityWithParent,
  Options,
  OptionsParent,
  OptionsWithName,
  ReactHooks,
  ReactHooksTypes,
  RegisteredFunction,
  RegisterHookProps,
  RegisterReactClass,
  RegisterUseContext,
  RegisterUseMemo,
  RegisterUseReducer,
  RegisterUseRef,
  RegisterUseState,
  RegisterUseWithAction,
  Stats
} from "./private-collector.types";

export class PrivateCollector extends CollectorAbstract {
  private activeFunction: RegisteredFunction[] = [];
  private dataTestIdInheritance = false;
  private excludeNotMockedElements?: boolean = undefined;
  private registeredFunctions: RegisteredFunction[] = [];

  get isNotMockedElementExcluded() {
    return this.excludeNotMockedElements === true;
  }

  get isDataTestIdInherited() {
    return this.dataTestIdInheritance;
  }

  private checkRegisteredLength(
    name: string,
    registered: RegisteredFunction[],
    options?: Options
  ) {
    if (!options?.ignoreWarning && registered.length > 1) {
      console.warn(
        `More subjects with name '${name}' detected. Use relative path or parent to get exact result.`
      );
    }
  }

  private clearHooksCounter = (registered: RegisteredFunction) => {
    if ("hooksCounter" in registered) {
      registered.hooksCounter = {};
    }
  };

  private clearUsecontextHooks = (registered: RegisteredFunction) => {
    if (
      "hooks" in registered &&
      registered.hooks &&
      registered.hooks.useContext
    ) {
      registered.hooks.useContext = [];
    }
  };

  public enableDataTestIdInheritance(excludeNotMockedElements?: boolean) {
    this.dataTestIdInheritance = true;
    this.excludeNotMockedElements = excludeNotMockedElements;
  }
  public disableDataTestIdInheritance() {
    this.dataTestIdInheritance = false;
  }

  private findByParent(
    item: RegisteredFunction | null,
    parent: OptionsParent | null
  ): boolean {
    return parent === null
      ? item === null
      : item
      ? (parent.dataTestId === undefined
          ? true
          : item.current.dataTestId === parent.dataTestId) &&
        (parent.name ? item.current.name === parent.name : true) &&
        (parent.nthChild ? item.current.nthChild === parent.nthChild : true) &&
        (parent.parent === undefined
          ? true
          : this.findByParent(item.parent, parent.parent)) &&
        (parent.relativePath
          ? item.current.relativePath === parent.relativePath
          : true)
      : false;
  }

  public functionCalled({
    args,
    dataTestId,
    jestFn,
    name,
    nthChild,
    originMock,
    parent,
    relativePath
  }: FunctionCalled) {
    if (!parent) {
      parent = this.activeFunction.length
        ? this.activeFunction[this.activeFunction.length - 1]
        : null;
    }

    if (
      dataTestId === null &&
      this.isDataTestIdInherited &&
      (!this.isNotMockedElementExcluded || parent?.current.originMock)
    ) {
      dataTestId = parent?.current.dataTestId || null;
    }

    const registered = this.getRegistered({
      dataTestId,
      name,
      nthChild,
      parent: parent || null,
      relativePath
    });

    if (registered) {
      registered.calls.push({
        args: [...args],
        stats: { time: 0 }
      });
      this.clearHooksCounter(registered);
      this.clearUsecontextHooks(registered);
      this.unregisterAllHooks(registered);
      this.activeFunction.push(registered);

      return {
        registered,
        index: registered.calls.length - 1
      };
    } else {
      const current = {
        dataTestId,
        name,
        nthChild,
        originMock,
        relativePath
      };

      const registered: RegisteredFunction = {
        calls: [
          {
            args: [...args],
            stats: { time: 0 }
          }
        ],
        current,
        jestFn,
        parent: parent || null
      };

      this.activeFunction.push(registered);

      this.registeredFunctions.push(registered);

      return { registered, index: 0 };
    }
  }

  public functionExecuted({
    children,
    index,
    registered,
    result,
    time
  }: FunctionExecuted) {
    registered.calls[index].result = result;
    registered.calls[index].stats.time = time;

    if (!children.length) {
      this.activeFunction.pop();
    } else {
      this.activeFunction[this.activeFunction.length - 1].children = children;
    }

    const parent = registered.parent;
    const parentIndex = parent ? this.activeFunction.indexOf(parent) : -1;

    if (
      parent &&
      parentIndex !== -1 &&
      "children" in parent &&
      parent.children
    ) {
      parent.children.shift();
    }

    if (
      parent &&
      parentIndex !== -1 &&
      "children" in parent &&
      parent.children &&
      !parent.children.length
    ) {
      delete parent!.children;
      this.activeFunction.splice(parentIndex, 1);
    }
  }

  public getActiveFunction() {
    return this.activeFunction.length
      ? this.activeFunction[this.activeFunction.length - 1]
      : undefined;
  }

  public getAllDataFor(
    nameOrOptions: string | OptionsWithName,
    options?: Options
  ) {
    const name =
      typeof nameOrOptions === "string" ? nameOrOptions : nameOrOptions.name;
    if (typeof nameOrOptions === "object") {
      options = nameOrOptions;
    }

    const registered = this.registeredFunctions.filter(
      (item) =>
        (options?.dataTestId === undefined ||
          item.current.dataTestId === options.dataTestId) &&
        (name === undefined || item.current.name === name) &&
        (options?.nthChild === undefined ||
          item.current.nthChild === options.nthChild) &&
        (options?.parent === undefined ||
          this.findByParent(item.parent, options.parent)) &&
        (options?.relativePath === undefined ||
          item.current.relativePath === options.relativePath)
    );

    return registered;
  }

  public getCallCount(name: string, options?: Options) {
    const registered = this.getAllDataFor(name, options);

    this.checkRegisteredLength(name, registered, options);

    return registered.length
      ? registered.reduceRight(
          (previousValue, item) =>
            previousValue +
            ("lifecycle" in item &&
            item.lifecycle &&
            item.lifecycle.render &&
            item.lifecycle.render.mock
              ? item.lifecycle.render.mock.calls.length
              : item.calls.length),
          0
        )
      : undefined;
  }

  public getDataFor(
    name: string,
    options?: Options
  ): RegisteredFunction | undefined {
    const registered = this.getAllDataFor(name, options);

    this.checkRegisteredLength(name, registered, options);

    return registered.length ? registered[0] : undefined;
  }

  private getHookWithoutScope<K extends keyof ReactHooksTypes>(
    registered: RegisteredFunction,
    hookType: K,
    sequence: number
  ): ReactHooksTypes<unknown>[K] | undefined {
    const filtered = this.getOnlyRegisteredHooks(registered);

    return "hooks" in filtered &&
      filtered.hooks &&
      hookType in filtered.hooks &&
      filtered.hooks[hookType] &&
      sequence > 0 &&
      sequence <= filtered.hooks[hookType]!.length
      ? this.removeHelperProps<K>(
          filtered.hooks[hookType]![sequence - 1] as ReactHooksTypes[K]
        )
      : undefined;
  }

  private getIdentityFromParent(
    parent: RegisteredFunction | null
  ): IdentityWithParent | null {
    if (parent === null) {
      return null;
    }

    return {
      dataTestId: parent.current.dataTestId,
      name: parent.current.name,
      ...(parent.current.nthChild ? { nthChild: parent.current.nthChild } : {}),
      originMock: parent.current.originMock,
      parent: this.getIdentityFromParent(parent.parent),
      relativePath: parent.current.relativePath
    };
  }

  public getOnlyRegisteredHooks<K extends keyof ReactHooksTypes>(
    registered: RegisteredFunction
  ): RegisteredFunction {
    if (!("hooks" in registered)) {
      return { ...registered };
    }

    const filteredHooks = {};

    for (let key in registered.hooks) {
      filteredHooks[key] = (
        registered.hooks[key] as ReactHooksTypes[K][]
      ).filter((item) => item.isRegistered);
    }

    return {
      ...registered,
      hooks: filteredHooks
    };
  }

  private getOnlyRegisteredHooksByType<K extends keyof ReactHooksTypes>(
    registered: RegisteredFunction,
    hookType: K
  ) {
    if (
      !(
        "hooks" in registered &&
        registered.hooks &&
        hookType in registered.hooks
      )
    ) {
      return undefined;
    }

    return (registered.hooks[hookType] as ReactHooksTypes[K][]).filter(
      (item) => item.isRegistered
    );
  }

  public getReactHooks(
    componentName: string,
    options?: Options
  ): GetAllHooks | undefined;

  public getReactHooks(componentName: string, options?: Options) {
    const registered = this.getDataFor(componentName, options);

    if (!registered) {
      return undefined;
    }

    return {
      getAll: (hookType?: keyof ReactHooksTypes) => {
        const filtered = this.getOnlyRegisteredHooks(registered);

        return "hooks" in filtered && filtered.hooks
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
      getUseReducer: (sequence: number) =>
        this.getStateHelper(registered, sequence, "useReducer"),
      getUseState: (sequence: number) =>
        this.getStateHelper(registered, sequence, "useState")
    };
  }

  public getReactLifecycle(componentName: string, options?: Options) {
    const registered = this.getDataFor(componentName, options);

    return registered ? registered.lifecycle : undefined;
  }

  public getRegistered({
    dataTestId,
    name,
    nthChild,
    parent,
    relativePath
  }: GetRegistered) {
    return this.registeredFunctions.find(
      (item) =>
        item.current.dataTestId === dataTestId &&
        item.current.name === name &&
        item.current.nthChild === nthChild &&
        item.parent === parent &&
        item.current.relativePath === relativePath
    );
  }

  private getSequenceNumber(
    registered: RegisteredFunction,
    hookType: keyof ReactHooksTypes
  ) {
    if (!("hooksCounter" in registered)) {
      registered.hooksCounter = {};
    }

    if (!(hookType in registered.hooksCounter!)) {
      registered.hooksCounter![hookType] = 1;
    }

    return registered.hooksCounter![hookType]!;
  }

  private getStateHelper = (
    registered: RegisteredFunction,
    sequence: number,
    hookType: "useReducer" | "useState"
  ) => {
    let stateIndex = 0;

    return {
      getState: (stateSequence: number) => {
        const hooks = this.getOnlyRegisteredHooksByType(registered, hookType);

        return hooks &&
          hooks &&
          sequence > 0 &&
          sequence <= hooks.length &&
          hooks[sequence - 1].state &&
          stateSequence > 0 &&
          stateSequence <= hooks[sequence - 1].state.length
          ? hooks[sequence - 1].state[stateSequence - 1]
          : undefined;
      },
      next: () => {
        const hook = this.getHookWithoutScope(registered, hookType, sequence);
        const result = hook
          ? hook.state.slice(stateIndex, hook.state.length)
          : [];

        if (hook) {
          stateIndex = hook.state.length;
        }

        return result;
      },
      reset: () => {
        stateIndex = 0;
      }
    };
  };

  public getStats(
    nameOrOptions?: string | GetStatsOptions,
    options?: GetStatsOptions
  ): Stats[] | Stats | undefined {
    if (nameOrOptions === undefined || typeof nameOrOptions !== "string") {
      return this.registeredFunctions.map((registered) =>
        this.makeStats(registered, nameOrOptions)
      );
    }

    const stats = this.getAllDataFor(nameOrOptions, options).map((registered) =>
      this.makeStats(registered, options)
    );

    return stats.length ? (stats.length === 1 ? stats[0] : stats) : undefined;
  }

  public hasRegistered(name: string, options?: Options) {
    return this.getDataFor(name, options) !== undefined;
  }

  private makeStats(
    registered: RegisteredFunction,
    options?: GetStatsOptions
  ): Stats {
    return {
      calls: registered.calls.map((call) => ({
        args: undefined,
        stats: this.resolveStats(call.stats, options)
      })),
      dataTestId: registered.current.dataTestId,
      name: registered.current.name,
      ...(registered.current.nthChild
        ? { nthChild: registered.current.nthChild }
        : {}),
      numberOfCalls: registered.calls.length,
      parent: this.getIdentityFromParent(registered.parent),
      relativePath: registered.current.relativePath
    };
  }

  private registerHook<K extends keyof ReactHooksTypes>(
    registered: RegisteredFunction,
    hookType: K
  ) {
    if (!("hooks" in registered)) {
      registered.hooks = {};
    }

    if (!(hookType in registered.hooks!)) {
      registered.hooks![hookType] = [];
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

    registered.hooksCounter![hookType] = sequence + 1;
    return hooks[sequence - 1];
  }

  public registerHookWithAction<K extends "useEffect" | "useCallback">({
    componentName,
    hookType,
    props,
    relativePath
  }: RegisterUseWithAction<K>) {
    const active = this.getActiveFunction();
    const registered = this.getRegistered({
      dataTestId: active?.current.dataTestId || null,
      name: componentName,
      nthChild: active?.current.nthChild,
      parent: active?.parent || null,
      relativePath
    });

    if (!registered) {
      return undefined;
    }

    this.registerHook(registered, hookType);

    const existingHook = (
      registered.hooks![hookType] as ReactHooksTypes[K][]
    ).find((item) => item._originScope === props._originScope);

    const sequence = this.getSequenceNumber(registered, hookType);

    if (existingHook) {
      existingHook.isRegistered = true;
      registered.hooksCounter![hookType] = sequence + 1;
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
    implementation: { render, setState }
  }: RegisterReactClass) {
    const registered = this.getActiveFunction()!;

    if (!("lifecycle" in registered)) {
      registered.lifecycle = {};
    }

    if (!registered.lifecycle!.render) {
      registered.lifecycle!.render = jest.fn(render);
    }

    if (!registered.lifecycle!.setState) {
      registered.lifecycle!.setState = jest.fn(setState);
    }

    return registered.lifecycle;
  }

  public registerUseContext({
    componentName,
    props,
    relativePath
  }: RegisterUseContext) {
    const hookType = "useContext";
    const active = this.getActiveFunction();
    const registered = this.getRegistered({
      dataTestId: active?.current.dataTestId || null,
      name: componentName,
      nthChild: active?.current.nthChild,
      parent: active?.parent || null,
      relativePath
    });

    if (!registered) {
      return undefined;
    }

    this.registerHook(registered, hookType);

    registered.hooks!.useContext!.push(props);
  }

  public registerUseMemo({
    componentName,
    props,
    relativePath
  }: RegisterUseMemo) {
    const hookType = "useMemo";
    const active = this.getActiveFunction();
    const registered = this.getDataFor(componentName, {
      dataTestId: active?.current.dataTestId,
      nthChild: active?.current.nthChild,
      parent: active?.parent || null,
      relativePath
    });

    if (!registered) {
      return undefined;
    }

    this.registerHook(registered, hookType);

    const existingHook = (registered.hooks![
      hookType
    ] as ReactHooksTypes[typeof hookType][])!.find(
      (item) => item._originScope === props._originScope
    );

    const sequence = this.getSequenceNumber(registered, hookType);

    if (existingHook) {
      existingHook.isRegistered = true;
      registered.hooksCounter![hookType] = sequence + 1;
      return existingHook;
    }

    return this.registerHookProps({
      registered,
      hooks: registered.hooks![hookType] as ReactHooksTypes[typeof hookType][],
      hookType,
      props,
      sequence
    });
  }

  public registerUseReducer({
    componentName,
    props,
    relativePath
  }: RegisterUseReducer) {
    const hookType = "useReducer";
    const active = this.getActiveFunction();
    const registered = this.getRegistered({
      dataTestId: active?.current.dataTestId || null,
      name: componentName,
      nthChild: active?.current.nthChild,
      parent: active?.parent || null,
      relativePath
    });

    if (!registered) {
      return undefined;
    }

    this.registerHook(registered, hookType);

    const existingHook = registered.hooks![hookType]!.find(
      (item) => item._originReducer === props._originReducer
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
    const active = this.getActiveFunction();
    const registered = this.getRegistered({
      dataTestId: active?.current.dataTestId || null,
      name: componentName,
      nthChild: active?.current.nthChild,
      parent: active?.parent || null,
      relativePath
    });

    if (!registered) {
      return undefined;
    }

    this.registerHook(registered, hookType);

    const existingHook = registered.hooks![hookType]!.find(
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

  public registerUseState({
    componentName,
    props,
    relativePath
  }: RegisterUseState) {
    const hookType = "useState";
    const active = this.getActiveFunction();
    const registered = this.getRegistered({
      dataTestId: active?.current.dataTestId || null,
      name: componentName,
      nthChild: active?.current.nthChild,
      parent: active?.parent || null,
      relativePath
    });

    if (!registered) {
      return undefined;
    }

    this.registerHook(registered, hookType);

    const existingHook = registered.hooks![hookType]!.find(
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

  private removeHelperProps<K extends keyof ReactHooksTypes>(
    item: ReactHooksTypes[K]
  ) {
    const result: ReactHooksTypes<unknown>[K] = {
      ...item
    };

    if (result["_originReducer"]) {
      delete result["_originReducer"];
    }

    if (result["_originScope"]) {
      delete result["_originScope"];
    }

    if (result["_originState"]) {
      delete result["_originState"];
    }

    delete result["isRegistered"];

    return result;
  }

  private removePropsFromHook<K extends keyof ReactHooksTypes>(
    hooks: ReactHooksTypes[K][]
  ) {
    return hooks
      .filter((item) => item.isRegistered)
      .map((item) => this.removeHelperProps(item));
  }

  public removePropsFromAllHooks(hooks: ReactHooks) {
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

    this.registeredFunctions.splice(
      this.registeredFunctions.indexOf(registered),
      1
    );
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
    if (!("hooks" in registered)) {
      return;
    }

    for (let hookType in registered.hooks) {
      for (let hook of registered.hooks[hookType]) {
        hook.isRegistered = false;
      }
    }
  }
}
