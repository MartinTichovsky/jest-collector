import { getCaller } from "../caller";

describe("getCaller", () => {
  test("First caller", () => {
    expect(
      (function TestFunc() {
        const caller = getCaller(0);

        return {
          name: caller.name,
          relativePath: caller.relativePath
        };
      })()
    ).toEqual({
      name: "getCaller",
      relativePath: "/src/caller.ts"
    });
  });

  test("Second caller", () => {
    expect(
      (function TestFunc() {
        const caller = getCaller();

        return {
          name: caller.name,
          relativePath: caller.relativePath
        };
      })()
    ).toEqual({
      name: "TestFunc",
      relativePath: "/src/__tests__/caller.test.ts"
    });
  });
});
