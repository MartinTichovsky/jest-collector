import { ControllerAbstract } from "./private-collector.abstract";
import {
  ComponentHooks,
  ComponentHooksTypes,
  FunctionExecuted,
  HookCallback,
  HookEffect,
  HookResult,
  HookState,
  RegisteredFunction,
  RegisterFunction,
  SetHook
} from "./private-collector.types";

export class PrivateCollector extends ControllerAbstract {
  registeredFunctions: {
    [key: string]: RegisteredFunction[];
  } = {};

  unregisteredReactComponents: {
    [key: string]: ComponentHooks;
  } = {};

  public activeDataTestId: { [key: string]: (string | undefined)[] } = {};

  memoizedStateCalls: {
    [key: string]: {
      dataTestId?: string;
      calls: Map<Function, any[]>;
    };
  } = {};

  private addUnregisteredReactComponent(
    componentName: string,
    type: keyof ComponentHooksTypes,
    props?: HookCallback | HookEffect | HookResult | HookState
  ) {
    if (!(componentName in this.unregisteredReactComponents)) {
      this.unregisteredReactComponents[componentName] = {};
    }

    if (!(type in this.unregisteredReactComponents[componentName])) {
      this.unregisteredReactComponents[componentName][type] = [];
    }

    this.unregisteredReactComponents[componentName][type]!.push(props || {});

    return {
      index: this.unregisteredReactComponents[componentName][type]!.length - 1,
      renderIndex: undefined
    };
  }

  public functionCalled({ args, dataTestId, jestFn, name }: RegisterFunction) {
    if (!(name in this.activeDataTestId)) {
      this.activeDataTestId[name] = [];
    }

    this.activeDataTestId[name].push(dataTestId);

    if (!(name in this.registeredFunctions)) {
      this.registeredFunctions[name] = [];
    }

    const existingItem = this.registeredFunctions[name].find(
      (item) => item.dataTestId === dataTestId
    );

    if (existingItem) {
      existingItem.call.push({ args });

      return existingItem.call.length - 1;
    } else {
      this.registeredFunctions[name].push({
        call: [{ args }],
        dataTestId,
        jestFn
      });

      return 0;
    }
  }

  public functionExecuted({
    name,
    dataTestId,
    index,
    result
  }: FunctionExecuted) {
    if (
      !(name in this.registeredFunctions) ||
      !(name in this.activeDataTestId)
    ) {
      return;
    }

    this.activeDataTestId[name] = this.activeDataTestId[name].slice(
      0,
      this.activeDataTestId[name].length - 1
    );

    const existingItem = this.registeredFunctions[name].find(
      (item) => item.dataTestId === dataTestId
    );

    if (existingItem && index < existingItem.call.length) {
      existingItem.call[index].result = result;
    }
  }

  public getActiveDataTestId(name: string) {
    return this.activeDataTestId[name]?.[
      this.activeDataTestId[name].length - 1
    ];
  }

  public getFunctionCallCount(functionName: string, dataTestId?: string) {
    return (
      this.registeredFunctions[functionName]?.find(
        (item) => item.dataTestId === dataTestId
      )?.call.length || undefined
    );
  }

  public getExistingSetStateMockedAction(
    componentName: string,
    setState: Function
  ) {
    const existingItem = this.registeredFunctions[componentName]?.find(
      (item) => item.dataTestId === this.getActiveDataTestId(componentName)
    );

    if (!existingItem) {
      return;
    }

    for (let call of existingItem.call) {
      if (!call.hooks?.["useState"]) {
        continue;
      }

      const existingStateItem = call.hooks["useState"]?.find(
        (item) => item.setState === setState
      );

      if (existingStateItem) {
        return existingStateItem.mockedSetState;
      }
    }
  }

  public getRegisteredFunction(name: string, dataTestId?: string) {
    if (!(name in this.registeredFunctions)) {
      return undefined;
    }

    return this.registeredFunctions[name].find(
      (item) => item.dataTestId === dataTestId
    );
  }

  public getRegisteredReactComponent(
    componentName: string,
    dataTestId?: string
  ) {
    if (!(componentName in this.registeredFunctions)) {
      return undefined;
    }

    return this.registeredFunctions[componentName]
      .find((item) => item.dataTestId === dataTestId)
      ?.call.map((call) => call?.hooks || {});
  }

  public getRegisteredReactComponentHooks(
    componentName: string,
    hookType: keyof ComponentHooksTypes,
    dataTestId?: string
  ) {
    const exists = componentName in this.registeredFunctions;

    return {
      getRender: (renderSequence: number) => {
        if (!exists) {
          return undefined;
        }

        const existingItem = this.registeredFunctions[componentName].find(
          (item) => item.dataTestId === dataTestId
        );

        return !existingItem ||
          renderSequence < 1 ||
          existingItem.call.length < renderSequence ||
          !existingItem.call[renderSequence - 1].hooks ||
          !(hookType in existingItem.call[renderSequence - 1].hooks!)
          ? undefined
          : existingItem.call[renderSequence - 1].hooks![hookType];
      },
      getRenderHooks: (renderSequence: number, hookSequence: number) => {
        if (!exists) {
          return undefined;
        }

        const existingItem = this.registeredFunctions[componentName].find(
          (item) => item.dataTestId === dataTestId
        );

        return !existingItem ||
          renderSequence < 1 ||
          hookSequence < 1 ||
          existingItem.call.length < renderSequence ||
          !existingItem.call[renderSequence - 1].hooks ||
          !(hookType in existingItem.call[renderSequence - 1].hooks!) ||
          existingItem.call[renderSequence - 1].hooks![hookType]!.length <
            hookSequence
          ? undefined
          : existingItem.call[renderSequence - 1].hooks![hookType]![
              hookSequence - 1
            ];
      }
    };
  }

  public getSetState(
    componentName: string,
    dataTestId?: string,
    orderNumber: number = 0
  ) {
    // if (!(componentName in this.registeredFunctions)) {
    //   return undefined;
    // }
    // const renders = this.registeredFunctions[componentName].filter(
    //   (render) => render.dataTestId === dataTestId
    // );
    // return renders?.[0]?.hooks?.["useState"]?.[orderNumber]?.mockedSetState;
  }

  public getUnregisteredReactComponent(componentName: string) {
    if (!(componentName in this.unregisteredReactComponents)) {
      return undefined;
    }

    return this.unregisteredReactComponents[componentName];
  }

  public getUnregisteredReactComponentHooks<
    K extends keyof ComponentHooksTypes
  >(componentName: string, hookType: K) {
    return {
      getHook: (hookNumber: number) => {
        return !(componentName in this.unregisteredReactComponents) ||
          !(hookType in this.unregisteredReactComponents[componentName]) ||
          !this.unregisteredReactComponents[componentName][hookType]!.length ||
          this.unregisteredReactComponents[componentName][hookType]!.length <
            hookNumber
          ? undefined
          : this.unregisteredReactComponents[componentName][hookType]![
              hookNumber - 1
            ];
      }
    };
  }

  public hasRegisteredComponent(componentName: string, dataTestId?: string) {
    return (
      componentName in this.registeredFunctions &&
      this.registeredFunctions[componentName].some(
        (item) => item.dataTestId === dataTestId
      )
    );
  }

  public hasUnregisteredComponent(componentName: string) {
    return componentName in this.unregisteredReactComponents;
  }

  public registerHook<K extends keyof ComponentHooksTypes>(
    componentName: string,
    hookType: K,
    props: ComponentHooksTypes[K]
  ) {
    const existigItem = this.registeredFunctions[componentName]?.find(
      (item) => item.dataTestId === this.getActiveDataTestId(componentName)
    );

    if (!existigItem) {
      return this.addUnregisteredReactComponent(componentName, hookType, props);
    }

    const currentCall = existigItem.call[existigItem.call.length - 1];

    if (!currentCall.hooks) {
      currentCall.hooks = {};
    }

    if (!(hookType in currentCall.hooks!)) {
      currentCall.hooks[hookType] = [];
    }

    currentCall.hooks[hookType]!.push(props!);

    return {
      index: currentCall.hooks[hookType]!.length - 1,
      renderIndex: existigItem.call.length - 1
    };
  }

  public reset() {
    this.activeDataTestId = {};
    this.registeredFunctions = {};
    this.unregisteredReactComponents = {};
  }

  public setHook({
    componentName,
    dataTestId,
    hookType,
    index,
    props,
    renderIndex
  }: SetHook) {
    if (componentName === undefined || index === undefined) {
      return;
    }

    // check unregistered integrity
    if (
      renderIndex === undefined &&
      (!(componentName in this.unregisteredReactComponents) ||
        !(hookType in this.unregisteredReactComponents[componentName]) ||
        !this.unregisteredReactComponents[componentName][hookType]!.length ||
        this.unregisteredReactComponents[componentName][hookType]!.length <=
          index)
    ) {
      return;
    }

    // push into unregistered component
    if (renderIndex === undefined) {
      this.unregisteredReactComponents[componentName][hookType]![index] = {
        ...this.unregisteredReactComponents[componentName][hookType]![index],
        ...props
      };
      return;
    }

    const existingItem = this.registeredFunctions[componentName]?.find(
      (item) => item.dataTestId === dataTestId
    );

    // check registered integrity
    if (
      !existingItem ||
      !existingItem.call.length ||
      existingItem.call.length <= renderIndex ||
      !existingItem.call[renderIndex].hooks ||
      !(hookType in existingItem.call[renderIndex].hooks!) ||
      !existingItem.call[renderIndex].hooks![hookType]!.length ||
      existingItem.call[renderIndex].hooks![hookType]!.length <= index
    ) {
      return;
    }

    existingItem.call[renderIndex].hooks![hookType]![index] = {
      ...existingItem.call[renderIndex].hooks![hookType]![index],
      ...props
    };
  }
}
