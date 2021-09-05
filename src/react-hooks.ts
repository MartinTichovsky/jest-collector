import { getCallerName } from "./caller";
import { PrivateCollector } from "./private-collector";

export const mockReactHooks = (
  origin: any,
  privateCollector: PrivateCollector
) => ({
  ...origin,
  useCallback: function useCallback(
    action: (...props: any[]) => void,
    ...deps: any[]
  ) {
    // get caller function name from error stack since Funcion.caller is deprecated
    const componentName = getCallerName();

    const mockedAction = jest.fn((...props) => action(...props));

    privateCollector.registerHook(componentName, "useCallback", {
      action: mockedAction,
      deps
    });

    return origin.useCallback(mockedAction, ...deps);
  },
  useEffect: function useEffect(action: () => () => void, ...deps: any[]) {
    // get caller function name from error stack since Funcion.caller is deprecated
    const componentName = getCallerName();

    const { index, renderIndex } = privateCollector.registerHook(
      componentName,
      "useEffect",
      {}
    );

    const dataTestId = privateCollector.getActiveDataTestId(componentName);

    const mockedAction = jest.fn(() => {
      const unmount = action();

      if (typeof unmount === "function") {
        const mockedUnmount = jest.fn(() => unmount());

        privateCollector.setHook({
          componentName,
          dataTestId,
          index,
          props: {
            unmountAction: mockedUnmount
          },
          renderIndex,
          type: "useEffect"
        });
        return mockedUnmount;
      }

      return unmount;
    });

    privateCollector.setHook({
      componentName,
      dataTestId,
      index,
      props: {
        action: mockedAction,
        deps
      },
      renderIndex,
      type: "useEffect"
    });

    return origin.useEffect(mockedAction, ...deps);
  },
  useState: function useState(initialValue: unknown) {
    const result = origin.useState(initialValue);

    // get caller function name from error stack since Funcion.caller is deprecated
    const componentName = getCallerName();

    const existingMockedSetState =
      privateCollector.getExistingSetStateMockedAction(
        componentName,
        result[1]
      );

    if (existingMockedSetState) {
      privateCollector.registerHook(componentName, "useState", {
        state: result[0]
      });

      return [result[0], existingMockedSetState];
    }

    const mockedSetState = jest.fn((...props) => {
      return result[1](...props);
    });

    Object.defineProperties(
      mockedSetState,
      Object.getOwnPropertyDescriptors(result[1])
    );

    privateCollector.registerHook(componentName, "useState", {
      mockedSetState,
      setState: result[1],
      state: result[0]
    });

    return [result[0], mockedSetState];
  }
});
