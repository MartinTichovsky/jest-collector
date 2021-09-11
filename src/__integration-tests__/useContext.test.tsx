import { render, screen } from "@testing-library/react";
import React from "react";
import {
  reactContext1,
  reactContext2,
  UseContext
} from "./components/UseContext";

const getExpectedText = (text1: string, text2: string) =>
  `Context ${text1} ${text2}`.trim();

beforeEach(() => {
  collector.reset();
});

describe("useContext", () => {
  test("Inheritance of the providers and test id in use", () => {
    const testId1 = "test-id-1";
    const testId2 = "test-id-2";

    // test with test id and more providers
    render(
      <reactContext1.Provider value="Provider-0">
        <reactContext1.Provider value="Provider1-A">
          <reactContext2.Provider value={{ text: "Provider2-A" }}>
            <UseContext data-testid={testId1} />
          </reactContext2.Provider>
        </reactContext1.Provider>
        <UseContext data-testid={testId2} />
      </reactContext1.Provider>
    );

    // get useCallback hooks
    const useContextHooks1 = collector
      .getReactHooks(UseContext.name, { dataTestId: testId1 })
      .getHooksByType("useContext");
    const useContextHooks2 = collector
      .getReactHooks(UseContext.name, { dataTestId: testId2 })
      .getHooksByType("useContext");

    // every context should have correct value passed from the provider
    expect(
      screen.getByText(getExpectedText("Provider1-A", "Provider2-A"))
    ).toBeTruthy();
    expect(screen.getByText(getExpectedText("Provider-0", ""))).toBeTruthy();
    expect(useContextHooks1.get(1)?.args).toEqual(reactContext1);
    expect(useContextHooks1.get(1)?.context).toBe("Provider1-A");
    expect(useContextHooks1.get(2)?.args).toEqual(reactContext2);
    expect(useContextHooks1.get(2)?.context).toEqual({ text: "Provider2-A" });
    expect(useContextHooks2.get(1)?.args).toEqual(reactContext1);
    expect(useContextHooks2.get(1)?.context).toBe("Provider-0");
    expect(useContextHooks2.get(2)?.args).toEqual(reactContext2);
    expect(useContextHooks2.get(2)?.context).toEqual({});
  });

  test("Render a component without and with context provider", () => {
    render(<UseContext />);

    // get useContext hooks
    const useContextHooks = collector
      .getReactHooks(UseContext.name)
      .getHooksByType("useContext");

    // the contexts should have default value
    expect(screen.getByText(getExpectedText("", ""))).toBeTruthy();
    expect(useContextHooks.get(1)).not.toBeUndefined();
    expect(useContextHooks.get(2)).not.toBeUndefined();
    expect(useContextHooks.get(3)).toBeUndefined();
    expect(useContextHooks.get(1)?.args).toEqual(reactContext1);
    expect(useContextHooks.get(1)?.context).toBeUndefined;
    expect(useContextHooks.get(2)?.args).toEqual(reactContext2);
    expect(useContextHooks.get(2)?.context).toEqual({});

    // render with reactContext1 provider only
    render(
      <reactContext1.Provider value="Provider1">
        <UseContext />
      </reactContext1.Provider>
    );

    // only the first context should have the passed value from the provider
    expect(screen.getByText(getExpectedText("Provider1", ""))).toBeTruthy();
    expect(useContextHooks.get(1)?.args).toEqual(reactContext1);
    expect(useContextHooks.get(1)?.context).toBe("Provider1");
    expect(useContextHooks.get(2)?.args).toEqual(reactContext2);
    expect(useContextHooks.get(2)?.context).toEqual({});

    // render with both providers
    render(
      <reactContext1.Provider value="Provider1">
        <reactContext2.Provider value={{ text: "Provider2" }}>
          <UseContext />
        </reactContext2.Provider>
      </reactContext1.Provider>
    );

    // both contexts should have the passed values from the providers
    expect(
      screen.getByText(getExpectedText("Provider1", "Provider2"))
    ).toBeTruthy();
    expect(useContextHooks.get(1)?.args).toEqual(reactContext1);
    expect(useContextHooks.get(1)?.context).toBe("Provider1");
    expect(useContextHooks.get(2)?.args).toEqual(reactContext2);
    expect(useContextHooks.get(2)?.context).toEqual({ text: "Provider2" });
  });
});
