import { render } from "@testing-library/react";
import React from "react";
import {
  ComplexComponent,
  ComponentWithChildren,
  DirectComponent,
  DirectComponentInTheSameFile,
  SimpleComponent
} from "./components/common";
import { UnregisteredComponentWithSimpleComponent } from "./components/common.unregistered";

console.warn = jest.fn();
const dataTestId1 = "test-id-1";
const dataTestId2 = "test-id-2";

beforeEach(() => {
  collector.reset();
  jest.clearAllMocks();
});

describe("Test id inheritance", () => {
  test("Direct component with external components", () => {
    // enable inheritance
    collector.enableDataTestIdInheritance();

    render(<DirectComponent data-testid={dataTestId1} />);

    // all children and called functions inside the component must have the dataTestId1
    expect(collector.getStats({ excludeTime: true })).toMatchSnapshot();
  });

  test("Direct component with internal component", () => {
    collector.enableDataTestIdInheritance();

    render(<DirectComponentInTheSameFile data-testid={dataTestId1} />);

    // all children and called functions inside the component must have the dataTestId1
    expect(collector.getStats({ excludeTime: true })).toMatchSnapshot();
  });

  test("Exclude data test id from not mocked elements - use case 1", () => {
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

  test("Exclude data test id from not mocked elements - use case 2", () => {
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

  test("Exclude data test id from not mocked elements - use case 3", () => {
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

  test("Exclude data test id from not mocked elements - use case 4", () => {
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

  test("Exclude data test id from not mocked elements - use case 5", () => {
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

  test("Exclude data test id from not mocked elements - use case 6", () => {
    collector.enableDataTestIdInheritance(true);

    render(
      <ComponentWithChildren data-testid={dataTestId1}>
        <pre>
          <div data-testid="some-id-1">
            <div>
              <SimpleComponent />
            </div>
          </div>
        </pre>
      </ComponentWithChildren>
    );

    expect(
      collector.getAllDataFor(SimpleComponent.name, { dataTestId: dataTestId1 })
        .length
    ).toBe(1);
  });

  test("Exclude data test id from not mocked elements - use case 7", () => {
    collector.enableDataTestIdInheritance(true);

    const SomeComponent = () => <SimpleComponent />;

    render(
      <ComponentWithChildren data-testid={dataTestId1}>
        <SomeComponent data-testid="some-id-1" />
      </ComponentWithChildren>
    );

    expect(
      collector.getAllDataFor(SimpleComponent.name, { dataTestId: dataTestId1 })
        .length
    ).toBe(1);
  });

  test("Inheritance disabled", () => {
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

  test("Inheritance enabled - use case 1", () => {
    // enable inheritance
    collector.enableDataTestIdInheritance();

    render(<ComplexComponent data-testid={dataTestId1} />);

    // all children and called functions inside the component must have the dataTestId1
    expect(collector.getStats({ excludeTime: true })).toMatchSnapshot();
  });

  test("Inheritance enabled - use case 2", () => {
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

  test("Inheritance enabled - use case 3", () => {
    collector.enableDataTestIdInheritance();

    render(
      <ComponentWithChildren data-testid={dataTestId1}>
        <SimpleComponent />
      </ComponentWithChildren>
    );

    expect(
      collector.getDataFor(SimpleComponent.name, { dataTestId: dataTestId1 })
    ).not.toBeUndefined();

    expect(
      collector.hasComponent(SimpleComponent.name, { dataTestId: dataTestId1 })
    ).toBeTruthy();
  });

  test("Test id should be passed from not mocked elements - use case 1", () => {
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

  test("Test id should be passed from not mocked elements - use case 2", () => {
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

  test("Test id should be passed from not mocked elements - use case 3", () => {
    collector.enableDataTestIdInheritance();

    render(
      <ComponentWithChildren>
        <pre>
          <div data-testid={dataTestId1}>
            <div>
              <SimpleComponent />
            </div>
          </div>
        </pre>
      </ComponentWithChildren>
    );

    expect(
      collector.getDataFor(SimpleComponent.name, { dataTestId: dataTestId1 })
    ).not.toBeUndefined();
  });

  test("Test id should be passed from not mocked elements - use case 4", () => {
    collector.enableDataTestIdInheritance();

    const SomeComponent = () => <SimpleComponent />;

    render(
      <ComponentWithChildren>
        <SomeComponent data-testid={dataTestId1} />
      </ComponentWithChildren>
    );

    expect(
      collector.getAllDataFor(SimpleComponent.name, { dataTestId: dataTestId1 })
        .length
    ).toBe(1);
  });
});
