import { PrivateCollector } from "./private-collector";
import { ControllerAbstract } from "./private-collector.abstract";
import {
  GetStatsOptions,
  Options,
  RegisteredFunction,
  Stats
} from "./private-collector.types";

export class Collector extends ControllerAbstract {
  constructor(private privateCollector: PrivateCollector) {
    super();
  }

  public getCallCount(name: string, options?: Options) {
    return this.privateCollector.getCallCount(name, options);
  }

  public getComponentData(
    name: string,
    options?: Options
  ): RegisteredFunction<unknown> | undefined {
    return this.getDataFor(name, options);
  }

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

  public getReactHooks(componentName: string, options?: Options) {
    return this.privateCollector.getReactHooks(componentName, options);
  }

  public getReactLifecycle(componentName: string, options?: Options) {
    return this.privateCollector.getReactLifecycle(componentName, options);
  }

  public getStats(): Stats[];
  public getStats(name: string, options?: GetStatsOptions): Stats | undefined;
  public getStats(
    name?: string,
    options?: GetStatsOptions
  ): Stats[] | Stats | undefined;
  public getStats(
    name?: string,
    options?: GetStatsOptions
  ): Stats[] | Stats | undefined {
    return this.privateCollector.getStats(name, options);
  }

  public hasComponent(componentName: string, options?: Options) {
    return this.hasRegistered(componentName, options);
  }

  public hasRegistered(componentName: string, options?: Options) {
    return this.privateCollector.hasRegistered(componentName, options);
  }

  public reset(name?: string, options?: Options) {
    this.privateCollector.reset(name, options);
  }
}
