import fs from "fs";
import { getTestPath } from "../jest-globals";
import {
  convertFileSystem,
  convertFileSystemArray,
  createRegexp,
  getFiles,
  ignoreTest,
  testRegex
} from "../utils";

jest.mock("fs", () => {
  const origin = jest.requireActual("fs");
  const { lstatSyncMock, readdirSyncMock } = require("./helpers/fs-path");
  const fileSystem = require("./helpers/utils.file-structure");

  return {
    ...origin,
    lstatSync: lstatSyncMock(fileSystem),
    readdirSync: readdirSyncMock(fileSystem)
  };
});

jest.mock("path", () => {
  const origin = jest.requireActual("path");

  return {
    ...origin,
    resolve: (item1: string, item2: string) => `${item1}/${item2}`
  };
});

jest.mock("../jest-globals", () => {
  const origin = jest.requireActual("../jest-globals");

  return {
    ...origin,
    getTestPath: jest.fn()
  };
});

const _getTestPath = getTestPath as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Wildcards", () => {
  test("Match all items", () => {
    const testSuite = (pattern: string) => {
      expect(() => testRegex([pattern])).not.toThrowError();
      expect("/folder".match(pattern)).not.toBeNull();
      expect("/file.tsx".match(pattern)).not.toBeNull();
      expect("/folder/file.tsx".match(pattern)).not.toBeNull();
      expect("/folder/folder/file.tsx".match(pattern)).not.toBeNull();
      expect("folder".match(pattern)).toBeNull();
    };

    testSuite(createRegexp("**/*"));
    testSuite(createRegexp("/**/*"));
    testSuite(createRegexp("./**/*"));
    testSuite(createRegexp("^/**/*$"));
  });

  test("Match only one item in root", () => {
    const testSuite = (pattern: string) => {
      expect(() => testRegex([pattern])).not.toThrowError();
      expect("/folder".match(pattern)).toBeNull();
      expect("/file.tsx".match(pattern)).not.toBeNull();
      expect("/folder/file.tsx".match(pattern)).toBeNull();
      expect("/folder/folder/file.tsx".match(pattern)).toBeNull();
      expect("folder".match(pattern)).toBeNull();
    };

    testSuite(createRegexp("/file.tsx"));
    testSuite(createRegexp("./file.tsx"));
    testSuite(createRegexp("^/file.tsx$"));
  });

  test("Match only one item in every folder", () => {
    const testSuite = (pattern: string) => {
      expect(() => testRegex([pattern])).not.toThrowError();
      expect("/folder".match(pattern)).toBeNull();
      expect("/file.tsx".match(pattern)).not.toBeNull();
      expect("/folder/file.tsx".match(pattern)).not.toBeNull();
      expect("/folder/folder/file.tsx".match(pattern)).not.toBeNull();
      expect("folder".match(pattern)).toBeNull();
    };

    testSuite(createRegexp("file.tsx"));
  });

  test("Match all files in root or first folder", () => {
    const testSuite = (pattern: string) => {
      expect(() => testRegex([pattern])).not.toThrowError();
      expect("/folder".match(pattern)).toBeNull();
      expect("/file.tsx".match(pattern)).not.toBeNull();
      expect("/folder/file.tsx".match(pattern)).not.toBeNull();
      expect("/folder/folder/file.tsx".match(pattern)).toBeNull();
      expect("folder".match(pattern)).toBeNull();
    };

    testSuite(createRegexp("**/file.tsx"));
    testSuite(createRegexp("/**/file.tsx"));
    testSuite(createRegexp("./**/file.tsx"));
    testSuite(createRegexp("^./**/file.tsx$"));
  });

  test("Match all files in every folder", () => {
    const testSuite = (pattern: string) => {
      expect(() => testRegex([pattern])).not.toThrowError();
      expect("/folder".match(pattern)).toBeNull();
      expect("/file.tsx".match(pattern)).not.toBeNull();
      expect("/folder/file.tsx".match(pattern)).not.toBeNull();
      expect("/folder/folder/file.tsx".match(pattern)).not.toBeNull();
      expect("folder".match(pattern)).toBeNull();
    };

    testSuite(createRegexp("**/*/file.tsx"));
    testSuite(createRegexp("/**/*/file.tsx"));
    testSuite(createRegexp("./**/*/file.tsx"));
    testSuite(createRegexp("^**/*/file.tsx"));
  });

  test("Match all files starts with in root", () => {
    const testSuite = (pattern: string) => {
      expect(() => testRegex([pattern])).not.toThrowError();
      expect("/folder".match(pattern)).toBeNull();
      expect("/name-file.tsx".match(pattern)).not.toBeNull();
      expect("/folder/name-file.tsx".match(pattern)).toBeNull();
      expect("/folder/folder/name-file.tsx".match(pattern)).toBeNull();
      expect("folder".match(pattern)).toBeNull();
    };

    testSuite(createRegexp("*-file.tsx"));
    testSuite(createRegexp("/*-file.tsx"));
    testSuite(createRegexp("./*-file.tsx"));
  });

  test("Match all files starts with in every folder", () => {
    const testSuite = (pattern: string) => {
      expect(() => testRegex([pattern])).not.toThrowError();
      expect("/folder".match(pattern)).toBeNull();
      expect("/name-file.tsx".match(pattern)).not.toBeNull();
      expect("/folder/name-file.tsx".match(pattern)).not.toBeNull();
      expect("/folder/folder/name-file.tsx".match(pattern)).not.toBeNull();
      expect("folder".match(pattern)).toBeNull();
    };

    testSuite(createRegexp("**/*-file.tsx"));
    testSuite(createRegexp("/**/*-file.tsx"));
    testSuite(createRegexp("./**/*-file.tsx"));
    testSuite(createRegexp("**/*/*-file.tsx"));
    testSuite(createRegexp("/**/*/*-file.tsx"));
    testSuite(createRegexp("./**/*/*-file.tsx"));
  });

  test("Case sensitive", () => {
    const pattern = createRegexp("File.tsx");

    expect("/File.tsx".match(pattern)).not.toBeNull();
    expect("/file.tsx".match(pattern)).toBeNull();
  });
});

test("ConvertFileSystem", () => {
  expect(convertFileSystem("jest-collector\\src\\unit.test.ts")).toBe(
    "jest-collector/src/unit.test.ts"
  );
});

test("ConvertFileSystemArray", () => {
  expect(convertFileSystemArray(["jest-collector\\src\\unit.test.ts"])).toEqual(
    ["jest-collector/src/unit.test.ts"]
  );
});

describe("GetFiles", () => {
  test("File system", () => {
    expect(fs.readdirSync("src")).toEqual([
      "folder1",
      "folder2",
      "empty-folder",
      "file1.ts",
      "file2.ts",
      "file3.tsx",
      "file3.test.tsx"
    ]);
    expect(fs.readdirSync("src/folder1")).toEqual(["file1-1.ts"]);
    expect(fs.readdirSync("src/folder2/folder2-1")).toEqual([
      "file2-1-1.ts",
      "file2-1-1.test.ts"
    ]);
    expect(fs.readdirSync("src/file1")).toEqual([]);
    expect(fs.readdirSync("src/file1.ts")).toEqual([]);

    expect(fs.lstatSync("src/folder1").isDirectory()).toBeTruthy();
    expect(fs.lstatSync("src/folder2/folder2-1").isDirectory()).toBeTruthy();
    expect(fs.lstatSync("src/file1").isDirectory()).toBeFalsy();
    expect(fs.lstatSync("src/file1.ts").isDirectory()).toBeFalsy();
  });

  test("Get all files", () => {
    const files = [
      "./src/folder1/file1-1.ts",
      "./src/folder2/folder2-1/file2-1-1.ts",
      "./src/folder2/folder2-1/file2-1-1.test.ts",
      "./src/folder2/file2-1.ts",
      "./src/folder2/file2-2.ts",
      "./src/folder2/file2-2.test.ts",
      "./src/folder2/file2-3.tsx",
      "./src/file1.ts",
      "./src/file2.ts",
      "./src/file3.tsx",
      "./src/file3.test.tsx"
    ];
    expect(
      convertFileSystemArray(
        getFiles({
          exclude: [],
          extensions: [],
          folder: "src",
          include: [],
          root: "src"
        })
      )
    ).toEqual(files);

    expect(
      convertFileSystemArray(
        getFiles({
          exclude: [],
          extensions: [".ts", ".tsx"],
          folder: "src",
          include: [],
          root: "src"
        })
      )
    ).toEqual(files);
  });

  test("Get all ts files", () => {
    expect(
      convertFileSystemArray(
        getFiles({
          exclude: [],
          extensions: [".ts"],
          folder: "src",
          include: [],
          root: "src"
        })
      )
    ).toEqual([
      "./src/folder1/file1-1.ts",
      "./src/folder2/folder2-1/file2-1-1.ts",
      "./src/folder2/folder2-1/file2-1-1.test.ts",
      "./src/folder2/file2-1.ts",
      "./src/folder2/file2-2.ts",
      "./src/folder2/file2-2.test.ts",
      "./src/file1.ts",
      "./src/file2.ts"
    ]);
  });

  test("Get all tsx files", () => {
    expect(
      convertFileSystemArray(
        getFiles({
          exclude: [],
          extensions: [".tsx"],
          folder: "src",
          include: [],
          root: "src"
        })
      )
    ).toEqual([
      "./src/folder2/file2-3.tsx",
      "./src/file3.tsx",
      "./src/file3.test.tsx"
    ]);
  });

  test("Exclude a folder", () => {
    expect(
      convertFileSystemArray(
        getFiles({
          exclude: [createRegexp("folder2/**/*")],
          extensions: [".ts"],
          folder: "src",
          include: [],
          root: "src"
        })
      )
    ).toEqual(["./src/folder1/file1-1.ts", "./src/file1.ts", "./src/file2.ts"]);
  });

  test("Exclude files", () => {
    expect(
      convertFileSystemArray(
        getFiles({
          exclude: [createRegexp("**/*.test.(tsx?)")],
          extensions: [],
          folder: "src",
          include: [],
          root: "src"
        })
      )
    ).toEqual([
      "./src/folder1/file1-1.ts",
      "./src/folder2/folder2-1/file2-1-1.ts",
      "./src/folder2/file2-1.ts",
      "./src/folder2/file2-2.ts",
      "./src/folder2/file2-3.tsx",
      "./src/file1.ts",
      "./src/file2.ts",
      "./src/file3.tsx"
    ]);
  });

  test("Include a folder", () => {
    expect(
      convertFileSystemArray(
        getFiles({
          exclude: [],
          extensions: [".ts"],
          folder: "src",
          include: [createRegexp("folder2/**")],
          root: "src"
        })
      )
    ).toEqual([
      "./src/folder2/file2-1.ts",
      "./src/folder2/file2-2.ts",
      "./src/folder2/file2-2.test.ts"
    ]);
  });

  test("Include files", () => {
    expect(
      convertFileSystemArray(
        getFiles({
          exclude: [],
          extensions: [],
          folder: "src",
          include: [createRegexp("**/*.test.(tsx?)")],
          root: "src"
        })
      )
    ).toEqual([
      "./src/folder2/folder2-1/file2-1-1.test.ts",
      "./src/folder2/file2-2.test.ts",
      "./src/file3.test.tsx"
    ]);
  });

  test("Non existing folder", () => {
    expect(
      getFiles({
        exclude: [],
        extensions: [],
        folder: "srca",
        include: [],
        root: "src"
      })
    ).toEqual([]);
  });
});

test("TestRegex", () => {
  expect(() => testRegex(["abcd["])).toThrowError();
});

describe("IgnoreTest", () => {
  test("Default", () => {
    expect(ignoreTest("exclude")).toBeFalsy();
    expect(ignoreTest("include")).toBeTruthy();

    _getTestPath.mockReturnValue(expect.getState().testPath);

    expect(ignoreTest("exclude")).toBeFalsy();
    expect(ignoreTest("include")).toBeTruthy();
  });

  test("Exclude", () => {
    _getTestPath.mockReturnValue("/some.test.tsx");
    expect(ignoreTest("exclude", ["some.test.tsx"])).toBeTruthy();
  });

  test("Include", () => {
    _getTestPath.mockReturnValue("/some.test.tsx");
    expect(ignoreTest("include", ["some.test.tsx"])).toBeTruthy();
  });
});
