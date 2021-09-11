import { mockFunction, registerClone } from "../clone-function";
import { PrivateCollector } from "../private-collector";

const collector = new PrivateCollector();
let mockDescribeNativeComponentFrame = false;

jest.mock("../caller", () => {
  const origin = jest.requireActual("../caller");

  return {
    ...origin,
    getCaller: (...props: any) =>
      mockDescribeNativeComponentFrame
        ? { name: "describeNativeComponentFrame" }
        : origin.getCaller(...props)
  };
});

beforeEach(() => {
  mockDescribeNativeComponentFrame = false;
});

describe("mockFunction and clone", () => {
  test("Clone a function", () => {
    expect(Function.prototype["clone"]).toBeUndefined();
    registerClone();
    expect(Function.prototype["clone"]).not.toBeUndefined();
  });

  test("Function without parameters", () => {
    function TestFunction() {
      return 5;
    }
    const mockedFunction = mockFunction(TestFunction, collector, __filename);
    expect(mockedFunction).not.toEqual(TestFunction);
    expect(mockedFunction.name).toBe(TestFunction.name);
    expect(mockedFunction()).toBe(5);
  });

  test("Function with parameters", () => {
    function TestFunction(a: number, b: number) {
      return a + b;
    }
    const mockedFunction = mockFunction(TestFunction, collector, __filename);
    expect(mockedFunction(5, 6)).toBe(11);
  });

  test("Function with an object", () => {
    function TestFunction({ a, b }: { a: number; b: number }) {
      return a + b;
    }
    const mockedFunction = mockFunction(TestFunction, collector, __filename);
    expect(mockedFunction({ a: 8, b: 9 })).toBe(17);
  });

  test("Function called with new", () => {
    function TestFunction(this: any, { a, b }: { a: number; b: number }) {
      this.result = a + b;
    }
    const mockedFunction = mockFunction(TestFunction, collector, __filename);
    expect(new mockedFunction({ a: 1, b: 2 }).result).toBe(3);
  });

  test("describeNativeComponentFrame should be skipped", () => {
    function reactCaller(...props: any) {
      function describeNativeComponentFrame(...props: any) {
        return props;
      }
      return describeNativeComponentFrame(...props);
    }
    mockDescribeNativeComponentFrame = true;
    const mockedFunction = mockFunction(reactCaller, collector, __filename);
    expect(mockedFunction({ children: [123] })).toBeNull();
  });

  test("Passing data-testid", () => {
    function TestFunction(props: any) {
      return props?.["data-testid"];
    }
    const mockedFunction = mockFunction(TestFunction, collector, __filename);
    expect(mockedFunction({ "data-testid": "test-id" })).toBe("test-id");
    expect(mockedFunction()).toBeUndefined();
    expect(mockedFunction({})).toBeUndefined();
  });

  test("Anonymous function", () => {
    const mockedFunction = mockFunction(
      () => {
        return "something";
      },
      collector,
      __filename
    );
    expect(mockedFunction()).toBe("something");
  });
});
