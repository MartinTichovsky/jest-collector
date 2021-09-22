import { getCaller } from "./caller";
import { __collectorProps__, __relativePath__ } from "./constants";
import { PrivateCollector } from "./private-collector";
import { resolvePath } from "./resolve-path";

const memorizedClones = new Map<unknown, unknown>();

export const mockReactHooks = (
  origin: any,
  privateCollector: PrivateCollector
) => ({
  ...origin,
  createElement: (...props: any[]) => {
    if (
      typeof props[0] !== "function" ||
      process.env.disableReactMock === "true" ||
      !props[0].name ||
      !props[0].clone
    ) {
      return origin.createElement(...props);
    }

    /*
      create an oject to adjust collector properties
      for needed indentification
    */
    if (!props[1]) {
      props[1] = {};
    }

    props[1][__collectorProps__] = {};

    if (props[0][__relativePath__]) {
      return origin.createElement(...props);
    }

    const fnc = props[0];

    // mock the component, every component will be mocked
    if (memorizedClones.has(fnc)) {
      props[0] = memorizedClones.get(fnc);
    } else {
      props[0] = props[0].clone(privateCollector, resolvePath(props[0]), false);
      memorizedClones.set(fnc, props[0]);
    }

    return origin.createElement(...props);
  },
  useCallback: function useCallback(
    action: (...props: any[]) => void,
    deps: any[]
  ) {
    // get caller function name from error stack since Funcion.caller is deprecated
    const caller = getCaller();

    const registered = privateCollector.registerHookWithAction({
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

    if (registered === undefined) {
      return result;
    }

    if (registered.action.getMockImplementation() !== result) {
      registered.hasBeenChanged = true;
    } else {
      registered.hasBeenChanged = false;
    }

    registered.action.mockImplementation(result);

    return registered.action;
  },
  useContext: function useContext(args: unknown) {
    // get caller function name from error stack since Funcion.caller is deprecated
    const caller = getCaller();
    const context = origin.useContext(args);

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

    const registered = privateCollector.registerHookWithAction({
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

    if (registered === undefined) {
      return origin.useEffect(action, deps);
    }

    const implementation = () => {
      const unmount = action();

      if (typeof unmount !== "function") {
        return unmount;
      }

      if (registered.unmount === undefined) {
        registered.unmount = jest.fn();
      }

      registered.unmount.mockImplementation(unmount);

      return registered.unmount;
    };

    registered.deps = deps;
    registered.action.mockImplementation(implementation);

    return origin.useEffect(registered.action, deps);
  },
  useMemo: function useMemo(action: () => unknown, deps: any[]) {
    // get caller function name from error stack since Funcion.caller is deprecated
    const caller = getCaller();
    const result = origin.useMemo(action, deps);

    const registered = privateCollector.registerUseMemo({
      componentName: caller.name,
      props: {
        _originScope: action.toString(),
        deps,
        hasBeenChanged: false,
        isRegistered: true,
        result: typeof result === "function" ? jest.fn(result) : result
      },
      relativePath: caller.relativePath
    });

    if (registered === undefined) {
      return result;
    }

    if (
      typeof registered.result === "function"
        ? (registered.result as jest.Mock).getMockImplementation() !== result
        : registered.result !== result
    ) {
      registered.hasBeenChanged = true;
    } else {
      registered.hasBeenChanged = false;
    }

    if (typeof registered.result === "function") {
      (registered.result as jest.Mock).mockImplementation(result);
    } else {
      registered.result = result;
    }

    return registered.result;
  },
  useReducer: function useReducer(
    reducer: () => unknown,
    initialState: unknown
  ) {
    // get caller function name from error stack since Funcion.caller is deprecated
    const caller = getCaller();

    const registered = privateCollector.registerUseReducer({
      componentName: caller.name,
      props: {
        _originReducer: reducer,
        initialState,
        isRegistered: true,
        dispatch: jest.fn(),
        reducer: jest.fn(),
        state: undefined
      },
      relativePath: caller.relativePath
    });

    if (registered === undefined) {
      return origin.useReducer(reducer, initialState);
    }

    registered.reducer.mockImplementation(reducer);

    const result = origin.useReducer(registered.reducer, initialState);

    registered.state = result[0];
    registered.dispatch.mockImplementation(result[1]);

    return [result[0], registered.dispatch];
  },
  useRef: function useRef(args: unknown) {
    // get caller function name from error stack since Funcion.caller is deprecated
    const caller = getCaller();
    const ref = origin.useRef(args);

    const registered = privateCollector.registerUseRef({
      componentName: caller.name,
      props: {
        args,
        hasBeenChanged: false,
        isRegistered: true,
        ref
      },
      relativePath: caller.relativePath
    });

    if (registered === undefined) {
      return ref;
    }

    /* istanbul ignore next line */
    if (registered.ref !== ref) {
      registered.hasBeenChanged = true;
    } else {
      registered.hasBeenChanged = false;
    }

    registered.args = args;
    registered.ref = ref;

    return registered.ref;
  },
  useState: function useState(initialState: unknown) {
    // get caller function name from error stack since Funcion.caller is deprecated
    const caller = getCaller();
    const result = origin.useState(initialState);

    const registered = privateCollector.registerUseState({
      componentName: caller.name,
      props: {
        _originState: result[1],
        initialState,
        isRegistered: true,
        setState: jest.fn(),
        state: []
      },
      relativePath: caller.relativePath
    });

    if (registered === undefined) {
      return result;
    }

    registered.state.push(result[0]);
    registered.setState.mockImplementation((...props) => result[1](...props));

    // Object.defineProperties(
    //   registered.setState,
    //   Object.getOwnPropertyDescriptors(result[1])
    // );

    return [result[0], registered.setState];
  }
});
