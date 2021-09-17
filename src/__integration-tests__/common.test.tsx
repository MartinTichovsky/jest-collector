import "@testing-library/jest-dom";
import { act, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { ClassComponent } from "./components/class-components";
import {
  ComponentWithChildren,
  SimpleComponent,
  SimpleComponentInTheSameFile
} from "./components/common";
import {
  EmptyWithUseEffectAndUseCallback,
  UnregisteredClassComponent,
  UnregisteredComponentWithSimpleComponent
} from "./components/common.unregistered";
import { WithDeps as UseCallbackDeps } from "./components/UseCallback";
import { WithDeps as UseEffectDeps } from "./components/UseEffect";
import { OneUseRef } from "./components/UseRef";
import { OneUseStateWithChildren } from "./components/UseState";
import { TestClass } from "./others/class";
import {
  recursiveFunction,
  regularFunction
} from "./others/recursive-function";

console.warn = jest.fn();
const ComponentName = "WithDeps";
const dataTestId1 = "test-id-1";
const dataTestId2 = "test-id-2";
const dataTestId3 = "test-id-3";
const useCallbackDepsRelativePath =
  "/src/__integration-tests__/components/UseCallback.tsx";
const useEffectDepsRelativePath =
  "/src/__integration-tests__/components/UseEffect.tsx";

const nthChildTestSuite = () => {
  expect(console.warn).not.toBeCalled();
  expect(collector.getAllDataFor(SimpleComponent.name).length).toBe(2);
  expect(
    collector.getDataFor(SimpleComponent.name, { nthChild: 1 })
  ).not.toBeUndefined();
  expect(
    collector.getDataFor(SimpleComponent.name, { nthChild: 2 })
  ).not.toBeUndefined();
  expect(console.warn).not.toBeCalled();
};

beforeEach(() => {
  collector.reset();
  jest.clearAllMocks();
});

describe("Commons tests", () => {
  test("Calling hooks with non react component function", () => {
    regularFunction("123");

    expect(collector.getCallCount(regularFunction.name)).toBe(1);
    expect(collector.getDataFor(regularFunction.name)?.calls[0].args).toEqual([
      "123"
    ]);
    expect(collector.getDataFor(regularFunction.name)?.calls[0].result).toBe(
      "123"
    );

    // hooks does not exist
    const hooks = collector.getReactHooks(regularFunction.name);

    expect(hooks).not.toBeUndefined();
    expect(hooks?.getAll()).toBeUndefined();
    expect(hooks?.getAll("useEffect")).toBeUndefined();
    expect(hooks?.getHook("useEffect", 1)).toBeUndefined();
    expect(hooks?.getHooksByType("useEffect").get(1)).toBeUndefined();
    expect(hooks?.getUseState(1).getState(1)).toBeUndefined();
    expect(hooks?.getUseState(1).next()).toEqual([]);
  });

  test("Class", () => {
    // class should not exist
    expect(collector.getDataFor(TestClass.name)).toBeUndefined();

    // create new class
    const testClass = new TestClass();

    // class should exist in the collector
    expect(collector.getDataFor(TestClass.name)).not.toBeUndefined();

    // class should be called once
    expect(collector.getCallCount(TestClass.name)).toBe(1);

    // class should be instance of the origin class
    expect(testClass instanceof TestClass).toBeTruthy();

    // create new class
    new TestClass();

    // class should be called twice
    expect(collector.getCallCount(TestClass.name)).toBe(2);
  });

  test("Complex test - it must pass", () => {
    render(
      <ComponentWithChildren>
        <div>
          <UnregisteredComponentWithSimpleComponent data-testid={dataTestId1} />
        </div>
        <div>text</div>
        <div />
        <SimpleComponent />
        <div>
          <SimpleComponent />
        </div>
        <UnregisteredClassComponent />
      </ComponentWithChildren>
    );

    render(
      <>
        <div />
        <div>text</div>
        <ComponentWithChildren>
          <div>
            <UnregisteredComponentWithSimpleComponent />
          </div>
          <div>text</div>
          <div />
        </ComponentWithChildren>
        <ComponentWithChildren>
          <div />
        </ComponentWithChildren>
        <ComponentWithChildren>
          <p>text</p>
        </ComponentWithChildren>
        <SimpleComponent />
        <div>
          <SimpleComponent />
        </div>
      </>
    );

    render(<SimpleComponent />);

    render(
      <ComponentWithChildren>
        <div />
      </ComponentWithChildren>
    );

    render(
      <ComponentWithChildren>
        <p>text</p>
      </ComponentWithChildren>
    );

    render(<UnregisteredClassComponent />);
  });

  test("Component from the same file", () => {
    const text1 = "text-1";
    const text2 = "text-2";

    render(
      <>
        <SimpleComponentInTheSameFile text={text1} />
        <SimpleComponent text={text2} />
      </>
    );

    // it should be called twice, each with different parent
    expect(collector.getAllDataFor(SimpleComponent.name).length).toBe(2);
    expect(
      collector.getAllDataFor(SimpleComponent.name, {
        relativePath: "/src/__integration-tests__/components/common.tsx"
      }).length
    ).toBe(2);
    expect(
      collector.getCallCount(SimpleComponent.name, {
        relativePath: "/src/__integration-tests__/components/common.tsx"
      })
    ).toBe(2);
  });

  test("Dynamic render with not registered component", () => {
    const testId = "test-id";
    let num = 0;
    const TestComponent = () => {
      return <div data-testid={testId}>{++num}</div>;
    };
    // create a caller object to be able manually call the useState
    const caller = {
      setState: ((_state: number) => {}) as React.Dispatch<
        React.SetStateAction<number>
      >
    };

    render(
      <OneUseStateWithChildren caller={caller}>
        <TestComponent />
      </OneUseStateWithChildren>
    );

    expect(screen.getByTestId(testId)).toHaveTextContent("1");

    act(() => {
      caller.setState(1);
    });

    expect(screen.getByTestId(testId)).toHaveTextContent("2");

    act(() => {
      caller.setState(2);
    });

    expect(screen.getByTestId(testId)).toHaveTextContent("3");

    act(() => {
      caller.setState(3);
    });

    expect(screen.getByTestId(testId)).toHaveTextContent("4");
  });

  test("Get all data for", () => {
    render(
      <>
        {/*
          directly under the root, the element will have nthChild=undefined because
          it can not be resolved, the component must be under a mocked component
          to resolve nthChild
        */}
        <SimpleComponent />
        <SimpleComponent />
        <ComponentWithChildren>
          {/* directly under the ComponentWithChildren */}
          <UnregisteredComponentWithSimpleComponent />
          {/* directly under the ComponentWithChildren, this will be SimpleComponent with nthChild=1 */}
          <SimpleComponent />
          {/* directly under the ComponentWithChildren, this will be SimpleComponent with nthChild=2 */}
          <SimpleComponent />
          {/*
            directly under the ComponentWithChildren, this will be 
            ComponentWithChildren with nthChild=1
          */}
          <ComponentWithChildren>
            {/* three times under the ComponentWithChildren */}
            <ComponentWithChildren>
              <SimpleComponent />
              <SimpleComponent />
            </ComponentWithChildren>
            <SimpleComponent />
            <SimpleComponent />
          </ComponentWithChildren>
          {/*
            directly under the ComponentWithChildren, this will be 
            ComponentWithChildren with nthChild=2 
          */}
          <ComponentWithChildren>
            <SimpleComponent />
            <SimpleComponent />
          </ComponentWithChildren>
          {/* 
            directly under the ComponentWithChildren, this will have the nthChild=undefined,
            because it has unique data-testid
          */}
          <ComponentWithChildren data-testid={dataTestId1}>
            <SimpleComponent />
            <SimpleComponent />
          </ComponentWithChildren>
          {/* 
            directly under the ComponentWithChildren, this will have the nthChild=undefined, 
            because it has unique data-testid 
          */}
          <ComponentWithChildren data-testid={dataTestId2}>
            <SimpleComponent />
            <SimpleComponent />
          </ComponentWithChildren>
          {/*
            directly under the ComponentWithChildren, this will be ComponentWithChildren 
            with nthChild=1 and dataTestId=dataTestId3
          */}
          <ComponentWithChildren data-testid={dataTestId3}>
            <SimpleComponent />
            <SimpleComponent />
          </ComponentWithChildren>
          {/* 
            directly under the ComponentWithChildren, this will be ComponentWithChildren 
            with nthChild=2 and dataTestId=dataTestId3
          */}
          <ComponentWithChildren data-testid={dataTestId3}>
            <SimpleComponent />
            <SimpleComponent />
          </ComponentWithChildren>
        </ComponentWithChildren>
      </>
    );

    /*
      get SimpleComponent directly only UnregisteredComponentWithSimpleComponent,
      only one result should match
    */
    expect(
      collector.getAllDataFor(SimpleComponent.name, {
        parent: {
          name: UnregisteredComponentWithSimpleComponent.name
        }
      }).length
    ).toBe(1);

    /*
      get SimpleComponent under the root, there are two elements, which will
      be merget into one because they have nthChild=undefined because the nthChild
      can not be resolved
    */
    expect(
      collector.getAllDataFor(SimpleComponent.name, {
        parent: null
      }).length
    ).toBe(1);
    expect(
      collector.getCallCount(SimpleComponent.name, {
        parent: null
      })
    ).toBe(2);

    /*
      get all SimpleComponents directly under the ComponentWithChildren,
      there are 16 elements matching that rule
    */
    expect(
      collector.getAllDataFor(SimpleComponent.name, {
        parent: {
          name: ComponentWithChildren.name
        }
      }).length
    ).toBe(16);

    /*
      get all SimpleComponents directly under the ComponentWithChildren,
      which should be under the root, there are only two elements
      matching that rule
    */
    expect(
      collector.getAllDataFor(SimpleComponent.name, {
        parent: {
          name: ComponentWithChildren.name,
          parent: null
        }
      }).length
    ).toBe(2);

    /*
      get all SimpleComponents under the data-testid=dataTestId1,
      there are two elements matching that rule because they are
      resolved with nthChild
    */
    expect(
      collector.getAllDataFor(SimpleComponent.name, {
        parent: {
          dataTestId: dataTestId1
        }
      }).length
    ).toBe(2);

    /*
      get all SimpleComponents which are resolved as a first child
    */
    expect(
      collector.getAllDataFor(SimpleComponent.name, {
        nthChild: 1
      }).length
    ).toBe(8);

    // get all SimpleComponents which have parent resolved as nthChild=1
    expect(
      collector.getAllDataFor(SimpleComponent.name, {
        parent: {
          nthChild: 1
        }
      }).length
    ).toBe(4);

    // get all SimpleComponents which have parent resolved as nthChild=2
    expect(
      collector.getAllDataFor(SimpleComponent.name, {
        parent: {
          nthChild: 2
        }
      }).length
    ).toBe(4);

    // get all registered functions
    expect(collector.getAllDataFor({}).length).toBe(27);

    // get all by parent relative path
    expect(
      collector.getAllDataFor({
        parent: {
          relativePath: "/src/__integration-tests__/components/common.tsx"
        }
      }).length
    ).toBe(24);
  });

  test("More components with the same name should log a warning", () => {
    render(
      <>
        <UseEffectDeps deps={[]} />
        <UseCallbackDeps deps={[]} />
      </>
    );

    expect(console.warn).not.toBeCalled();
    collector.getDataFor(ComponentName);
    expect(console.warn).toBeCalled();
  });

  test("More components with the same name should not log a warning when it is disabled", () => {
    render(
      <>
        <UseEffectDeps deps={[]} />
        <UseCallbackDeps deps={[]} />
      </>
    );

    expect(console.warn).not.toBeCalled();
    collector.getDataFor(ComponentName, { ignoreWarning: true });
    expect(console.warn).not.toBeCalled();
  });

  test("More components with the same name and different test id", () => {
    render(
      <>
        <UseEffectDeps data-testid={dataTestId1} deps={[]} />
        <UseCallbackDeps data-testid={dataTestId2} deps={[]} />
      </>
    );

    // check if the components exist, it should not log a warning, because functions are called with dataTestId
    expect(console.warn).not.toBeCalled();
    expect(
      collector.getDataFor(ComponentName, { dataTestId: null })
    ).toBeUndefined();
    expect(
      collector.getDataFor(ComponentName, { dataTestId: dataTestId1 })
    ).not.toBeUndefined();
    expect(
      collector.getDataFor(ComponentName, { dataTestId: dataTestId2 })
    ).not.toBeUndefined();
    expect(
      collector.getDataFor(ComponentName, { dataTestId: dataTestId1 })
    ).not.toEqual(
      collector.getDataFor(ComponentName, { dataTestId: dataTestId2 })
    );
    expect(
      collector.getCallCount(ComponentName, { dataTestId: dataTestId1 })
    ).toBe(1);
    expect(
      collector.getCallCount(ComponentName, { dataTestId: dataTestId2 })
    ).toBe(1);
    expect(console.warn).not.toBeCalled();

    // reset data only for one specific component
    collector.reset(ComponentName, { dataTestId: dataTestId2 });

    // check if the component has been deleted
    expect(
      collector.getDataFor(ComponentName, { dataTestId: dataTestId1 })
    ).not.toBeUndefined();
    expect(
      collector.getDataFor(ComponentName, { dataTestId: dataTestId2 })
    ).toBeUndefined();

    // render with the same data-testid
    render(
      <>
        <UseEffectDeps data-testid={dataTestId1} deps={[]} />
        <UseCallbackDeps data-testid={dataTestId1} deps={[]} />
      </>
    );

    /* 
      check the component data, it should log a warning because there are
      two components with the same name and test id and different path of the script
    */
    expect(console.warn).not.toBeCalled();
    expect(
      collector.getCallCount(ComponentName, { dataTestId: dataTestId1 })
    ).toBe(3);
    expect(
      collector.getComponentData(ComponentName, { dataTestId: dataTestId1 })
    ).not.toBeUndefined();
    expect(
      collector.getCallCount(ComponentName, { dataTestId: dataTestId2 })
    ).toBeUndefined();
    expect(
      collector.getComponentData(ComponentName, { dataTestId: dataTestId2 })
    ).toBeUndefined();
    expect(console.warn).toBeCalled();

    // clean the mock stats
    (console.warn as jest.Mock).mockClear();

    // get data wth dataTestId and relative path
    expect(console.warn).not.toBeCalled();
    expect(
      collector.getCallCount(ComponentName, {
        dataTestId: dataTestId1,
        relativePath: useEffectDepsRelativePath
      })
    ).toBe(2);
    expect(
      collector.getComponentData(ComponentName, {
        dataTestId: dataTestId1,
        relativePath: useEffectDepsRelativePath
      })
    ).not.toBeUndefined();
    expect(
      collector.getCallCount(ComponentName, {
        dataTestId: dataTestId1,
        relativePath: useCallbackDepsRelativePath
      })
    ).toBe(1);
    expect(
      collector.getComponentData(ComponentName, {
        dataTestId: dataTestId1,
        relativePath: useCallbackDepsRelativePath
      })
    ).not.toBeUndefined();
    expect(console.warn).not.toBeCalled();
  });

  test("More components with the same name and different file path", () => {
    render(
      <>
        <UseEffectDeps deps={[]} />
        <UseCallbackDeps deps={[]} />
      </>
    );

    // check if the componets exist, it should not log a warning, because functions are called with relativePath
    expect(console.warn).not.toBeCalled();
    expect(
      collector.getDataFor(ComponentName, {
        relativePath: useCallbackDepsRelativePath
      })
    ).not.toBeUndefined();
    expect(
      collector.getDataFor(ComponentName, {
        relativePath: useEffectDepsRelativePath
      })
    ).not.toBeUndefined();
    expect(
      collector.getDataFor(ComponentName, {
        relativePath: useCallbackDepsRelativePath
      })
    ).not.toEqual(
      collector.getDataFor(ComponentName, {
        relativePath: useEffectDepsRelativePath
      })
    );
    expect(
      collector.getCallCount(ComponentName, {
        relativePath: useCallbackDepsRelativePath
      })
    ).toBe(1);
    expect(
      collector.getCallCount(ComponentName, {
        relativePath: useEffectDepsRelativePath
      })
    ).toBe(1);
    expect(console.warn).not.toBeCalled();

    // reset data on component with useCallbackDepsRelativePath
    collector.reset(ComponentName, {
      relativePath: useCallbackDepsRelativePath
    });

    // check if component data is correctly deleted
    expect(
      collector.getCallCount(ComponentName, {
        relativePath: useCallbackDepsRelativePath
      })
    ).toBeUndefined();
    expect(
      collector.getComponentData(ComponentName, {
        relativePath: useCallbackDepsRelativePath
      })
    ).toBeUndefined();
    expect(
      collector.getCallCount(ComponentName, {
        relativePath: useEffectDepsRelativePath
      })
    ).toBe(1);
    expect(
      collector.getComponentData(ComponentName, {
        relativePath: useEffectDepsRelativePath
      })
    ).not.toBeUndefined();

    // new redner should again register the component
    render(
      <>
        <UseEffectDeps deps={[]} />
        <UseCallbackDeps deps={[]} />
      </>
    );

    // check the data
    expect(
      collector.getCallCount(ComponentName, {
        relativePath: useCallbackDepsRelativePath
      })
    ).toBe(1);
    expect(
      collector.getComponentData(ComponentName, {
        relativePath: useCallbackDepsRelativePath
      })
    ).not.toBeUndefined();
    expect(
      collector.getCallCount(ComponentName, {
        relativePath: useEffectDepsRelativePath
      })
    ).toBe(2);
    expect(
      collector.getComponentData(ComponentName, {
        relativePath: useEffectDepsRelativePath
      })
    ).not.toBeUndefined();
  });

  test("Not mocked component", () => {
    render(<EmptyWithUseEffectAndUseCallback />);

    // it should not exist in the collector
    expect(
      collector.getComponentData(EmptyWithUseEffectAndUseCallback.name)
    ).toBeUndefined();
  });

  test("Nth child - use case 1", () => {
    render(
      <ComponentWithChildren>
        <div>
          <SimpleComponent />
        </div>
        <SimpleComponent />
      </ComponentWithChildren>
    );

    nthChildTestSuite();
  });

  test("Nth child - use case 2", () => {
    render(
      <ComponentWithChildren>
        <div>
          <SimpleComponent />
        </div>
        <div>
          <SimpleComponent />
        </div>
      </ComponentWithChildren>
    );

    nthChildTestSuite();
  });

  test("Nth child - use case 3", () => {
    render(
      <ComponentWithChildren>
        <div>
          <div>
            <span>
              <SimpleComponent />
            </span>
          </div>
        </div>
        <div>
          <SimpleComponent />
        </div>
      </ComponentWithChildren>
    );

    nthChildTestSuite();
  });

  test("Not mocked copmponent should work correctly", () => {
    const getExpectedText = (
      state: number,
      context: string,
      callbackResult: string,
      memo: string,
      ref: string,
      reducerState: number
    ) =>
      `state:${state},context:${context},callback:${callbackResult},memo:${memo},ref:${ref},reducer:${reducerState}`;

    const action = jest.fn();
    const unmount = jest.fn();

    const reducer = (
      state: { count: number },
      action: { type: "increment" }
    ) => {
      switch (action.type) {
        case "increment":
          return { count: state.count + 1 };
        default:
          throw new Error();
      }
    };

    const reactCoontext = React.createContext("context");

    const Component = () => {
      const [state, setState] = React.useState(5);
      const context = React.useContext(reactCoontext);
      const callback = React.useCallback(() => {
        return `text${state}`;
      }, [state]);
      const memo = React.useMemo(() => `result${state}`, [state]);
      const ref = React.useRef(`ref${state}`);
      const [reducerState, dispatch] = React.useReducer(reducer, { count: 8 });

      React.useEffect(() => {
        action();
        return unmount;
      }, [state]);

      return (
        <div>
          <button
            data-testid="state"
            onClick={() => {
              setState((prevValue) => prevValue + 1);
            }}
          >
            {getExpectedText(
              state,
              context,
              callback(),
              memo,
              ref.current,
              reducerState.count
            )}
          </button>
          <button
            data-testid="reducer"
            onClick={() => dispatch({ type: "increment" })}
          >
            Increment
          </button>
        </div>
      );
    };

    render(<Component />);

    // the text must be in the document
    expect(screen.getByTestId("state")).toHaveTextContent(
      getExpectedText(5, "context", "text5", "result5", "ref5", 8)
    );
    // action should be called once
    expect(action).toBeCalledTimes(1);
    // unmount should not be called
    expect(unmount).not.toBeCalled();

    // click on the button and set the state to re-render the component
    fireEvent.click(screen.getByTestId("state"));

    // the text must be in the document
    expect(screen.getByTestId("state")).toHaveTextContent(
      getExpectedText(6, "context", "text6", "result6", "ref5", 8)
    );
    // action should be called once
    expect(action).toBeCalledTimes(2);
    // unmount should not be called
    expect(unmount).toBeCalledTimes(1);

    // increment the state of the reducer
    fireEvent.click(screen.getByTestId("reducer"));

    // the text must be in the document
    expect(screen.getByTestId("state")).toHaveTextContent(
      getExpectedText(6, "context", "text6", "result6", "ref5", 9)
    );
    // action should be called once
    expect(action).toBeCalledTimes(2);
    // unmount should not be called
    expect(unmount).toBeCalledTimes(1);
  });

  test("Other hooks than ref should be undefined", () => {
    render(<OneUseRef />);

    expect(collector.getDataFor(OneUseRef.name)).not.toBeUndefined();
    expect(collector.getReactHooks(OneUseRef.name)).not.toBeUndefined();
    expect(
      collector.getReactHooks(OneUseRef.name)?.getAll("useEffect")
    ).toBeUndefined();
    expect(
      collector.getReactHooks(OneUseRef.name)?.getHook("useEffect", 1)
    ).toBeUndefined();
    expect(
      collector
        .getReactHooks(OneUseRef.name)
        ?.getHooksByType("useEffect")
        .get(1)
    ).toBeUndefined();
    expect(
      collector.getReactHooks(OneUseRef.name)?.getUseState(1).getState(1)
    ).toBeUndefined();
  });

  test("Recursive function", () => {
    /*
      call the function several times, the function must be taken from import, if it is not taken 
      from import and called directly in the function, it will not to be catched by the collector
    */
    recursiveFunction(10, recursiveFunction);

    // get data for the function
    const functionHistory = collector.getDataFor(recursiveFunction.name, {
      ignoreWarning: true
    });

    // recursive function must exist
    expect(functionHistory).not.toBeUndefined();

    // check global call count
    expect(functionHistory?.jestFn).not.toBeUndefined();
    expect(functionHistory?.jestFn).toBeCalledTimes(11);

    const allFunctionsHistory = collector.getAllDataFor(recursiveFunction.name);

    expect(allFunctionsHistory.length).toBe(11);

    // all calls should have the correct result number
    for (let i = 0; i < allFunctionsHistory.length; i++) {
      expect(allFunctionsHistory[i].calls[0].result).toBe(10 - i);
    }
  });

  test("Stats", () => {
    // create class, call function and render some components
    new TestClass();
    render(<ClassComponent />);
    recursiveFunction(3, recursiveFunction);
    render(<EmptyWithUseEffectAndUseCallback />);
    render(
      <>
        <UseEffectDeps data-testid={dataTestId1} deps={[1, 2, 3]} />
        <UseCallbackDeps data-testid={dataTestId2} deps={[{ prop: "value" }]} />
      </>
    );

    // get statistics for all, exclude time because it is always different
    expect(collector.getStats({ excludeTime: true })).toMatchSnapshot();

    // get statistics for specific component, exclude time because it is always different
    expect(
      collector.getStats(TestClass.name, { excludeTime: true })
    ).toMatchSnapshot();

    // time should not be zero
    expect(
      collector.getStats(TestClass.name)?.calls[0].stats.time
    ).not.toBeUndefined();
    expect(collector.getStats(TestClass.name)?.calls[0].stats.time).not.toBe(0);

    // get statistics for specific component with test id, exclude time because it is always different
    expect(
      collector.getStats(ComponentName, {
        dataTestId: dataTestId1,
        excludeTime: true
      })
    ).toMatchSnapshot();
  });

  test("Unregistered function", () => {
    expect(collector.getStats("unknown")).toBeUndefined();
    collector.reset("unknown");
  });

  test("Unknown function", () => {
    // everything must return udnefined
    expect(collector.getCallCount("SomeComponent")).toBeUndefined();
    expect(collector.getComponentData("SomeComponent")).toBeUndefined();
    expect(collector.getDataFor("SomeComponent")).toBeUndefined();
    expect(collector.getReactHooks("SomeComponent")).toBeUndefined();
    expect(collector.getReactHooks("SomeComponent")?.getAll()).toBeUndefined();
    expect(
      collector.getReactHooks("SomeComponent")?.getHook("useEffect", -1)
    ).toBeUndefined();
    expect(
      collector.getReactHooks("SomeComponent")?.getHook("useEffect", 0)
    ).toBeUndefined();
    expect(
      collector.getReactHooks("SomeComponent")?.getHook("useEffect", 1)
    ).toBeUndefined();
    expect(
      collector.getReactHooks("SomeComponent")?.getHooksByType("useEffect")
    ).toBeUndefined();
    expect(
      collector
        .getReactHooks("SomeComponent")
        ?.getHooksByType("useEffect")
        .get(-1)
    ).toBeUndefined();
    expect(
      collector
        .getReactHooks("SomeComponent")
        ?.getHooksByType("useEffect")
        .get(0)
    ).toBeUndefined();
    expect(
      collector
        .getReactHooks("SomeComponent")
        ?.getHooksByType("useEffect")
        .get(1)
    ).toBeUndefined();

    expect(collector.getReactLifecycle("SomeComponent")).toBeUndefined;

    collector.reset("SomeComponent");
  });
});
