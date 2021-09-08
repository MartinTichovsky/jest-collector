import { act, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { ClassComponent } from "./components/class-components";

beforeEach(() => {
  collector.reset();
});

describe("Class component", () => {
  test("Component", () => {
    render(<ClassComponent />);

    const lifecycle = collector.getReactComponentLifecycle(ClassComponent.name);

    expect(lifecycle).not.toBeUndefined();

    expect(screen.getByText("Component context - something")).toBeTruthy();
    expect(lifecycle?.render).toBeCalledTimes(1);
    expect(lifecycle?.setState).not.toBeCalled();

    act(() => {
      fireEvent.click(screen.getByRole("button"));
    });

    expect(screen.getByText("Component context - text")).toBeTruthy();

    expect(lifecycle?.render).toBeCalledTimes(2);
    expect(lifecycle?.setState).toBeCalledTimes(1);
  });
});
