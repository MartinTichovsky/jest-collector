import { PrivateCollector } from "./private-collector";

const props = { deps: [1, 2.3] };
const registeredFunction = "RegisteredFunction";
const unregisteredFunction = "UnregisteredFunction";

describe("Collector", () => {
  describe("getRegisteredComponentRenders, getRegisteredComponentHooks, componentRender, reset", () => {
    const collector: PrivateCollector = new PrivateCollector();

    test("Default state", () => {
      expect(collector.registeredFunctions).toEqual({});
      expect(collector.unregisteredReactComponents).toEqual({});
      expect(
        collector.getRegisteredReactComponentRenders(registeredFunction)
      ).toBeUndefined();
      expect(
        collector.getRegisteredReactComponentRenders(
          registeredFunction,
          "fake-id"
        )
      ).toBeUndefined();
      expect(
        collector.getRegisteredReactComponentHooks(
          registeredFunction,
          "useEffect"
        )
      ).toBeUndefined();
    });
    //     test("Component render should create new record in registered component", () => {
    //       collector.functionCalled(registeredComponent);
    //       expect(
    //         collector.getRegisteredReactComponentRenders(registeredComponent)
    //           ?.length
    //       ).toBe(1);
    //     });
    //     test("Get registered component hooks / hook should provide correct values", () => {
    //       collector.registeredFunctions[registeredComponent] = registeredStack;
    //       expect(
    //         collector.getRegisteredReactComponentRenders(registeredComponent)
    //       ).toEqual(registeredStack.map((render) => render.hooks));
    //       expect(
    //         collector
    //           .getRegisteredReactComponentHooks(registeredComponent, "useCallback")
    //           ?.getRender(1)
    //       ).toBeUndefined();
    //       expect(
    //         collector
    //           .getRegisteredReactComponentHooks(registeredComponent, "useEffect")
    //           ?.getRender(1)?.length
    //       ).toBe(1);
    //       expect(
    //         collector
    //           .getRegisteredReactComponentHooks(registeredComponent, "useEffect")
    //           ?.getRender(2)
    //       ).toBeUndefined();
    //       expect(
    //         collector
    //           .getRegisteredReactComponentHooks(registeredComponent, "useEffect")
    //           ?.getRender(1)
    //       ).toEqual(registeredStack[0].hooks.useEffect);
    //       expect(
    //         collector
    //           .getRegisteredReactComponentHooks(registeredComponent, "useEffect")
    //           ?.getRenderHooks(1, 1)
    //       ).toEqual(registeredStack[0].hooks.useEffect[0]);
    //       expect(
    //         collector
    //           .getRegisteredReactComponentHooks(registeredComponent, "useEffect")
    //           ?.getRenderHooks(2, 1)
    //       ).toBeUndefined();
    //       expect(
    //         collector
    //           .getRegisteredReactComponentHooks(registeredComponent, "useEffect")
    //           ?.getRenderHooks(1, 2)
    //       ).toBeUndefined();
    //     });
    //     test("getRegisteredComponentHooks", () => {
    //       const registeredStack = {
    //         [registeredComponent]: [
    //           {
    //             hooks: { useEffect: [{ deps: [5, 9] }, { deps: [3, 2] }] }
    //           },
    //           { hooks: { useEffect: [{ deps: [9, 5] }] } },
    //           { hooks: { useCallback: [{ deps: [7] }] } }
    //         ]
    //       };
    //       collector.registeredFunctions = registeredStack;
    //       expect(
    //         collector
    //           .getRegisteredReactComponentHooks(registeredComponent, "useEffect")
    //           ?.getRender(1)
    //       ).toEqual(registeredStack[registeredComponent][0].hooks.useEffect);
    //       expect(
    //         collector
    //           .getRegisteredReactComponentHooks(registeredComponent, "useEffect")
    //           ?.getRender(2)
    //       ).toEqual(registeredStack[registeredComponent][1].hooks.useEffect);
    //       expect(
    //         collector
    //           .getRegisteredReactComponentHooks(registeredComponent, "useEffect")
    //           ?.getRender(3)
    //       ).toBeUndefined();
    //       expect(
    //         collector
    //           .getRegisteredReactComponentHooks(registeredComponent, "useCallback")
    //           ?.getRender(1)
    //       ).toBeUndefined();
    //       expect(
    //         collector
    //           .getRegisteredReactComponentHooks(registeredComponent, "useCallback")
    //           ?.getRender(3)
    //       ).toEqual(registeredStack[registeredComponent][2].hooks.useCallback);
    //       expect(
    //         collector
    //           .getRegisteredReactComponentHooks(registeredComponent, "useCallback")
    //           ?.getRender(2)
    //       ).toEqual(registeredStack[registeredComponent][1].hooks.useCallback);
    //       expect(
    //         collector
    //           .getRegisteredReactComponentHooks(registeredComponent, "useEffect")
    //           ?.getRenderHooks(1, 1)
    //       ).toEqual(registeredStack[registeredComponent][0].hooks.useEffect![0]);
    //       expect(
    //         collector
    //           .getRegisteredReactComponentHooks(registeredComponent, "useEffect")
    //           ?.getRenderHooks(1, 2)
    //       ).toEqual(registeredStack[registeredComponent][0].hooks.useEffect![1]);
    //       expect(
    //         collector
    //           .getRegisteredReactComponentHooks(registeredComponent, "useEffect")
    //           ?.getRenderHooks(1, 3)
    //       ).toBeUndefined();
    //       expect(
    //         collector
    //           .getRegisteredReactComponentHooks(registeredComponent, "useCallback")
    //           ?.getRenderHooks(2, 1)
    //       ).toEqual(registeredStack[registeredComponent][1].hooks.useCallback?.[0]);
    //       expect(
    //         collector
    //           .getRegisteredReactComponentHooks(registeredComponent, "useCallback")
    //           ?.getRenderHooks(2, 2)
    //       ).toBeUndefined();
    //       expect(
    //         collector.getRegisteredReactComponentRenders(registeredComponent)
    //       ).toEqual(
    //         registeredStack[registeredComponent].map((render) => render.hooks)
    //       );
    //     });
    //     test("reset", () => {
    //       collector.reset();
    //       expect(collector.registeredFunctions).toEqual({});
    //       expect(collector.unregisteredReactComponents).toEqual({});
    //     });
  });
  //   describe("getUnregisteredComponentHooks, getUnregisteredComponentHook", () => {
  //     const collector: Collector = new Collector();
  //     test("Get unregistered component hooks / hook should provide correct values", () => {
  //       expect(collector.getUnregisteredComponentRenders(unregisteredComponent))
  //         .toBeUndefined;
  //       collector.unregisteredReactComponents[unregisteredComponent] =
  //         unregisteredStack;
  //       expect(
  //         collector.getUnregisteredComponentRenders(unregisteredComponent)
  //       ).toEqual(unregisteredStack);
  //       expect(
  //         collector.getUnregisteredReactComponentHooks(
  //           unregisteredComponent,
  //           "useCallback"
  //         )
  //       ).toBeUndefined();
  //       expect(
  //         collector
  //           .getUnregisteredReactComponentHooks(
  //             unregisteredComponent,
  //             "useEffect"
  //           )
  //           ?.getHook(1)
  //       ).toEqual(unregisteredStack.useEffect[0]);
  //       expect(
  //         collector
  //           .getUnregisteredReactComponentHooks(
  //             unregisteredComponent,
  //             "useEffect"
  //           )
  //           ?.getHook(2)
  //       ).toBeUndefined();
  //       expect(collector.registeredFunctions).toEqual({});
  //     });
  //     test("reset", () => {
  //       collector.reset();
  //       expect(collector.registeredFunctions).toEqual({});
  //       expect(collector.unregisteredReactComponents).toEqual({});
  //     });
  //   });
  //   describe("registerHook, componentRender, getComponentRenderCount", () => {
  //     const collector: Collector = new Collector();
  //     test("Register hook with not rendered component should create a record in unregistered components", () => {
  //       // register useEffect
  //       const register = collector.registerHook(
  //         unregisteredComponent,
  //         "useEffect"
  //       );
  //       expect(register.index).toBe(0);
  //       expect(register.renderIndex).toBeUndefined();
  //       expect(collector.registeredFunctions).toEqual({});
  //       expect(collector.unregisteredReactComponents).toEqual(
  //         unregisteredStackDefault
  //       );
  //       const useEffectHooks = collector.getUnregisteredReactComponentHooks(
  //         unregisteredComponent,
  //         "useEffect"
  //       );
  //       expect(useEffectHooks?.getHook(1)).toEqual({});
  //     });
  //     test("Render component and register hook should create new record", () => {
  //       expect(collector.getFunctionCallCount(unregisteredComponent)).toBe(0);
  //       expect(collector.getFunctionCallCount(registeredComponent)).toBe(0);
  //       collector.functionCalled(registeredComponent);
  //       expect(collector.getFunctionCallCount(registeredComponent)).toBe(1);
  //       // register useEffect
  //       const register = collector.registerHook(registeredComponent, "useEffect");
  //       expect(register.index).toBe(0);
  //       expect(register.renderIndex).toBe(0);
  //       expect(collector.registeredFunctions).toEqual(registeredStackDefault);
  //       expect(collector.unregisteredReactComponents).toEqual(
  //         unregisteredStackDefault
  //       );
  //       const useEffectHooks = collector.getRegisteredReactComponentHooks(
  //         registeredComponent,
  //         "useEffect"
  //       );
  //       expect(useEffectHooks?.getRenderHooks(1, 1)).toEqual({});
  //     });
  //     test("2nd register hook with registered component should create second record", () => {
  //       const register = collector.registerHook(registeredComponent, "useEffect");
  //       expect(register.index).toBe(1);
  //       expect(register.renderIndex).toBe(0);
  //       expect(collector.registeredFunctions).toEqual(
  //         registeredStackWithTwoRecords
  //       );
  //       expect(collector.unregisteredReactComponents).toEqual(
  //         unregisteredStackDefault
  //       );
  //     });
  //     test("2nd register hook with unregistered component should create second record", () => {
  //       const register = collector.registerHook(
  //         unregisteredComponent,
  //         "useEffect"
  //       );
  //       expect(register.index).toBe(1);
  //       expect(register.renderIndex).toBeUndefined();
  //       expect(collector.registeredFunctions).toEqual(
  //         registeredStackWithTwoRecords
  //       );
  //       expect(collector.unregisteredReactComponents).toEqual(
  //         unregisteredStackWithTwoRecords
  //       );
  //     });
  //     test("New render should provide", () => {
  //       collector.functionCalled(registeredComponent);
  //       const register = collector.registerHook(registeredComponent, "useEffect");
  //       expect(register.index).toBe(0);
  //       expect(register.renderIndex).toBe(1);
  //       expect(collector.registeredFunctions).toEqual(
  //         registeredStackWithTwoRecordsTwoRenders
  //       );
  //       expect(collector.unregisteredReactComponents).toEqual(
  //         unregisteredStackWithTwoRecords
  //       );
  //     });
  //     test("Call component render with undefined", () => {
  //       collector.functionCalled();
  //       expect(collector.registeredFunctions).toEqual(
  //         registeredStackWithTwoRecordsTwoRenders
  //       );
  //       expect(collector.unregisteredReactComponents).toEqual(
  //         unregisteredStackWithTwoRecords
  //       );
  //     });
  //     test("Register more effects", () => {
  //       let register;
  //       // register useCallback
  //       register = collector.registerHook(registeredComponent, "useCallback");
  //       expect(register.index).toBe(0);
  //       expect(register.renderIndex).toBe(1);
  //       const useCallbackHooksRegistered =
  //         collector.getRegisteredReactComponentHooks(
  //           registeredComponent,
  //           "useCallback"
  //         );
  //       expect(useCallbackHooksRegistered?.getRenderHooks(2, 1)).toEqual({});
  //       // register useCallback
  //       register = collector.registerHook(unregisteredComponent, "useCallback");
  //       expect(register.index).toBe(0);
  //       expect(register.renderIndex).toBeUndefined();
  //       const useCallbackHooksUnregistered =
  //         collector.getUnregisteredReactComponentHooks(
  //           unregisteredComponent,
  //           "useCallback"
  //         );
  //       expect(useCallbackHooksUnregistered?.getHook(1)).toEqual({});
  //     });
  //   });
  //   describe("setHook - testing when registeredComponents and unregisteredComponents are empty", () => {
  //     const collector: Collector = new Collector();
  //     test("All properties must be empty object", () => {
  //       expect(collector.registeredFunctions).toEqual({});
  //       expect(collector.unregisteredReactComponents).toEqual({});
  //     });
  //     test("Component name is undefined, it mustn't create new entry", () => {
  //       collector.setHook({
  //         componentName: undefined,
  //         index: 0,
  //         type: "useEffect",
  //         props,
  //         renderIndex: 0
  //       });
  //       expect(collector.registeredFunctions).toEqual({});
  //       expect(collector.unregisteredReactComponents).toEqual({});
  //     });
  //     test("Index is undefined, it mustn't create new entry", () => {
  //       collector.setHook({
  //         componentName: registeredComponent,
  //         index: undefined,
  //         type: "useEffect",
  //         props,
  //         renderIndex: 0
  //       });
  //       expect(collector.registeredFunctions).toEqual({});
  //       expect(collector.unregisteredReactComponents).toEqual({});
  //     });
  //     test("Render index is undefined, it mustn't create new entry", () => {
  //       collector.setHook({
  //         componentName: registeredComponent,
  //         index: 0,
  //         type: "useEffect",
  //         props,
  //         renderIndex: undefined
  //       });
  //       expect(collector.registeredFunctions).toEqual({});
  //       expect(collector.unregisteredReactComponents).toEqual({});
  //     });
  //     test("All properties have correct values, it mustn't create new entry", () => {
  //       collector.setHook({
  //         componentName: registeredComponent,
  //         index: 0,
  //         type: "useEffect",
  //         props,
  //         renderIndex: 0
  //       });
  //       expect(collector.registeredFunctions).toEqual({});
  //       expect(collector.unregisteredReactComponents).toEqual({});
  //     });
  //   });
  //   describe("setHook - registeredComponents - testing when registeredComponents is set", () => {
  //     const collector: Collector = new Collector();
  //     test("Set hook on registered component without hook", () => {
  //       const registeredComponents = { [registeredComponent]: [{ hooks: {} }] };
  //       collector.registeredFunctions = registeredComponents;
  //       collector.setHook({
  //         componentName: registeredComponent,
  //         index: 0,
  //         type: "useEffect",
  //         props,
  //         renderIndex: 0
  //       });
  //       expect(collector.registeredFunctions).toEqual(registeredComponents);
  //       expect(collector.unregisteredReactComponents).toEqual({});
  //     });
  //     test("Set hook on registered component with hook and wrong index, registeredComponents mustn't change", () => {
  //       collector.registeredFunctions = registeredStackDefault;
  //       collector.setHook({
  //         componentName: registeredComponent,
  //         index: 1,
  //         type: "useEffect",
  //         props,
  //         renderIndex: 0
  //       });
  //       expect(collector.registeredFunctions).toEqual(registeredStackDefault);
  //       expect(collector.unregisteredReactComponents).toEqual({});
  //     });
  //     test("Set hook on registered component with hook and correct index, it must pass props", () => {
  //       collector.setHook({
  //         componentName: registeredComponent,
  //         index: 0,
  //         type: "useEffect",
  //         props,
  //         renderIndex: 0
  //       });
  //       expect(collector.registeredFunctions).toEqual(registeredStackWithProps);
  //       expect(collector.unregisteredReactComponents).toEqual({});
  //     });
  //   });
  //   describe("setHook - unregisteredComponents - testing when unregisteredComponents is set", () => {
  //     const collector: Collector = new Collector();
  //     test("Set hook on unregistered component without hook", () => {
  //       const unregisteredComponents = { [unregisteredComponent]: {} };
  //       collector.unregisteredReactComponents = unregisteredComponents;
  //       collector.setHook({
  //         componentName: unregisteredComponent,
  //         index: 0,
  //         type: "useEffect",
  //         props,
  //         renderIndex: undefined
  //       });
  //       expect(collector.registeredFunctions).toEqual({});
  //       expect(collector.unregisteredReactComponents).toEqual(
  //         unregisteredComponents
  //       );
  //     });
  //     test("Set hook on unregistered component with hook and wrong index, unregisteredComponents mustn't change", () => {
  //       collector.unregisteredReactComponents = unregisteredStackDefault;
  //       collector.setHook({
  //         componentName: unregisteredComponent,
  //         index: 1,
  //         type: "useEffect",
  //         props,
  //         renderIndex: undefined
  //       });
  //       expect(collector.registeredFunctions).toEqual({});
  //       expect(collector.unregisteredReactComponents).toEqual(
  //         unregisteredStackDefault
  //       );
  //     });
  //     test("Set hook on unregistered component with hook and correct index, it must pass props", () => {
  //       collector.setHook({
  //         componentName: unregisteredComponent,
  //         index: 0,
  //         type: "useEffect",
  //         props,
  //         renderIndex: undefined
  //       });
  //       expect(collector.registeredFunctions).toEqual({});
  //       expect(collector.unregisteredReactComponents).toEqual(
  //         unregisteredStackWithProps
  //       );
  //     });
  //   });
  //   test("Complete workflow", () => {
  //     const testId = "test-id";
  //     const props1 = { action: jest.fn() };
  //     const props2 = { unmountAction: jest.fn() };
  //     const collector: Collector = new Collector();
  //     collector.functionCalled(registeredComponent, testId);
  //     expect(collector["activeDataTestId"]).toBe(testId);
  //     expect(collector.getFunctionCallCount(registeredComponent, testId)).toBe(1);
  //     let register;
  //     register = collector.registerHook(registeredComponent, "useEffect");
  //     collector.setHook({
  //       componentName: registeredComponent,
  //       dataTestId: testId,
  //       index: register.index,
  //       renderIndex: register.renderIndex,
  //       type: "useEffect",
  //       props: props1
  //     });
  //     expect(
  //       collector.getRegisteredReactComponentRenders(registeredComponent, testId)
  //     ).toEqual([
  //       {
  //         useEffect: [props1]
  //       }
  //     ]);
  //     expect(
  //       collector.getRegisteredReactComponentRenders(
  //         registeredComponent,
  //         "fake-id"
  //       )
  //     ).toEqual([]);
  //     // first render, first register
  //     const componentHook = collector.getRegisteredReactComponentHooks(
  //       registeredComponent,
  //       "useEffect",
  //       testId
  //     );
  //     expect(componentHook?.getRender(1)).toEqual([props1]);
  //     expect(componentHook?.getRender(2)).toBeUndefined();
  //     expect(componentHook?.getRenderHooks(1, 1)).toEqual(props1);
  //     expect(componentHook?.getRenderHooks(1, 2)).toBeUndefined();
  //     expect(componentHook?.getRenderHooks(2, 1)).toBeUndefined();
  //     expect(
  //       collector.getRegisteredReactComponentHooks(
  //         registeredComponent,
  //         "useEffect",
  //         "fake-id"
  //       )
  //     ).toBeUndefined();
  //     // first render, second register
  //     register = collector.registerHook(registeredComponent, "useEffect");
  //     collector.setHook({
  //       componentName: registeredComponent,
  //       dataTestId: testId,
  //       index: register.index,
  //       renderIndex: register.renderIndex,
  //       type: "useEffect",
  //       props: props2
  //     });
  //     expect(componentHook?.getRender(1)).toEqual([props1, props2]);
  //     expect(componentHook?.getRenderHooks(1, 2)).toEqual(props2);
  //     collector.functionCalled(registeredComponent, testId);
  //     expect(collector.getFunctionCallCount(registeredComponent, testId)).toBe(2);
  //     // second render, first register
  //     register = collector.registerHook(registeredComponent, "useEffect");
  //     collector.setHook({
  //       componentName: registeredComponent,
  //       dataTestId: testId,
  //       index: register.index,
  //       renderIndex: register.renderIndex,
  //       type: "useEffect",
  //       props: props2
  //     });
  //     expect(componentHook?.getRender(2)).toEqual([props2]);
  //     expect(componentHook?.getRenderHooks(2, 1)).toEqual(props2);
  //   });
});
