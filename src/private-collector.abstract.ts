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
    getAll: <K extends keyof ComponentHooksTypes>(
      hookType?: K
    ) =>
      | (K extends undefined ? ComponentHooks<never> : ComponentHooks<never>[K])
      | undefined;
    getHook: <K extends keyof ComponentHooksTypes>(
      hookType: K,
      sequence: number
    ) => ComponentHooksTypes<never>[K] | undefined;
    getHooksByType: <K extends keyof ComponentHooksTypes>(
      hookType: K
    ) => {
      get: (sequence: number) => ComponentHooksTypes<never>[K] | undefined;
    };
    getUseState: (sequence: number) => {
      getState: (stateSequence: number) => unknown | undefined;
      next: () => unknown[];
      reset: () => void;
    };
  };

  public abstract hasFunction(
    componentName: string,
    options?: Options
  ): boolean;

  public abstract reset(): void;
}
