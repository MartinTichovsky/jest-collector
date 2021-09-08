import { render, screen } from "@testing-library/react";
import React from "react";
import {
  reactContext1,
  reactContext2,
  UseContext
} from "./components/UseContext";

beforeEach(() => {
  collector.reset();
});

describe("useContext", () => {
  test("Component with useContext", () => {
    render(<UseContext />);

    const useContextHooks = collector
      .getReactHooks(UseContext.name)
      .getHooksByType("useContext");

    expect(useContextHooks.get(1)).not.toBeUndefined();
    expect(useContextHooks.get(1)).not.toBeUndefined();
    expect(useContextHooks.get(3)).toBeUndefined();
    expect(useContextHooks.get(1)?.args).toEqual(reactContext1);
    expect(useContextHooks.get(1)?.context).toBeUndefined;
    expect(useContextHooks.get(2)?.args).toEqual(reactContext2);
    expect(useContextHooks.get(2)?.context).toEqual({});

    render(
      <reactContext1.Provider value="Context">
        <UseContext />
      </reactContext1.Provider>
    );

    expect(screen.getByText("Context")).toBeTruthy();
    expect(useContextHooks.get(1)?.args).toEqual(reactContext1);
    expect(useContextHooks.get(1)?.context).toBe("Context");
    expect(useContextHooks.get(2)?.args).toEqual(reactContext2);
    expect(useContextHooks.get(2)?.context).toEqual({});
  });

  test("Component with test id", () => {
    const getExpectedText = (text1: string, text2: string) =>
      `Context ${text1} ${text2}`.trim();
    const testId1 = "test-id-1";
    const testId2 = "test-id-2";

    render(<UseContext />);

    const useContextHooks = collector
      .getReactHooks(UseContext.name)
      .getHooksByType("useContext");

    expect(screen.getByText(getExpectedText("", ""))).toBeTruthy();
    expect(useContextHooks.get(1)).not.toBeUndefined();
    expect(useContextHooks.get(2)).not.toBeUndefined();
    expect(useContextHooks.get(3)).toBeUndefined();
    expect(useContextHooks.get(1)?.args).toEqual(reactContext1);
    expect(useContextHooks.get(1)?.context).toBeUndefined;
    expect(useContextHooks.get(2)?.args).toEqual(reactContext2);
    expect(useContextHooks.get(2)?.context).toEqual({});

    render(
      <reactContext1.Provider value="Provider1">
        <UseContext />
      </reactContext1.Provider>
    );

    expect(screen.getByText(getExpectedText("Provider1", ""))).toBeTruthy();
    expect(useContextHooks.get(1)?.args).toEqual(reactContext1);
    expect(useContextHooks.get(1)?.context).toBe("Provider1");
    expect(useContextHooks.get(2)?.args).toEqual(reactContext2);
    expect(useContextHooks.get(2)?.context).toEqual({});

    render(
      <reactContext1.Provider value="Provider1">
        <reactContext2.Provider value={{ text: "Provider2" }}>
          <UseContext />
        </reactContext2.Provider>
      </reactContext1.Provider>
    );

    expect(
      screen.getByText(getExpectedText("Provider1", "Provider2"))
    ).toBeTruthy();
    expect(useContextHooks.get(1)?.args).toEqual(reactContext1);
    expect(useContextHooks.get(1)?.context).toBe("Provider1");
    expect(useContextHooks.get(2)?.args).toEqual(reactContext2);
    expect(useContextHooks.get(2)?.context).toEqual({ text: "Provider2" });

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

    const useContextHooks1 = collector
      .getReactHooks(UseContext.name, { dataTestId: testId1 })
      .getHooksByType("useContext");
    const useContextHooks2 = collector
      .getReactHooks(UseContext.name, { dataTestId: testId2 })
      .getHooksByType("useContext");

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
});
