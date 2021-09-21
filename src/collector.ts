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
   * Enable data-testid inheritance
   *
   * @param {boolean} excludeNotMockedElements If is set to true, not mocked component will not pass the data-testid
   */
  public enableDataTestIdInheritance(excludeNotMockedElements?: boolean): void {
    this.privateCollector.enableDataTestIdInheritance(excludeNotMockedElements);
  }

  /**
   * Disable data-testid inheritance
   */
  public disableDataTestIdInheritance(): void {
    this.privateCollector.disableDataTestIdInheritance();
  }

  /**
   * Get number of calls for the function or a react component
   *
   * @param {String} name Name of a function or a react component
   * @param {object} options Options
   * @returns {number|undefined} Number of all calls or undefined
   */
  public getCallCount(name: string, options?: Options): number | undefined {
    return this.privateCollector.getCallCount(name, options);
  }

  /**
   * Get data for a component. The function is the same as `getDataFor`.
   * If more componets with the same name or name and options are detected,
   * a warning will be logged. Use more option properties to get exact result.
   *
   * @param {string} componentName Component name
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
   * Get all data for a function or a react component. If there will
   * be no options specified, all registered functions will be returned.
   *
   * @param {object} options Options where the name do not have to be defined
   * @returns {array} An array of data
   */
  public getAllDataFor(options: OptionsWithName): RegisteredFunction<unknown>[];

  /**
   * Get all data for a function or a react component. If there will
   * be more data for a name or specified options, all will be returned.
   *
   * @param {string} name Name of a function or a react component
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
   * Get data for a function or for a react component. If more componets
   * with the same name or name and options are detected, a warning will
   * be logged. Use more option properties to get exact result.
   *
   * @param {string} name Name of a function or a react component
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
   * Get react hooks of a component
   *
   * @param {string} componentName Component name
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
   * Get react lifecycle for a react class component
   *
   * @param {string} componentName Component name
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
   * Get all statistics of the registered functions
   *
   * @returns {array} An array of statistics sorted in order how the were called
   */
  public getStats(): Stats[];

  /**
   * Get all statistics of the registered functions
   *
   * @param {object} options Options
   * @returns {array} An array of statistics sorted in order how the were called
   */
  public getStats(options?: GetStatsOptions): Stats[];

  /**
   * Get statistics of a specfic function
   *
   * @param {string} name Name of a function or a react component
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
   * Checking if the collector has registered specific component.
   * The function is the same as `hasRegistered`.
   *
   * @param {string} componentName Component name
   * @param {object} options Options
   * @returns {boolean} True if the component is registered in the collector
   */
  public hasComponent(componentName: string, options?: Options): boolean {
    return this.hasRegistered(componentName, options);
  }

  /**
   * Checking if the collector has registered specific function.
   *
   * @param {string} name Name of a function or a react component
   * @param {object} options Options
   * @returns {boolean} True if the function is registered in the collector
   */
  public hasRegistered(name: string, options?: Options): boolean {
    return this.privateCollector.hasRegistered(name, options);
  }

  /**
   * Reset all data in the collector and set everything to default
   *
   * @param name Name of a function or a react component
   * @param options Options
   */
  public reset(): void;

  /**
   * Delete data for a specific function or a react component. The function
   * will be no more registered in the collector until next render.
   *
   * @param name Name of a function or a react component
   * @param options Options
   */
  public reset(name: string, options?: Options): void;

  /* @implementation */
  public reset(name?: string, options?: Options): void {
    this.privateCollector.reset(name, options);
  }
}
