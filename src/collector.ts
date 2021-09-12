import { PrivateCollector } from "./private-collector";
import { CollectorAbstract } from "./private-collector.abstract";
import {
  GetStatsOptions,
  Options,
  RegisteredFunction,
  Stats
} from "./private-collector.types";

export class Collector extends CollectorAbstract {
  constructor(private privateCollector: PrivateCollector) {
    super();
  }

  /**
   * Enable data=testid inheritance
   *
   * @param excludeNotMockedElements If is set to true, not mocked component will not pass the data-testid
   */
  public enableDataTestIdInheritance(excludeNotMockedElements?: boolean) {
    this.privateCollector.enableDataTestIdInheritance(excludeNotMockedElements);
  }

  /**
   *
   */
  public disableDataTestIdInheritance() {
    this.privateCollector.disableDataTestIdInheritance();
  }

  /**
   *
   * @param name
   * @param options
   * @returns
   */
  public getCallCount(name: string, options?: Options) {
    return this.privateCollector.getCallCount(name, options);
  }

  /**
   *
   * @param name Name of a function or a react component
   * @param options
   * @returns
   */
  public getComponentData(
    name: string,
    options?: Options
  ): RegisteredFunction<unknown> | undefined {
    return this.getDataFor(name, options);
  }

  /**
   *
   * @param name Name of a function or a react component
   * @param options
   * @returns
   */
  public getAllDataFor(name: string, options?: Options) {
    return this.privateCollector.getAllDataFor(name, options);
  }

  /**
   *
   * @param name Name of a function or a react component
   * @param options
   * @returns
   */
  public getDataFor(name: string, options?: Options) {
    const registered = this.privateCollector.getDataFor(name, options);

    if (!registered?.hooks) {
      return registered;
    }

    const filtered = this.privateCollector.getOnlyRegisteredHooks(registered);
    delete (filtered as RegisteredFunction<unknown>)["hooksCounter"];

    return {
      ...filtered,
      hooks: this.privateCollector.removePropsFromAllHooks(filtered!.hooks)
    } as RegisteredFunction<unknown> | undefined;
  }

  /**
   *
   * @param componentName
   * @param options
   * @returns
   */
  public getReactHooks(componentName: string, options?: Options) {
    return this.privateCollector.getReactHooks(componentName, options);
  }

  /**
   *
   * @param componentName
   * @param options
   * @returns
   */
  public getReactLifecycle(componentName: string, options?: Options) {
    return this.privateCollector.getReactLifecycle(componentName, options);
  }

  /**
   *
   */
  public getStats(): Stats[];
  /**
   *
   * @param options
   */
  public getStats(options?: GetStatsOptions): Stats[];
  /**
   *
   * @param name Name of a function or a react component
   * @param options
   */
  public getStats(name: string, options?: GetStatsOptions): Stats | undefined;
  /**
   *
   * @param name Name of a function or a react component
   * @param options
   */
  public getStats(
    name?: string,
    options?: GetStatsOptions
  ): Stats[] | Stats | undefined;
  public getStats(
    nameOrOptions?: string | GetStatsOptions,
    options?: GetStatsOptions
  ): Stats[] | Stats | undefined {
    return this.privateCollector.getStats(nameOrOptions, options);
  }

  /**
   *
   * @param componentName
   * @param options
   * @returns
   */
  public hasComponent(componentName: string, options?: Options) {
    return this.hasRegistered(componentName, options);
  }

  /**
   *
   * @param componentName
   * @param options
   * @returns
   */
  public hasRegistered(componentName: string, options?: Options) {
    return this.privateCollector.hasRegistered(componentName, options);
  }

  /**
   *
   * @param name Name of a function or a react component
   * @param options
   */
  public reset(name?: string, options?: Options) {
    this.privateCollector.reset(name, options);
  }
}
