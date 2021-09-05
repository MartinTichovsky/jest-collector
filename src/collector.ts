import { PrivateCollector } from "./private-collector";
import { ControllerAbstract } from "./private-collector.abstract";
import { ComponentHooks, ComponentHooksTypes } from "./private-collector.types";

export class Collector extends ControllerAbstract {
  constructor(private privateCollector: PrivateCollector) {
    super();
  }

  public getFunctionCallCount(functionName: string, dataTestId?: string) {
    return this.privateCollector.getFunctionCallCount(functionName, dataTestId);
  }

  public getRegisteredReactComponentRenders(
    componentName: string,
    dataTestId?: string
  ) {
    return this.privateCollector.getRegisteredReactComponentRenders(
      componentName,
      dataTestId
    );
  }

  public getRegisteredReactComponentHooks<K extends keyof ComponentHooksTypes>(
    componentName: string,
    type: K,
    dataTestId?: string
  ):
    | {
        getRender: (renderNumber: number) => ComponentHooks[K] | undefined;
        getRenderHooks: (
          renderNumber: number,
          hookNumber: number
        ) => ComponentHooksTypes[K] | undefined;
      }
    | undefined {
    return this.privateCollector.getRegisteredReactComponentHooks(
      componentName,
      type,
      dataTestId
    );
  }

  public getUnregisteredReactComponentHooks<
    K extends keyof ComponentHooksTypes
  >(
    componentName: string,
    type: K
  ):
    | {
        getHook: (hookNumber: number) => ComponentHooksTypes[K] | undefined;
      }
    | undefined {
    return this.privateCollector.getUnregisteredReactComponentHooks(
      componentName,
      type
    );
  }

  public reset() {
    this.privateCollector.reset();
  }
}
