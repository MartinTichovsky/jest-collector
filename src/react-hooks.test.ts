import { PrivateCollector } from "./private-collector";
import { mockReactHooks } from "./react-hooks";

const args = { deps: [1, 2.3] };
const registeredComponent = "RegisteredComponent";
const unregisteredComponent = "UnregisteredComponent";

describe("Mock React Hooks", () => {
  describe("When useEffect (action) returns a function", () => {
    const collector = new PrivateCollector();
    const componentName = "SomeComponent";

    collector.functionCalled({
      args,
      jestFn: jest.fn(),
      name: componentName
    });

    let hookAction: () => void;
    const oiginUseEffect = jest.fn((action) => {
      // for calling it manually
      hookAction = () => {
        const returnAction = action();
        if (typeof returnAction === "function") {
          returnAction();
        }
      };
    });

    const returnAction = jest.fn();
    const action = jest.fn(() => returnAction);
    const deps = [1, 2, 3];
    const reactOrigin = { someProperty: "property", useEffect: oiginUseEffect };
    const mockedReactOrigin = mockReactHooks(reactOrigin, collector);

    test("Mocked origin should be created and contains origin properties", () => {
      expect(mockedReactOrigin.useEffect).not.toBeUndefined();
      expect(mockedReactOrigin.someProperty).toBe(reactOrigin.someProperty);
    });

    //   test("Before calling useEffect, hooks collector mustn't contain hooks", () => {
    //     expect(
    //       collector
    //         .getRegisteredReactComponentHooks(componentName, "useEffect")
    //         ?.getRender(1)
    //     ).toBeUndefined();
    //     expect(
    //       collector.getRegisteredReactComponentRenders(componentName)
    //     ).toEqual([{}]);
    //   });
    //   test("When useEfect is called, it must record an action and deps", () => {
    //     // mock a call from a component, must have same name as string in `componentName` property
    //     function SomeComponent() {
    //       mockedReactOrigin.useEffect(action, ...deps);
    //     }
    //     SomeComponent();
    //     // first render mustn't call the action, but component must be registered
    //     expect(registeredComponent).not.toBeUndefined();
    //     expect(registeredComponent?.getRender(1)?.length).toBe(1);
    //     expect(oiginUseEffect).toBeCalledTimes(1);
    //     expect(oiginUseEffect).lastCalledWith(
    //       registeredComponent?.getRenderHooks(1, 1)?.action,
    //       ...deps
    //     );
    //     expect(registeredComponent?.getRenderHooks(1, 1)?.deps).toEqual(deps);
    //     expect(
    //       registeredComponent?.getRenderHooks(1, 1)?.unmountAction
    //     ).toBeUndefined();
    //     expect(
    //       registeredComponent?.getRenderHooks(1, 1)?.action
    //     ).not.toBeCalled();
    //   });
    //   test("Calling the hook action should call the return action", () => {
    //     hookAction!();
    //     expect(action).toBeCalledTimes(1);
    //     expect(registeredComponent?.getRenderHooks(1, 1)?.action).toBeCalledTimes(
    //       1
    //     );
    //     expect(returnAction).toBeCalledTimes(1);
    //     expect(
    //       registeredComponent?.getRenderHooks(1, 1)?.unmountAction
    //     ).toBeCalledTimes(1);
    //   });
  });
  // test("The useEffect (action) doesn't return a function", () => {
  //   const collector = new Collector();
  //   const origin = {
  //     someProperty: "property",
  //     useEffect: (action: () => unknown) => {
  //       return action();
  //     }
  //   };
  //   const mock = mockReactHooks(origin, collector);
  //   const action = jest.fn(() => undefined);
  //   expect(mock.useEffect(action, 9, 8)).toBeUndefined();
  //   expect(action).toBeCalledTimes(1);
  // });
});
