import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { ClassComponent } from "./components/class-components";
import {
  ComponentWithChildren,
  SimpleComponent,
  SimpleComponentInTheSameFile
} from "./components/common";
import {
  EmptyWithUseEffectAndUseCallback,
  UnregisteredComponentWithSimpleComponent
} from "./components/common.unregistered";
import { WithDeps as UseCallbackDeps } from "./components/UseCallback";
import { WithDeps as UseEffectDeps } from "./components/UseEffect";
import { TestClass } from "./others/class";
import { recursiveFunction } from "./others/recursive-function";

console.warn = jest.fn();
const ComponentName = "WithDeps";
const dataTestId1 = "test-id-1";
const dataTestId2 = "test-id-2";
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
    expect(collector.getDataFor(ComponentName)).toBeUndefined();
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
      ref: string
    ) =>
      `state:${state},context:${context},callback:${callbackResult},memo:${memo},ref:${ref}`;

    const action = jest.fn();
    const unmount = jest.fn();

    const reactCoontext = React.createContext("context");

    const Component = () => {
      const [state, setState] = React.useState(5);
      const context = React.useContext(reactCoontext);
      const callback = React.useCallback(() => {
        return `text${state}`;
      }, [state]);
      const memo = React.useMemo(() => `result${state}`, [state]);
      const ref = React.useRef(`ref${state}`);

      React.useEffect(() => {
        action();
        return unmount;
      }, [state]);

      const onClick = () => {
        setState((prevValue) => prevValue + 1);
      };

      return (
        <div>
          <button onClick={onClick}>
            {getExpectedText(state, context, callback(), memo, ref.current)}
          </button>
        </div>
      );
    };

    render(<Component />);

    // the text must be in the document
    expect(screen.getByRole("button")).toHaveTextContent(
      getExpectedText(5, "context", "text5", "result5", "ref5")
    );
    // action should be called once
    expect(action).toBeCalledTimes(1);
    // unmount should not be called
    expect(unmount).not.toBeCalled();

    // click on the button and set the state to re-render the component
    fireEvent.click(screen.getByRole("button"));

    expect(screen.getByRole("button")).toHaveTextContent(
      getExpectedText(6, "context", "text6", "result6", "ref5")
    );
    // action should be called once
    expect(action).toBeCalledTimes(2);
    // unmount should not be called
    expect(unmount).toBeCalledTimes(1);
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

    expect(allFunctionsHistory.length).toBe(2);

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

    // get statistics for specific component with test id, exclude time because it is always different
    expect(
      collector.getStats(ComponentName, {
        dataTestId: dataTestId1,
        excludeTime: true
      })
    ).toMatchSnapshot();
  });

  test("Unknown function", () => {
    // everything must return udnefined
    expect(collector.getCallCount("SomeComponent")).toBeUndefined();
    expect(collector.getComponentData("SomeComponent")).toBeUndefined();
    expect(collector.getDataFor("SomeComponent")).toBeUndefined();
    expect(collector.getReactHooks("SomeComponent")).not.toBeUndefined();
    expect(collector.getReactHooks("SomeComponent").getAll()).toBeUndefined();
    expect(
      collector.getReactHooks("SomeComponent").getHook("useEffect", -1)
    ).toBeUndefined();
    expect(
      collector.getReactHooks("SomeComponent").getHook("useEffect", 0)
    ).toBeUndefined();
    expect(
      collector.getReactHooks("SomeComponent").getHook("useEffect", 1)
    ).toBeUndefined();
    expect(
      collector.getReactHooks("SomeComponent").getHooksByType("useEffect")
    ).not.toBeUndefined();
    expect(
      collector
        .getReactHooks("SomeComponent")
        .getHooksByType("useEffect")
        .get(-1)
    ).toBeUndefined();
    expect(
      collector
        .getReactHooks("SomeComponent")
        .getHooksByType("useEffect")
        .get(0)
    ).toBeUndefined();
    expect(
      collector
        .getReactHooks("SomeComponent")
        .getHooksByType("useEffect")
        .get(1)
    ).toBeUndefined();
  });
});
