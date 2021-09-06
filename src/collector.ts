import { PrivateCollector } from "./private-collector";
import { ControllerAbstract } from "./private-collector.abstract";
import {
  ComponentHooks,
  ComponentHooksTypes,
  RegisteredFunction
} from "./private-collector.types";

export class Collector extends ControllerAbstract {
  constructor(private privateCollector: PrivateCollector) {
    super();
  }

  public getFunctionCallCount(functionName: string, dataTestId?: string) {
    return this.privateCollector.getFunctionCallCount(functionName, dataTestId);
  }

  public getRegisteredFunction(
    name: string,
    dataTestId?: string
  ): RegisteredFunction | undefined {
    return this.privateCollector.getRegisteredFunction(name, dataTestId);
  }

  public getRegisteredReactComponent(
    componentName: string,
    dataTestId?: string
  ) {
    return this.privateCollector.getRegisteredReactComponent(
      componentName,
      dataTestId
    );
  }

  public getRegisteredReactComponentHooks<K extends keyof ComponentHooksTypes>(
    componentName: string,
    hookType: K,
    dataTestId?: string
  ): {
    getRender: (renderNumber: number) => ComponentHooks[K] | undefined;
    getRenderHooks: (
      renderNumber: number,
      hookNumber: number
    ) => ComponentHooksTypes[K] | undefined;
  } {
    return this.privateCollector.getRegisteredReactComponentHooks(
      componentName,
      hookType,
      dataTestId
    );
  }

  public getUnregisteredReactComponent(componentName: string) {
    return this.privateCollector.getUnregisteredReactComponent(componentName);
  }

  public getUnregisteredReactComponentHooks<
    K extends keyof ComponentHooksTypes
  >(
    componentName: string,
    hookType: K
  ): {
    getHook: (hookNumber: number) => ComponentHooksTypes[K] | undefined;
  } {
    return this.privateCollector.getUnregisteredReactComponentHooks(
      componentName,
      hookType
    );
  }

  public hasRegisteredComponent(componentName: string, dataTestId?: string) {
    return this.privateCollector.hasRegisteredComponent(
      componentName,
      dataTestId
    );
  }

  public hasUnregisteredComponent(componentName: string) {
    return this.privateCollector.hasUnregisteredComponent(componentName);
  }

  public reset() {
    this.privateCollector.reset();
  }
}
