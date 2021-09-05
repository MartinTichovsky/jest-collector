import { ControllerAbstract } from "./private-collector.abstract";
import {
  ComponentHooks,
  ComponentHooksTypes,
  FunctionExecuted,
  HookCallback,
  HookEffect,
  HookResult,
  HookState,
  RegisterFunction,
  SetHook
} from "./private-collector.types";

export class PrivateCollector extends ControllerAbstract {
  registeredFunctions: {
    [key: string]: {
      call: { args: any; hooks?: ComponentHooks; result?: any }[];
      dataTestId?: string;
      jestFn: jest.Mock;
    }[];
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
      )?.call.length || 0
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

  public getRegisteredReactComponentRenders(
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
    type: keyof ComponentHooksTypes,
    dataTestId?: string
  ) {
    if (
      !(componentName in this.registeredFunctions) ||
      !this.registeredFunctions[componentName].find(
        (render) => render.dataTestId === dataTestId
      )
    ) {
      return undefined;
    }

    return {
      getRender: (renderNumber: number) => {
        const existingItem = this.registeredFunctions[componentName].find(
          (item) => item.dataTestId === dataTestId
        );

        return !existingItem ||
          renderNumber < 1 ||
          existingItem.call.length < renderNumber ||
          !existingItem.call[renderNumber - 1].hooks ||
          !(type in existingItem.call[renderNumber - 1].hooks!)
          ? undefined
          : existingItem.call[renderNumber - 1].hooks![type];
      },
      getRenderHooks: (renderNumber: number, hookNumber: number) => {
        const existingItem = this.registeredFunctions[componentName].find(
          (item) => item.dataTestId === dataTestId
        );

        return !existingItem ||
          renderNumber < 1 ||
          hookNumber < 1 ||
          existingItem.call.length < renderNumber ||
          !existingItem.call[renderNumber - 1].hooks ||
          !(type in existingItem.call[renderNumber - 1].hooks!) ||
          existingItem.call[renderNumber - 1].hooks![type]!.length < hookNumber
          ? undefined
          : existingItem.call[renderNumber - 1].hooks![type]![hookNumber - 1];
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

  public getUnregisteredReactComponentHooks<
    K extends keyof ComponentHooksTypes
  >(componentName: string, type: K) {
    if (
      !(componentName in this.unregisteredReactComponents) ||
      !(type in this.unregisteredReactComponents[componentName])
    ) {
      return undefined;
    }

    return {
      getHook: (hookNumber: number) => {
        return !this.unregisteredReactComponents[componentName][type]!.length ||
          this.unregisteredReactComponents[componentName][type]!.length <=
            hookNumber
          ? undefined
          : this.unregisteredReactComponents[componentName][type]![
              hookNumber - 1
            ];
      }
    };
  }

  public registerHook<K extends keyof ComponentHooksTypes>(
    componentName: string,
    type: K,
    props: ComponentHooksTypes[K]
  ) {
    const existigItem = this.registeredFunctions[componentName]?.find(
      (item) => item.dataTestId === this.getActiveDataTestId(componentName)
    );

    if (!existigItem) {
      return this.addUnregisteredReactComponent(componentName, type, props);
    }

    const currentCall = existigItem.call[existigItem.call.length - 1];

    if (!currentCall.hooks) {
      currentCall.hooks = {};
    }

    if (!(type in currentCall.hooks!)) {
      currentCall.hooks[type] = [];
    }

    currentCall.hooks[type]!.push(props!);

    return {
      index: currentCall.hooks[type]!.length - 1,
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
    index,
    props,
    renderIndex,
    type
  }: SetHook) {
    if (componentName === undefined || index === undefined) {
      return;
    }

    // check unregistered integrity
    if (
      renderIndex === undefined &&
      (!(componentName in this.unregisteredReactComponents) ||
        !(type in this.unregisteredReactComponents[componentName]) ||
        !this.unregisteredReactComponents[componentName][type]!.length ||
        this.unregisteredReactComponents[componentName][type]!.length <= index)
    ) {
      return;
    }

    // push into unregistered component
    if (renderIndex === undefined) {
      this.unregisteredReactComponents[componentName][type]![index] = {
        ...this.unregisteredReactComponents[componentName][type]![index],
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
      !(type in existingItem.call[renderIndex].hooks!) ||
      !existingItem.call[renderIndex].hooks![type]!.length ||
      existingItem.call[renderIndex].hooks![type]!.length <= index
    ) {
      return;
    }

    existingItem.call[renderIndex].hooks![type]![index] = {
      ...existingItem.call[renderIndex].hooks![type]![index],
      ...props
    };
  }
}
