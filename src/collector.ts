import { PrivateCollector } from "./private-collector";
import { CollectorAbstract, GetAllHooks } from "./private-collector.abstract";
import {
  GetStatsOptions,
  Options,
  OptionsWithName,
  ReactClassLifecycle,
  RegisteredFunction,
  Stats
} from "./private-collector.types";

export class Collector extends CollectorAbstract {
  constructor(private privateCollector: PrivateCollector) {
    super();
  }

  /**
   * Enable data-testid inheritance.
   *
   * @param {boolean} excludeNotMockedElements If it is set to true, not mocked components will not pass data-testid
   */
  public enableDataTestIdInheritance(excludeNotMockedElements?: boolean): void {
    this.privateCollector.enableDataTestIdInheritance(excludeNotMockedElements);
  }

  /**
   * Disable data-testid inheritance.
   */
  public disableDataTestIdInheritance(): void {
    this.privateCollector.disableDataTestIdInheritance();
  }

  /**
   * Get the number of calls for a function or a React component.
   *
   * @param {String} name Name of a function or a React component
   * @param {object} options Options
   * @returns {number|undefined} Number of all calls or undefined
   */
  public getCallCount(name: string, options?: Options): number | undefined {
    return this.privateCollector.getCallCount(name, options);
  }

  /**
   * Get the data for a component. This function is the same as `getDataFor`.
   * If more components with the same name or the name and options are detected,
   * a warning will be logged in the console. Use more option properties to get
   * exact result.
   *
   * @param {string} componentName Name of a component
   * @param {object} options Options
   * @returns {object|undefined} Data or undefined
   */
  public getComponentData(
    componentName: string,
    options?: Options
  ): RegisteredFunction<unknown> | undefined {
    return this.getDataFor(componentName, options);
  }

  /**
   * Get all data for a function or a React component. If there will
   * be no options specified, all registered functions/components will
   * be returned.
   *
   * @param {object} options Options where the name do not have to be defined
   * @returns {array} An array of data
   */
  public getAllDataFor(options: OptionsWithName): RegisteredFunction<unknown>[];

  /**
   * Get all data for a function or a React component. If there will
   * be more data for a name or specified options, all of them will
   * be returned.
   *
   * @param {string} name Name of a function or a React component
   * @param {object} options Options
   * @returns {array} An array of data
   */
  public getAllDataFor(
    name: string,
    options?: Options
  ): RegisteredFunction<unknown>[];

  /* @implementation */
  public getAllDataFor(
    nameOrOptions: string | OptionsWithName,
    options?: Options
  ): RegisteredFunction<unknown>[] {
    return this.privateCollector.getAllDataFor(nameOrOptions, options);
  }

  /**
   * Get the data for a function or a React component. If more components
   * with the same name or name and options are detected, a warning will
   * be logged. Use option properties to get the exact result.
   *
   * @param {string} name Name of a function or a React component
   * @param {object} options Options
   * @returns {object|undefined} Data or undefined
   */
  public getDataFor(
    name: string,
    options?: Options
  ): RegisteredFunction<unknown> | undefined {
    const registered = this.privateCollector.getDataFor(name, options);

    if (!(registered && "hooks" in registered)) {
      return registered;
    }

    const filtered = this.privateCollector.getOnlyRegisteredHooks(registered);
    delete (filtered as RegisteredFunction<unknown>)["hooksCounter"];

    filtered.hooks = this.privateCollector.removePropsFromAllHooks(
      filtered!.hooks!
    );

    return filtered;
  }

  /**
   * Get React hooks of a component.
   *
   * @param {string} componentName Name of a component
   * @param {object} options Options
   * @returns {object|undefined} An object with methods or undefined
   */
  public getReactHooks(
    componentName: string,
    options?: Options
  ): GetAllHooks | undefined {
    return this.privateCollector.getReactHooks(componentName, options);
  }

  /**
   * Get React lifecycle for a React class component.
   *
   * @param {string} componentName Name of a component
   * @param {object} options Options
   * @returns {object|undefined} An object with lifecycle properties and their results or undefined
   */
  public getReactLifecycle(
    componentName: string,
    options?: Options
  ): ReactClassLifecycle | undefined {
    return this.privateCollector.getReactLifecycle(componentName, options);
  }

  /**
   * Get all statistics of the registered functions.
   *
   * @returns {array} An array of statistics sorted in order of how they were called
   */
  public getStats(): Stats[];

  /**
   * Get all statistics of the registered functions.
   *
   * @param {object} options Options
   * @returns {array} An array of statistics sorted in order of how they were called
   */
  public getStats(options?: GetStatsOptions): Stats[];

  /**
   * Get statistics of a specfic function.
   *
   * @param {string} name Name of a function or a React component
   * @param {object} options Options
   * @returns {object} An object with statistics
   */
  public getStats(
    name: string,
    options?: GetStatsOptions
  ): Stats[] | Stats | undefined;

  /* @implementation */
  public getStats(
    nameOrOptions?: string | GetStatsOptions,
    options?: GetStatsOptions
  ): Stats[] | Stats | undefined {
    return this.privateCollector.getStats(nameOrOptions, options);
  }

  /**
   * Checking if the collector has registered a specific component.
   * The function is the same as `hasRegistered`.
   *
   * @param {string} componentName Name of a component
   * @param {object} options Options
   * @returns {boolean} True if the component is registered in the collector
   */
  public hasComponent(componentName: string, options?: Options): boolean {
    return this.hasRegistered(componentName, options);
  }

  /**
   * Checking if the collector has registered a specific function or a React component.
   *
   * @param {string} name Name of a function or a React component
   * @param {object} options Options
   * @returns {boolean} True if the function is registered in the collector
   */
  public hasRegistered(name: string, options?: Options): boolean {
    return this.privateCollector.hasRegistered(name, options);
  }

  /**
   * Reset all data in the collector and set everything to default.
   *
   * @param name Name of a function or a React component
   * @param options Options
   */
  public reset(): void;

  /**
   * Delete the data for a specific function or a React component. The function
   * will be no more registered in the collector until the next render.
   *
   * @param name Name of a function or a React component
   * @param options Options
   */
  public reset(name: string, options?: Options): void;

  /* @implementation */
  public reset(name?: string, options?: Options): void {
    this.privateCollector.reset(name, options);
  }
}
