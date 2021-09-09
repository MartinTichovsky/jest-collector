import { PrivateCollector } from "./private-collector";
import { ControllerAbstract } from "./private-collector.abstract";
import {
  Options,
  ReactHooks,
  ReactHooksTypes,
  RegisteredFunction
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
  ): RegisteredFunction<never> | undefined {
    return this.getDataFor(name, options);
  }

  public getDataFor(name: string, options?: Options) {
    const registered = this.privateCollector.getDataFor(name, options);

    if (!registered?.hooks) {
      return registered;
    }

    const filtered = this.privateCollector.getOnlyRegisteredHooks(registered);
    delete (filtered as RegisteredFunction<never>)["hooksCounter"];

    return {
      ...filtered,
      hooks: this.privateCollector.removePropsFromAllHooks(filtered!.hooks)
    } as RegisteredFunction<never> | undefined;
  }

  public getReactHooks(
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
  } {
    return this.privateCollector.getReactHooks(componentName, options);
  }

  public getReactLifecycle(componentName: string, options?: Options) {
    return this.privateCollector.getReactLifecycle(componentName, options);
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
