import { render } from "@testing-library/react";
import React from "react";
import { ClassComponent } from "./components/class-components";
import {
  ComplexComponent,
  ComponentWithChildren,
  DirectComponent,
  DirectComponentInTheSameFile,
  SimpleComponent
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
    ).toBe(2);
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

    // get statistics for specific component with test id, exclude time because it is always different
    expect(
      collector.getStats(ComponentName, {
        dataTestId: dataTestId1,
        excludeTime: true
      })
    ).toMatchSnapshot();
  });

  test("Test id inheritance - direct component with external components", () => {
    // enable inheritance
    collector.enableDataTestIdInheritance();

    render(<DirectComponent data-testid={dataTestId1} />);

    // all children and called functions inside the component must have the dataTestId1
    expect(collector.getStats({ excludeTime: true })).toMatchSnapshot();
  });

  test("Test id inheritance - direct component with internal component", () => {
    collector.enableDataTestIdInheritance();

    render(<DirectComponentInTheSameFile data-testid={dataTestId1} />);

    // all children and called functions inside the component must have the dataTestId1
    expect(collector.getStats({ excludeTime: true })).toMatchSnapshot();
  });

  test("Test id inheritance - inheritance disabled", () => {
    const snapshotId = "inheritance disabed";

    // render with test id
    render(<ComplexComponent data-testid={dataTestId1} />);

    // only ComplexComponent should have dataTestId1
    expect(collector.getStats({ excludeTime: true })).toMatchSnapshot(
      snapshotId
    );

    collector.reset();

    // enable and disable inheritance
    collector.enableDataTestIdInheritance();
    collector.disableDataTestIdInheritance();

    // the result must be the same as in previous case
    render(<ComplexComponent data-testid={dataTestId1} />);
    expect(collector.getStats({ excludeTime: true })).toMatchSnapshot(
      snapshotId
    );
  });

  test("Test id inheritance - inheritance enabled - use case 1", () => {
    // enable inheritance
    collector.enableDataTestIdInheritance();

    render(<ComplexComponent data-testid={dataTestId1} />);

    // all children and called functions inside the component must have the dataTestId1
    expect(collector.getStats({ excludeTime: true })).toMatchSnapshot();
  });

  test("Test id inheritance - inheritance enabled - use case 2", () => {
    // enable inheritance
    collector.enableDataTestIdInheritance();

    render(
      <ComplexComponent
        data-testid={dataTestId1}
        templateDataTestId={dataTestId2}
      />
    );

    /*
      all children except for Template and its children should have dataTestId1
      Template and its childen should have dataTestId2
    */
    expect(collector.getStats({ excludeTime: true })).toMatchSnapshot();
  });

  test("Test id inheritance - inheritance enabled - use case 3", () => {
    collector.enableDataTestIdInheritance();

    render(
      <ComponentWithChildren data-testid={dataTestId1}>
        <SimpleComponent />
      </ComponentWithChildren>
    );

    expect(
      collector.getDataFor(SimpleComponent.name, { dataTestId: dataTestId1 })
    ).not.toBeUndefined();
  });

  test("Test id inheritance should be passed from not mocked elements - use case 1", () => {
    collector.enableDataTestIdInheritance();

    render(
      <ComponentWithChildren>
        <div data-testid={dataTestId1}>
          <SimpleComponent />
        </div>
        <div data-testid={dataTestId2}>
          <SimpleComponent />
        </div>
      </ComponentWithChildren>
    );

    expect(
      collector.getDataFor(SimpleComponent.name, { dataTestId: dataTestId1 })
    ).not.toBeUndefined();
    expect(
      collector.getDataFor(SimpleComponent.name, { dataTestId: dataTestId2 })
    ).not.toBeUndefined();
  });

  test("Test id inheritance should be passed from not mocked elements - use case 2", () => {
    collector.enableDataTestIdInheritance();

    render(
      <ComponentWithChildren>
        <div>
          <UnregisteredComponentWithSimpleComponent data-testid={dataTestId1} />
        </div>
      </ComponentWithChildren>
    );

    expect(
      collector.getDataFor(SimpleComponent.name, { dataTestId: dataTestId1 })
    ).not.toBeUndefined();
  });

  test("Test id inheritance - exclude data test id from not mocked elements - use case 1", () => {
    collector.enableDataTestIdInheritance(true);

    render(
      <ComponentWithChildren>
        <div data-testid={dataTestId1}>
          <SimpleComponent />
        </div>
        <div data-testid={dataTestId2}>
          <SimpleComponent />
        </div>
      </ComponentWithChildren>
    );

    expect(
      collector.getDataFor(SimpleComponent.name, { dataTestId: dataTestId1 })
    ).toBeUndefined();
    expect(
      collector.getDataFor(SimpleComponent.name, { dataTestId: dataTestId2 })
    ).toBeUndefined();
  });

  test("Test id inheritance - exclude data test id from not mocked elements - use case 2", () => {
    collector.enableDataTestIdInheritance(true);

    render(
      <ComponentWithChildren data-testid={dataTestId1}>
        <div data-testid="some-id-1">
          <SimpleComponent />
        </div>
        <div data-testid="some-id-2">
          <SimpleComponent />
        </div>
      </ComponentWithChildren>
    );

    expect(
      collector.getAllDataFor(SimpleComponent.name, { dataTestId: dataTestId1 })
        .length
    ).toBe(2);
  });

  test("Test id inheritance - exclude data test id from not mocked elements - use case 3", () => {
    collector.enableDataTestIdInheritance(true);

    render(
      <ComponentWithChildren data-testid={dataTestId1}>
        <div data-testid="some-id-1">
          <ComponentWithChildren data-testid={dataTestId2}>
            <SimpleComponent />
          </ComponentWithChildren>
        </div>
        <div data-testid="some-id-2">
          <SimpleComponent />
        </div>
      </ComponentWithChildren>
    );

    expect(
      collector.getDataFor(SimpleComponent.name, { dataTestId: dataTestId1 })
    ).not.toBeUndefined();
    expect(
      collector.getDataFor(SimpleComponent.name, { dataTestId: dataTestId2 })
    ).not.toBeUndefined();
  });

  test("Test id inheritance - exclude data test id from not mocked elements - use case 4", () => {
    collector.enableDataTestIdInheritance(true);

    render(
      <ComponentWithChildren>
        <div>
          <UnregisteredComponentWithSimpleComponent data-testid={dataTestId1} />
        </div>
      </ComponentWithChildren>
    );

    expect(
      collector.getDataFor(SimpleComponent.name, { dataTestId: dataTestId1 })
    ).toBeUndefined();
  });

  test("Test id inheritance - exclude data test id from not mocked elements - use case 5", () => {
    collector.enableDataTestIdInheritance(true);

    render(
      <ComponentWithChildren data-testid={dataTestId1}>
        <div>
          <UnregisteredComponentWithSimpleComponent data-testid={dataTestId2} />
        </div>
      </ComponentWithChildren>
    );

    expect(
      collector.getDataFor(SimpleComponent.name, { dataTestId: dataTestId1 })
    ).not.toBeUndefined();
    expect(
      collector.getDataFor(SimpleComponent.name, { dataTestId: dataTestId2 })
    ).toBeUndefined();
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
