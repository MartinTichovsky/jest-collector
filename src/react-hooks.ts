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
      !privateCollector.hasFunction(caller.name, {
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
        hasBeenChanged: false
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
  useEffect: (action: () => () => void, deps: any[]) => {
    // get caller function name from error stack since Funcion.caller is deprecated
    const caller = getCaller();
    const dataTestId = privateCollector.getActiveDataTestId(
      caller.name,
      caller.relativePath
    );

    if (
      !privateCollector.hasFunction(caller.name, {
        dataTestId,
        relativePath: caller.relativePath
      })
    ) {
      return origin.useEffect(action, deps);
    }

    const register = privateCollector.registerHookWithAction({
      componentName: caller.name,
      hookType: "useEffect",
      props: { _originScope: action.toString(), action: jest.fn(), deps },
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
  }
  // useState: function useState(initialValue: unknown) {
  //   const result = origin.useState(initialValue);

  //   // get caller function name from error stack since Funcion.caller is deprecated
  //   const caller = getCaller();

  //   const existingMockedSetState =
  //     privateCollector.getExistingSetStateMockedAction(caller.name, result[1]);

  //   if (existingMockedSetState) {
  //     privateCollector.registerHook(caller.name, "useState", {
  //       state: result[0]
  //     });

  //     return [result[0], existingMockedSetState];
  //   }

  //   const mockedSetState = jest.fn((...props) => {
  //     return result[1](...props);
  //   });

  //   Object.defineProperties(
  //     mockedSetState,
  //     Object.getOwnPropertyDescriptors(result[1])
  //   );

  //   privateCollector.registerHook(caller.name, "useState", {
  //     mockedSetState,
  //     setState: result[1],
  //     state: result[0]
  //   });

  //   return [result[0], mockedSetState];
  // }
});
