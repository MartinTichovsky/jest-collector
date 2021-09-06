import {
  ComponentHooks,
  ComponentHooksTypes,
  RegisteredFunction
} from "./private-collector.types";

export abstract class ControllerAbstract {
  public abstract getFunctionCallCount(
    functionName: string,
    dataTestId?: string
  ): number | undefined;

  public abstract getRegisteredFunction(
    name: string,
    dataTestId?: string
  ): RegisteredFunction | undefined;

  public abstract getRegisteredReactComponent(
    componentName: string,
    dataTestId?: string
  ): ComponentHooks[] | undefined;

  public abstract getRegisteredReactComponentHooks<
    K extends keyof ComponentHooksTypes
  >(
    componentName: string,
    hookType: K,
    dataTestId?: string
  ): {
    getRender: (renderSequence: number) => ComponentHooks[K] | undefined;
    getRenderHooks: (
      renderSequence: number,
      hookSequence: number
    ) => ComponentHooksTypes[K] | undefined;
  };

  public abstract getUnregisteredReactComponent(
    componentName: string
  ): ComponentHooks | undefined;

  public abstract getUnregisteredReactComponentHooks<
    K extends keyof ComponentHooksTypes
  >(
    componentName: string,
    hookType: K
  ): {
    getHook: (hookSequence: number) => ComponentHooksTypes[K] | undefined;
  };

  public abstract hasRegisteredComponent(
    componentName: string,
    dataTestId?: string
  ): boolean;

  public abstract hasUnregisteredComponent(componentName: string): boolean;

  public abstract reset(): void;
}
