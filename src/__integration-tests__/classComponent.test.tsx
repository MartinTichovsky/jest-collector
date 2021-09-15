import { act, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { ClassComponent } from "./components/class-components";
import { UnregisteredClassComponent } from "./components/common.unregistered";

beforeEach(() => {
  collector.reset();
});

describe("Class component", () => {
  test("Lifecycle", () => {
    render(<ClassComponent />);

    // get the lifecycle
    const lifecycle = collector.getReactLifecycle(ClassComponent.name);

    // iifecycle should exist
    expect(lifecycle).not.toBeUndefined();

    // componet should be render with the defaut text
    expect(screen.getByText("Component context - something")).toBeTruthy();

    // component should be called and rendered once
    expect(collector.getCallCount(ClassComponent.name)).toBe(1);
    expect(lifecycle?.render).toBeCalledTimes(1);

    // setState should not to be called
    expect(lifecycle?.setState).not.toBeCalled();

    // click on a button, which will setState
    act(() => {
      fireEvent.click(screen.getByRole("button"));
    });

    // componet should have new text in the content
    expect(screen.getByText("Component context - text")).toBeTruthy();

    // component should be called and rendered twice
    expect(collector.getCallCount(ClassComponent.name)).toBe(2);
    expect(lifecycle?.render).toBeCalledTimes(2);

    // setState should be called once
    expect(lifecycle?.setState).toBeCalledTimes(1);

    // new render with the same component
    render(<ClassComponent />);

    // component should be called three times
    expect(collector.getCallCount(ClassComponent.name)).toBe(3);
  });

  test("Unregistered class", () => {
    render(<UnregisteredClassComponent />);

    expect(screen.getByText("Class component content")).toBeTruthy();
  });
});
