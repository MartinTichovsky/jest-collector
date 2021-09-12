import {
  GetStatsOptions,
  Options,
  ReactClassLifecycle,
  ReactHooks,
  ReactHooksTypes,
  RegisteredFunction,
  Stats
} from "./private-collector.types";

export abstract class CollectorAbstract {
  public abstract enableDataTestIdInheritance(
    excludeNotMockedElements?: boolean
  ): void;
  public abstract disableDataTestIdInheritance(): void;

  public abstract getCallCount(
    name: string,
    options?: Options
  ): number | undefined;

  public abstract getAllDataFor(
    name: string,
    options?: Options
  ): RegisteredFunction<unknown>[] | undefined;

  public abstract getDataFor(
    name: string,
    options?: Options
  ): RegisteredFunction<unknown> | undefined;

  public abstract getReactHooks(
    componentName: string,
    options?: Options
  ): {
    getAll: <K extends keyof ReactHooksTypes>(
      hookType?: K
    ) =>
      | (K extends undefined ? ReactHooks<unknown> : ReactHooks<unknown>[K])
      | undefined;
    getHook: <K extends keyof ReactHooksTypes>(
      hookType: K,
      sequence: number
    ) => ReactHooksTypes<unknown>[K] | undefined;
    getHooksByType: <K extends keyof ReactHooksTypes>(
      hookType: K
    ) => {
      get: (sequence: number) => ReactHooksTypes<unknown>[K] | undefined;
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

  public abstract hasRegistered(
    componentName: string,
    options?: Options
  ): boolean;

  public abstract getStats(
    nameOrOptions?: string | GetStatsOptions,
    options?: GetStatsOptions
  ): Stats[] | Stats | undefined;

  public abstract reset(name?: string, options?: Options): void;
}
