import {
  ComponentHooks,
  ComponentHooksTypes,
  Options,
  RegisteredFunction
} from "./private-collector.types";

export abstract class ControllerAbstract {
  public abstract getCallCount(
    name: string,
    options?: Options
  ): number | undefined;

  public abstract getFunction(
    name: string,
    options?: Options
  ): RegisteredFunction | undefined;

  public abstract getReactComponentHooks(
    componentName: string,
    options?: Options
  ): {
    getAll: () => ComponentHooks | undefined;
    getHook: <K extends keyof ComponentHooksTypes>(
      hookType: K,
      sequence: number
    ) => ComponentHooksTypes[K] | undefined;
    getHooksByType: <K extends keyof ComponentHooksTypes>(
      hookType: K
    ) => {
      get: (sequence: number) => ComponentHooksTypes[K] | undefined;
    };
  };

  public abstract hasFunction(
    componentName: string,
    options?: Options
  ): boolean;

  public abstract reset(): void;
}
