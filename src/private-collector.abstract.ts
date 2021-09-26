import {
  GetStatsOptions,
  Options,
  ReactClassLifecycle,
  ReactHooks,
  ReactHooksTypes,
  RegisteredFunction,
  Stats
} from "./private-collector.types";

export abstract class GetAllHooks {
  /**
   * Get all hooks.
   *
   * @returns {object} An object with hooks
   */
  public abstract getAll(): ReactHooks<unknown> | undefined;

  /**
   * Get only one specific hook and its results.
   *
   * @param {string} hookType Hook type
   * @returns {array} An array of hook results
   */
  public abstract getAll<K extends keyof ReactHooksTypes>(
    hookType: K
  ): ReactHooks<unknown>[K] | undefined;

  /**
   * Get one specific hook result.
   *
   * @param {string} hookType Hook type
   * @param {number} sequence The number of expected sequence of the hook during the render process. Sequence starts from 1
   * @returns A hook result
   */
  public abstract getHook<K extends keyof ReactHooksTypes>(
    hookType: K,
    sequence: number
  ): ReactHooksTypes<unknown>[K] | undefined;

  /**
   * Get all results for a specific hook.
   *
   * @param {string} hookType Hook type
   * @returns {object} An object with get method to get one specific result
   */
  public abstract getHooksByType<K extends keyof ReactHooksTypes>(
    hookType: K
  ): GetHooksByType<K>;

  /**
   * Get an object with methods for the state results.
   *
   * @param {number} sequence The number of the expected sequence of useReducer during the render process. Sequence starts from 1
   * @returns {object} An object with methods for retrieving useReducer results
   */
  public abstract getUseReducer(sequence: number): GetState;

  /**
   * Get an object with methods for the state results
   *
   * @param {number} sequence The number of the expected sequence of useState during the render process. Sequence starts from 1
   * @returns {object} An object with methods for retrieving useState results
   */
  public abstract getUseState(sequence: number): GetState;
}

abstract class GetHooksByType<K extends keyof ReactHooksTypes> {
  public abstract get(
    sequence: number
  ): ReactHooksTypes<unknown>[K] | undefined;
}

abstract class GetState {
  /**
   * Get one specific state result.
   *
   * @param stateSequence THe number of the expected sequence of the state during the render process. Sequence starts from 1
   * @returns {unknown} A useState result
   */
  public abstract getState(stateSequence: number): unknown | undefined;

  /**
   * Return all states since beginning or the last call of this method.
   * The method will reset the counter and the next call of the method
   * will return everything since beginning.
   *
   * @returns {array} An array of useState results
   */
  public abstract next(): unknown[];

  /**
   * Reset the counter.
   */
  public abstract reset(): void;
}

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
  ): GetAllHooks | undefined;

  public abstract getReactLifecycle(
    componentName: string,
    options?: Options
  ): ReactClassLifecycle | undefined;

  public abstract hasRegistered(name: string, options?: Options): boolean;

  public abstract getStats(
    nameOrOptions?: string | GetStatsOptions,
    options?: GetStatsOptions
  ): Stats[] | Stats | undefined;

  public abstract reset(name?: string, options?: Options): void;
}
