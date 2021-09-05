import fs from "fs";
import {
  convertFileSystem,
  convertFileSystemArray,
  createRegexp,
  getFiles,
  testRegex
} from "./utils";

type FileSystem = (string | [directory: string, items: FileSystem])[];
let fileSystem: FileSystem = [
  [
    "src",
    [
      ["folder1", ["file1-1.ts"]],
      [
        "folder2",
        [
          ["folder2-1", ["file2-1-1.ts", "file2-1-1.test.ts"]],
          "file2-1.ts",
          "file2-2.ts",
          "file2-2.test.ts",
          "file2-3.tsx"
        ]
      ],
      ["empty-folder", []],
      "file1.ts",
      "file2.ts",
      "file3.tsx",
      "file3.test.tsx"
    ]
  ]
];

jest.mock("fs", () => {
  const origin = jest.requireActual("fs");

  return {
    ...origin,
    lstatSync: (item: string) => ({
      isDirectory: () => {
        item = item.replace(process.cwd(), "");
        const paths = item.split("/");

        let isDirectory = false;
        let folderItems = fileSystem.slice();

        for (let key of paths) {
          const existingItem = folderItems.find(
            (item) => (Array.isArray(item) && item[0] === key) || item === key
          );

          if (!existingItem || !Array.isArray(existingItem)) {
            isDirectory = false;
            break;
          }

          folderItems = existingItem[1].slice();
          isDirectory = true;
        }

        return isDirectory;
      }
    }),
    readdirSync: (folder: string) => {
      folder = folder.replace(process.cwd(), "");
      const paths = folder.split("/");
      let folderItems = fileSystem.slice();

      for (let key of paths) {
        const existingItem = folderItems.find(
          (item) => (Array.isArray(item) && item[0] === key) || item === key
        );
        if (!existingItem || !Array.isArray(existingItem)) {
          folderItems = [];
          break;
        }
        folderItems = existingItem[1].slice();
      }

      return folderItems.map((item) => (Array.isArray(item) ? item[0] : item));
    }
  };
});

jest.mock("path", () => {
  const origin = jest.requireActual("path");

  return {
    ...origin,
    resolve: (item1: string, item2: string) => `${item1}/${item2}`
  };
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

  test("Match only one item", () => {
    const testSuite = (pattern: string) => {
      expect(() => testRegex([pattern])).not.toThrowError();
      expect("/folder".match(pattern)).toBeNull();
      expect("/file.tsx".match(pattern)).not.toBeNull();
      expect("/folder/file.tsx".match(pattern)).toBeNull();
      expect("/folder/folder/file.tsx".match(pattern)).toBeNull();
      expect("folder".match(pattern)).toBeNull();
    };

    testSuite(createRegexp("file.tsx"));
    testSuite(createRegexp("/file.tsx"));
    testSuite(createRegexp("./file.tsx"));
    testSuite(createRegexp("^/file.tsx$"));
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

test("convertFileSystem", () => {
  expect(convertFileSystem("jest-collector\\src\\unit.test.ts")).toBe(
    "jest-collector/src/unit.test.ts"
  );
});

test("convertFileSystemArray", () => {
  expect(convertFileSystemArray(["jest-collector\\src\\unit.test.ts"])).toEqual(
    ["jest-collector/src/unit.test.ts"]
  );
});

describe("getFiles", () => {
  test("fileSystem", () => {
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
        getFiles({ excludeItems: [], extensions: [], folder: "src" })
      )
    ).toEqual(files);

    expect(
      convertFileSystemArray(
        getFiles({
          excludeItems: [],
          extensions: [".ts", ".tsx"],
          folder: "src"
        })
      )
    ).toEqual(files);
  });

  test("Get all ts files", () => {
    expect(
      convertFileSystemArray(
        getFiles({ excludeItems: [], extensions: [".ts"], folder: "src" })
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
        getFiles({ excludeItems: [], extensions: [".tsx"], folder: "src" })
      )
    ).toEqual([
      "./src/folder2/file2-3.tsx",
      "./src/file3.tsx",
      "./src/file3.test.tsx"
    ]);
  });

  test("Exclude folder", () => {
    expect(
      convertFileSystemArray(
        getFiles({
          excludeItems: [createRegexp("src/**/folder2")],
          extensions: [".ts"],
          folder: "src"
        })
      )
    ).toEqual(["./src/folder1/file1-1.ts", "./src/file1.ts", "./src/file2.ts"]);
  });

  test("Exclude files", () => {
    expect(
      convertFileSystemArray(
        getFiles({
          excludeItems: [createRegexp("src/**/*.test.(tsx?)")],
          extensions: [],
          folder: "src"
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

  test("Non existing folder", () => {
    expect(
      getFiles({
        excludeItems: [],
        extensions: [],
        folder: "srca"
      })
    ).toEqual([]);
  });
});

test("testRegex", () => {
  expect(() => testRegex(["abcd["])).toThrowError();
});
