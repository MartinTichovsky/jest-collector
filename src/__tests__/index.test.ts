import { mockFunction } from "../clone-function";
import { jestCollector } from "../index";
import { getTestPath, mock, resolveReact } from "../jest-globals";
import { mockReactHooks } from "../react-hooks";

jest.mock("fs", () => {
  const origin = jest.requireActual("fs");
  const { lstatSyncMock, readdirSyncMock } = require("./helpers/fs-path");
  const fileSystem = require("./helpers/index.file-structure");

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
    resolve: (item1: string, item2: string) =>
      item1 === process.cwd() ? item2 : `${item1}/${item2}`
  };
});

jest.mock("../clone-function", () => {
  const origin = jest.requireActual("../clone-function");

  return {
    ...origin,
    mockFunction: jest.fn((...props) => origin.mockFunction(...props))
  };
});

jest.mock("../jest-globals", () => {
  const origin = jest.requireActual("../jest-globals");

  return {
    ...origin,
    getTestPath: jest.fn(),
    mock: jest.fn(),
    resolveReact: jest.fn(() => "./node_modules/react/index.js")
  };
});

jest.mock("../react-hooks", () => {
  const origin = jest.requireActual("../react-hooks");

  return {
    ...origin,
    mockReactHooks: jest.fn((...props) => origin.mockReactHooks(...props))
  };
});

const _getTestPath = getTestPath as jest.Mock;
const _mock = mock as jest.Mock;
const _mockFunction = mockFunction as jest.Mock;
const _mockReactHooks = mockReactHooks as jest.Mock;
const _resolveReact = resolveReact as jest.Mock;

const nonArrayValues = [0, 1, true, false, {}, "string", NaN, Infinity];

beforeEach(() => {
  jest.clearAllMocks();
});

describe("jestCollector", () => {
  test("Default", () => {
    expect(collector).toBeNull();
    expect(_mock).not.toBeCalled();
    expect(() => jestCollector({ roots: ["src"] })).not.toThrowError();
    expect(collector).not.toBeNull();
    expect(_mock).toBeCalled();
    expect(_mock.mock.calls).toMatchSnapshot();
  });

  describe("Errors", () => {
    test("Error - roots", () => {
      expect(() => jestCollector({} as any)).toThrowError();
      expect(() => jestCollector({ roots: [] })).toThrowError();
      nonArrayValues.forEach((value: any) => {
        expect(() => jestCollector({ roots: value })).toThrowError();
      });
    });

    test("Error - exclude", () => {
      nonArrayValues.forEach((value: any) => {
        expect(() =>
          jestCollector({ exclude: value, roots: ["src"] })
        ).toThrowError();
      });
    });

    test("Error - exclude imports", () => {
      nonArrayValues.forEach((value: any) => {
        expect(() =>
          jestCollector({ excludeImports: value, roots: ["src"] })
        ).toThrowError();
      });
    });

    test("Error - extensions", () => {
      nonArrayValues.forEach((value: any) => {
        expect(() =>
          jestCollector({ extensions: value, roots: ["src"] })
        ).toThrowError();
      });
    });

    test("Error - include", () => {
      nonArrayValues.forEach((value: any) => {
        expect(() =>
          jestCollector({ include: value, roots: ["src"] })
        ).toThrowError();
      });
    });

    test("Error - include imports", () => {
      nonArrayValues.forEach((value: any) => {
        expect(() =>
          jestCollector({ includeImports: value, roots: ["src"] })
        ).toThrowError();
      });
    });
  });

  describe("Roots", () => {
    test("Multiple", () => {
      expect(() =>
        jestCollector({ roots: ["src", "utils"] })
      ).not.toThrowError();
      expect(_mock.mock.calls).toMatchSnapshot();
    });
  });

  describe("Extensions", () => {
    test("Include all ts files", () => {
      expect(() =>
        jestCollector({ extensions: [".ts"], roots: ["src", "utils"] })
      ).not.toThrowError();
      expect(_mock.mock.calls).toMatchSnapshot();
    });

    test("Include all js files", () => {
      expect(() =>
        jestCollector({ extensions: [".js"], roots: ["src", "utils"] })
      ).not.toThrowError();
      expect(_mock.mock.calls).toMatchSnapshot();
    });

    test("Include all files", () => {
      expect(() =>
        jestCollector({ extensions: [], roots: ["src"] })
      ).not.toThrowError();
      expect(_mock.mock.calls).toMatchSnapshot();
    });
  });

  describe("Exclude", () => {
    test("Should not call mocks", () => {
      _getTestPath.mockReturnValue("/Some.test.ts");
      expect(() =>
        jestCollector({ exclude: ["Some.test.ts"], roots: ["src"] })
      ).not.toThrowError();
      expect(_mock).not.toBeCalled();
    });

    test("Should call mocks", () => {
      _getTestPath.mockReturnValue("/Some.test.ts");
      expect(() =>
        jestCollector({ exclude: ["Another.test.ts"], roots: ["src"] })
      ).not.toThrowError();
      expect(_mock).toBeCalled();
    });
  });

  describe("Exclude From Imports", () => {
    test("Exclude everything starts with SelectOption", () => {
      expect(() =>
        jestCollector({ excludeImports: ["SelectOption*"], roots: ["src"] })
      ).not.toThrowError();
      expect(_mock.mock.calls).toMatchSnapshot();
    });

    test("Exclude utils.ts from src and index.ts from utils", () => {
      expect(() =>
        jestCollector({
          excludeImports: ["/src/utils.ts", "/utils/index.ts"],
          roots: ["src", "utils"]
        })
      ).not.toThrowError();
      expect(_mock.mock.calls).toMatchSnapshot();
    });

    test("Exclude everything with name SelectOption.tsx", () => {
      expect(() =>
        jestCollector({ excludeImports: ["SelectOption.tsx"], roots: ["src"] })
      ).not.toThrowError();
      expect(_mock.mock.calls).toMatchSnapshot();
    });

    test("Exclude ts and tsx extensions", () => {
      expect(() =>
        jestCollector({
          excludeImports: ["**/*.(tsx?)"],
          extensions: [],
          roots: ["src"]
        })
      ).not.toThrowError();
      expect(_mock.mock.calls).toMatchSnapshot();
    });

    test("Exclude all files ending with .types.ts or .types.tsx", () => {
      expect(() =>
        jestCollector({ excludeImports: ["**/*.types.(tsx?)"], roots: ["src"] })
      ).not.toThrowError();
      expect(_mock.mock.calls).toMatchSnapshot();
    });

    test("Exclude everything", () => {
      expect(() =>
        jestCollector({ excludeImports: ["**/*"], roots: ["src"] })
      ).not.toThrowError();
      expect(_mock.mock.calls).toMatchSnapshot();
    });

    test("Exclude SelectOption.tsx in root", () => {
      expect(() =>
        jestCollector({ excludeImports: ["/SelectOption.tsx"], roots: ["src"] })
      ).not.toThrowError();
      expect(_mock.mock.calls).toMatchSnapshot();
    });

    test("Exclude SelectOption.tsx in first dir", () => {
      expect(() =>
        jestCollector({
          excludeImports: ["/*/SelectOption.tsx"],
          roots: ["src"]
        })
      ).not.toThrowError();
      expect(_mock.mock.calls).toMatchSnapshot();
    });

    test("Exclude SelectOption.tsx in root or first dir", () => {
      expect(() =>
        jestCollector({
          excludeImports: ["/**/SelectOption.tsx"],
          roots: ["src"]
        })
      ).not.toThrowError();
      expect(_mock.mock.calls).toMatchSnapshot();
    });

    test("Exclude SelectOption.tsx in second dir", () => {
      expect(() =>
        jestCollector({
          excludeImports: ["/*/*/SelectOption.tsx"],
          roots: ["src"]
        })
      ).not.toThrowError();
      expect(_mock.mock.calls).toMatchSnapshot();
    });

    test("Exclude all from folders", () => {
      expect(() =>
        jestCollector({
          excludeImports: ["components/**/*"],
          roots: ["src"]
        })
      ).not.toThrowError();
      expect(_mock.mock.calls).toMatchSnapshot();
    });
  });

  describe("Include", () => {
    test("Should call mocks", () => {
      _getTestPath.mockReturnValue("/Some.test.ts");
      expect(() =>
        jestCollector({ include: ["Some.test.ts"], roots: ["src"] })
      ).not.toThrowError();
      expect(_mock).toBeCalled();
    });

    test("Should not call mocks", () => {
      _getTestPath.mockReturnValue("/Some.test.ts");
      expect(() =>
        jestCollector({ include: ["Another.test.ts"], roots: ["src"] })
      ).not.toThrowError();
      expect(_mock).not.toBeCalled();
    });
  });

  describe("Include Imports", () => {
    test("Include everything starts with SelectOption", () => {
      expect(() =>
        jestCollector({ includeImports: ["SelectOption*"], roots: ["src"] })
      ).not.toThrowError();
      expect(_mock.mock.calls).toMatchSnapshot();
    });

    test("Include utils.ts from src and index.ts from utils", () => {
      expect(() =>
        jestCollector({
          includeImports: ["/src/utils.ts", "/utils/index.ts"],
          roots: ["src", "utils"]
        })
      ).not.toThrowError();
      expect(_mock.mock.calls).toMatchSnapshot();
    });

    test("Include everything with name SelectOption.tsx", () => {
      expect(() =>
        jestCollector({ includeImports: ["SelectOption.tsx"], roots: ["src"] })
      ).not.toThrowError();
      expect(_mock.mock.calls).toMatchSnapshot();
    });

    test("Include ts and tsx extensions", () => {
      expect(() =>
        jestCollector({
          includeImports: ["**/*.(tsx?)"],
          extensions: [],
          roots: ["src"]
        })
      ).not.toThrowError();
      expect(_mock.mock.calls).toMatchSnapshot();
    });

    test("Include all files ending with .types.ts or types.tsx", () => {
      expect(() =>
        jestCollector({ includeImports: ["**/*.types.(tsx?)"], roots: ["src"] })
      ).not.toThrowError();
      expect(_mock.mock.calls).toMatchSnapshot();
    });

    test("Include everything", () => {
      expect(() =>
        jestCollector({ includeImports: ["**/*"], roots: ["src"] })
      ).not.toThrowError();
      expect(_mock.mock.calls).toMatchSnapshot();
    });

    test("Include SelectOption.tsx in root", () => {
      expect(() =>
        jestCollector({ includeImports: ["/SelectOption.tsx"], roots: ["src"] })
      ).not.toThrowError();
      expect(_mock.mock.calls).toMatchSnapshot();
    });

    test("Include SelectOption.tsx in first dir", () => {
      expect(() =>
        jestCollector({
          includeImports: ["/*/SelectOption.tsx"],
          roots: ["src"]
        })
      ).not.toThrowError();
      expect(_mock.mock.calls).toMatchSnapshot();
    });

    test("Include SelectOption.tsx in root or first dir", () => {
      expect(() =>
        jestCollector({
          includeImports: ["/**/SelectOption.tsx"],
          roots: ["src"]
        })
      ).not.toThrowError();
      expect(_mock.mock.calls).toMatchSnapshot();
    });

    test("Include SelectOption.tsx in second dir", () => {
      expect(() =>
        jestCollector({
          includeImports: ["/*/*/SelectOption.tsx"],
          roots: ["src"]
        })
      ).not.toThrowError();
      expect(_mock.mock.calls).toMatchSnapshot();
    });

    test("Include all from folders", () => {
      expect(() =>
        jestCollector({
          includeImports: ["components/**/*"],
          roots: ["src"]
        })
      ).not.toThrowError();
      expect(_mock.mock.calls).toMatchSnapshot();
    });
  });

  test("React module is not included", () => {
    _resolveReact.mockReturnValueOnce(undefined);

    expect(() =>
      jestCollector({
        roots: ["src"]
      })
    ).not.toThrowError();
    expect(_mock.mock.calls).toMatchSnapshot();
  });

  test("React mock calls", () => {
    _resolveReact.mockReturnValueOnce(require.resolve("react"));
    const react = jest.requireActual("react");

    expect(() =>
      jestCollector({
        roots: ["src"]
      })
    ).not.toThrowError();

    // first call is react module
    expect(_mockReactHooks).not.toBeCalled();
    expect(_mock.mock.calls[0].length === 2).toBeTruthy();

    const mockedResult = _mock.mock.calls[0][1]();
    expect(_mockReactHooks).toBeCalled();

    expect(mockedResult.useCallback).not.toEqual(react.useCallback);
    expect(mockedResult.useEffect).not.toEqual(react.useEffect);
    expect(mockedResult.useState).not.toEqual(react.useState);
  });

  test("File mock calls", () => {
    _resolveReact.mockReturnValueOnce(undefined);
    const origin = jest.requireActual("../test-helper/test-file.ts");

    Object.defineProperty(origin, "nonWritable", { writable: false });

    expect(() =>
      jestCollector({
        includeImports: ["/test-file.ts"],
        roots: ["test-helper"]
      })
    ).not.toThrowError();

    // there should be only one call
    expect(_mockFunction).not.toBeCalled();
    expect(_mock.mock.calls.length === 1).toBeTruthy();

    const mockedResult = _mock.mock.calls[0][1]();
    expect(_mockFunction).toBeCalled();

    expect(mockedResult.someArrowFunction).not.toEqual(
      origin.someArrowFunction
    );
    expect(mockedResult.someBoolean).toEqual(origin.someBoolean);
    expect(mockedResult.SomeClass).not.toEqual(origin.SomeClass);
    expect(mockedResult.someConstant).toEqual(origin.someConstant);
    expect(mockedResult.someFunction).not.toEqual(origin.someFunction);
    expect(mockedResult.nonWritable).toEqual(origin.nonWritable);
  });
});
