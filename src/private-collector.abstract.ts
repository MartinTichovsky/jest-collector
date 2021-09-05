import { ComponentHooks, ComponentHooksTypes } from "./private-collector.types";

export abstract class ControllerAbstract {
  public abstract getFunctionCallCount(
    functionName: string,
    dataTestId?: string
  ): number;

  public abstract getRegisteredReactComponentRenders(
    componentName: string,
    dataTestId?: string
  ): ComponentHooks[] | undefined;

  public abstract getRegisteredReactComponentHooks<
    K extends keyof ComponentHooksTypes
  >(
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
    | undefined;

  public abstract getUnregisteredReactComponentHooks<
    K extends keyof ComponentHooksTypes
  >(
    componentName: string,
    type: K
  ):
    | {
        getHook: (hookNumber: number) => ComponentHooksTypes[K] | undefined;
      }
    | undefined;

  public abstract reset(): void;
}
