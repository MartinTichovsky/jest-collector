import { getCaller } from "./caller";
import { PrivateCollector } from "./private-collector";

export const mockReactHooks = (
  origin: any,
  privateCollector: PrivateCollector
) => ({
  ...origin,
  useCallback: function useCallback(
    action: (...props: any[]) => void,
    deps: any[]
  ) {
    // get caller function name from error stack since Funcion.caller is deprecated
    const caller = getCaller();
    const dataTestId = privateCollector.getActiveDataTestId(
      caller.name,
      caller.relativePath
    );

    if (
      !privateCollector.hasRegistered(caller.name, {
        dataTestId,
        relativePath: caller.relativePath
      })
    ) {
      return origin.useEffect(action, deps);
    }

    const register = privateCollector.registerHookWithAction({
      componentName: caller.name,
      hookType: "useCallback",
      props: {
        _originScope: action.toString(),
        action: jest.fn(action),
        deps,
        hasBeenChanged: false,
        isRegistered: true
      },
      relativePath: caller.relativePath
    });

    const result = origin.useCallback(action, deps);

    if (register.action.getMockImplementation() !== result) {
      register.hasBeenChanged = true;
    } else {
      register.hasBeenChanged = false;
    }

    register.action.mockImplementation(result);

    return register.action;
  },
  useContext: function useContext(args: unknown) {
    const context = origin.useContext(args);

    // get caller function name from error stack since Funcion.caller is deprecated
    const caller = getCaller();

    privateCollector.registerUseContext({
      componentName: caller.name,
      props: {
        args,
        context,
        isRegistered: true
      },
      relativePath: caller.relativePath
    });

    return context;
  },
  useEffect: (action: () => () => void, deps: any[]) => {
    // get caller function name from error stack since Funcion.caller is deprecated
    const caller = getCaller();
    const dataTestId = privateCollector.getActiveDataTestId(
      caller.name,
      caller.relativePath
    );

    if (
      !privateCollector.hasRegistered(caller.name, {
        dataTestId,
        relativePath: caller.relativePath
      })
    ) {
      return origin.useEffect(action, deps);
    }

    const register = privateCollector.registerHookWithAction({
      componentName: caller.name,
      hookType: "useEffect",
      props: {
        _originScope: action.toString(),
        action: jest.fn(),
        deps,
        isRegistered: true
      },
      relativePath: caller.relativePath
    });

    const implementation = () => {
      const unmount = action();

      if (typeof unmount !== "function") {
        return unmount;
      }

      if (register.unmountAction === undefined) {
        register.unmountAction = jest.fn();
      }

      register.unmountAction.mockImplementation(unmount);

      return register.unmountAction;
    };

    register.deps = deps;
    register.action.mockImplementation(implementation);

    return origin.useEffect(register.action, deps);
  },
  useRef: function useRef(args: unknown) {
    const ref = origin.useRef(args);

    // get caller function name from error stack since Funcion.caller is deprecated
    const caller = getCaller();

    const register = privateCollector.registerUseRef({
      componentName: caller.name,
      props: {
        args,
        hasBeenChanged: false,
        isRegistered: true,
        ref
      },
      relativePath: caller.relativePath
    });

    /* istanbul ignore next line */
    if (register.ref !== ref) {
      register.hasBeenChanged = true;
    } else {
      register.hasBeenChanged = false;
    }

    register.args = args;
    register.ref = ref;

    return register.ref;
  },
  useState: function useState(initialValue: unknown) {
    const result = origin.useState(initialValue);

    // get caller function name from error stack since Funcion.caller is deprecated
    const caller = getCaller();

    const register = privateCollector.registerUseState({
      componentName: caller.name,
      props: {
        _originState: result[1],
        isRegistered: true,
        setState: jest.fn(),
        state: []
      },
      relativePath: caller.relativePath
    });

    register.state.push(result[0]);
    register.setState.mockImplementation((...props) => result[1](...props));

    Object.defineProperties(
      register.setState,
      Object.getOwnPropertyDescriptors(result[1])
    );

    return [result[0], register.setState];
  }
});
