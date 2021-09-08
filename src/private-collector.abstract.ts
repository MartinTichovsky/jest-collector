import {
  Options,
  ReactClassLifecycle,
  ReactHooks,
  ReactHooksTypes,
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

  public abstract getReactHooks(
    componentName: string,
    options?: Options
  ): {
    getAll: <K extends keyof ReactHooksTypes>(
      hookType?: K
    ) =>
      | (K extends undefined ? ReactHooks<never> : ReactHooks<never>[K])
      | undefined;
    getHook: <K extends keyof ReactHooksTypes>(
      hookType: K,
      sequence: number
    ) => ReactHooksTypes<never>[K] | undefined;
    getHooksByType: <K extends keyof ReactHooksTypes>(
      hookType: K
    ) => {
      get: (sequence: number) => ReactHooksTypes<never>[K] | undefined;
    };
    getUseState: (sequence: number) => {
      getState: (stateSequence: number) => unknown | undefined;
      next: () => unknown[];
      reset: () => void;
    };
  };

  public abstract getReactLifecycle(
    componentName: string,
    options?: Options
  ): ReactClassLifecycle | undefined;

  public abstract hasFunction(
    componentName: string,
    options?: Options
  ): boolean;

  public abstract reset(name?: string, options?: Options): void;
}
