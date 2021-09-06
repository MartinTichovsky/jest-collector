import { getCallerName } from "../caller";

describe("getCallerName", () => {
  test("First caller", () => {
    expect(
      (function TestFunc() {
        return getCallerName(0);
      })()
    ).toBe("getCallerName");
  });

  test("Second caller", () => {
    expect(
      (function TestFunc() {
        return getCallerName();
      })()
    ).toBe("TestFunc");
  });
});
