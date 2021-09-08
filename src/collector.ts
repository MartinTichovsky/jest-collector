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
          hooks: this.privateCollector.removePropsFromAllHooks(result.hooks),
          hooksCounter: undefined
        } as RegisteredFunction<never> | undefined)
      : undefined;
  }

  public getReactComponentHooks(
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
    return this.privateCollector.getReactComponentHooks(componentName, options);
  }

  public getReactComponentLifecycle(componentName: string, options?: Options) {
    return this.privateCollector.getReactComponentLifecycle(
      componentName,
      options
    );
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
