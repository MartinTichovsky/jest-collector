import { PrivateCollector } from "./private-collector";
import { ControllerAbstract } from "./private-collector.abstract";
import {
  ComponentHooks,
  ComponentHooksTypes,
  Options,
  RegisteredFunction
} from "./private-collector.types";

export class Collector extends ControllerAbstract {
  constructor(private privateCollector: PrivateCollector) {
    super();
  }

  public getCallCount(name: string, options?: Options) {
    return this.privateCollector.getCallCount(name, options);
  }

  public getComponent(
    name: string,
    options?: Options
  ): RegisteredFunction<never> | undefined {
    return this.getFunction(name, options);
  }

  public getFunction(name: string, options?: Options) {
    const result = this.privateCollector.getFunction(name, options);

    return result
      ? ({
          ...result,
          hooks: this.privateCollector.removeOriginScope(result.hooks),
          hooksCounter: undefined
        } as RegisteredFunction<never> | undefined)
      : undefined;
  }

  public getReactComponentHooks(
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
  } {
    return this.privateCollector.getReactComponentHooks(componentName, options);
  }

  public hasComponent(componentName: string, options?: Options) {
    return this.hasFunction(componentName, options);
  }

  public hasFunction(componentName: string, options?: Options) {
    return this.privateCollector.hasFunction(componentName, options);
  }

  public reset() {
    this.privateCollector.reset();
  }
}
