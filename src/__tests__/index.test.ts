import { mockFunction } from "../clone-function";
import { createCollector } from "../create-collector";
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

describe("Create Collector", () => {
  test("Default", () => {
    expect(collector).toBeNull();
    expect(_mock).not.toBeCalled();
    expect(() => createCollector({ roots: ["src"] })).not.toThrowError();
    expect(collector).not.toBeNull();
    expect(_mock).toBeCalled();
    expect(_mock.mock.calls).toMatchSnapshot();
  });

  describe("Errors", () => {
    test("Error - roots", () => {
      expect(() => createCollector({} as any)).toThrowError();
      expect(() => createCollector({ roots: [] })).toThrowError();
      nonArrayValues.forEach((value: any) => {
        expect(() => createCollector({ roots: value })).toThrowError();
      });
    });

    test("Error - exclude", () => {
      nonArrayValues.forEach((value: any) => {
        expect(() =>
          createCollector({ exclude: value, roots: ["src"] })
        ).toThrowError();
      });
    });

    test("Error - exclude imports", () => {
      nonArrayValues.forEach((value: any) => {
        expect(() =>
          createCollector({ excludeImports: value, roots: ["src"] })
        ).toThrowError();
      });
    });

    test("Error - extensions", () => {
      nonArrayValues.forEach((value: any) => {
        expect(() =>
          createCollector({ extensions: value, roots: ["src"] })
        ).toThrowError();
      });
    });

    test("Error - include", () => {
      nonArrayValues.forEach((value: any) => {
        expect(() =>
          createCollector({ include: value, roots: ["src"] })
        ).toThrowError();
      });
    });

    test("Error - include imports", () => {
      nonArrayValues.forEach((value: any) => {
        expect(() =>
          createCollector({ includeImports: value, roots: ["src"] })
        ).toThrowError();
      });
    });
  });

  describe("Roots", () => {
    test("Multiple", () => {
      expect(() =>
        createCollector({ roots: ["src", "utils"] })
      ).not.toThrowError();
      expect(_mock.mock.calls).toMatchSnapshot();
    });
  });

  describe("Extensions", () => {
    test("Include all ts files", () => {
      expect(() =>
        createCollector({ extensions: [".ts"], roots: ["src", "utils"] })
      ).not.toThrowError();
      expect(_mock.mock.calls).toMatchSnapshot();
    });

    test("Include all js files", () => {
      expect(() =>
        createCollector({ extensions: [".js"], roots: ["src", "utils"] })
      ).not.toThrowError();
      expect(_mock.mock.calls).toMatchSnapshot();
    });

    test("Include all files", () => {
      expect(() =>
        createCollector({ extensions: [], roots: ["src"] })
      ).not.toThrowError();
      expect(_mock.mock.calls).toMatchSnapshot();
    });
  });

  describe("Exclude", () => {
    test("Should not call mocks", () => {
      _getTestPath.mockReturnValue("/Some.test.ts");
      expect(() =>
        createCollector({ exclude: ["Some.test.ts"], roots: ["src"] })
      ).not.toThrowError();
      expect(_mock).not.toBeCalled();
    });

    test("It should call mocks", () => {
      _getTestPath.mockReturnValue("/Some.test.ts");
      expect(() =>
        createCollector({ exclude: ["Another.test.ts"], roots: ["src"] })
      ).not.toThrowError();
      expect(_mock).toBeCalled();
    });
  });

  describe("Exclude From Imports", () => {
    test("Exclude everything starts with SelectOption", () => {
      expect(() =>
        createCollector({ excludeImports: ["SelectOption*"], roots: ["src"] })
      ).not.toThrowError();
      expect(_mock.mock.calls).toMatchSnapshot();
    });

    test("Exclude utils.ts from src and index.ts from utils", () => {
      expect(() =>
        createCollector({
          excludeImports: ["/src/utils.ts", "/utils/index.ts"],
          roots: ["src", "utils"]
        })
      ).not.toThrowError();
      expect(_mock.mock.calls).toMatchSnapshot();
    });

    test("Exclude everything with name SelectOption.tsx", () => {
      expect(() =>
        createCollector({
          excludeImports: ["SelectOption.tsx"],
          roots: ["src"]
        })
      ).not.toThrowError();
      expect(_mock.mock.calls).toMatchSnapshot();
    });

    test("Exclude ts and tsx extensions", () => {
      expect(() =>
        createCollector({
          excludeImports: ["**/*.(tsx?)"],
          extensions: [],
          roots: ["src"]
        })
      ).not.toThrowError();
      expect(_mock.mock.calls).toMatchSnapshot();
    });

    test("Exclude all files ending with .types.ts or .types.tsx", () => {
      expect(() =>
        createCollector({
          excludeImports: ["**/*.types.(tsx?)"],
          roots: ["src"]
        })
      ).not.toThrowError();
      expect(_mock.mock.calls).toMatchSnapshot();
    });

    test("Exclude everything", () => {
      expect(() =>
        createCollector({ excludeImports: ["**/*"], roots: ["src"] })
      ).not.toThrowError();
      expect(_mock.mock.calls).toMatchSnapshot();
    });

    test("Exclude SelectOption.tsx in root", () => {
      expect(() =>
        createCollector({
          excludeImports: ["/SelectOption.tsx"],
          roots: ["src"]
        })
      ).not.toThrowError();
      expect(_mock.mock.calls).toMatchSnapshot();
    });

    test("Exclude SelectOption.tsx in first dir", () => {
      expect(() =>
        createCollector({
          excludeImports: ["/*/SelectOption.tsx"],
          roots: ["src"]
        })
      ).not.toThrowError();
      expect(_mock.mock.calls).toMatchSnapshot();
    });

    test("Exclude SelectOption.tsx in root or first dir", () => {
      expect(() =>
        createCollector({
          excludeImports: ["/**/SelectOption.tsx"],
          roots: ["src"]
        })
      ).not.toThrowError();
      expect(_mock.mock.calls).toMatchSnapshot();
    });

    test("Exclude SelectOption.tsx in second dir", () => {
      expect(() =>
        createCollector({
          excludeImports: ["/*/*/SelectOption.tsx"],
          roots: ["src"]
        })
      ).not.toThrowError();
      expect(_mock.mock.calls).toMatchSnapshot();
    });

    test("Exclude all from folders", () => {
      expect(() =>
        createCollector({
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
        createCollector({ include: ["Some.test.ts"], roots: ["src"] })
      ).not.toThrowError();
      expect(_mock).toBeCalled();
    });

    test("Should not call mocks", () => {
      _getTestPath.mockReturnValue("/Some.test.ts");
      expect(() =>
        createCollector({ include: ["Another.test.ts"], roots: ["src"] })
      ).not.toThrowError();
      expect(_mock).not.toBeCalled();
    });
  });

  describe("Include Imports", () => {
    test("Include everything starts with SelectOption", () => {
      expect(() =>
        createCollector({ includeImports: ["SelectOption*"], roots: ["src"] })
      ).not.toThrowError();
      expect(_mock.mock.calls).toMatchSnapshot();
    });

    test("Include utils.ts from src and index.ts from utils", () => {
      expect(() =>
        createCollector({
          includeImports: ["/src/utils.ts", "/utils/index.ts"],
          roots: ["src", "utils"]
        })
      ).not.toThrowError();
      expect(_mock.mock.calls).toMatchSnapshot();
    });

    test("Include everything with name SelectOption.tsx", () => {
      expect(() =>
        createCollector({
          includeImports: ["SelectOption.tsx"],
          roots: ["src"]
        })
      ).not.toThrowError();
      expect(_mock.mock.calls).toMatchSnapshot();
    });

    test("Include ts and tsx extensions", () => {
      expect(() =>
        createCollector({
          includeImports: ["**/*.(tsx?)"],
          extensions: [],
          roots: ["src"]
        })
      ).not.toThrowError();
      expect(_mock.mock.calls).toMatchSnapshot();
    });

    test("Include all files ending with .types.ts or types.tsx", () => {
      expect(() =>
        createCollector({
          includeImports: ["**/*.types.(tsx?)"],
          roots: ["src"]
        })
      ).not.toThrowError();
      expect(_mock.mock.calls).toMatchSnapshot();
    });

    test("Include everything", () => {
      expect(() =>
        createCollector({ includeImports: ["**/*"], roots: ["src"] })
      ).not.toThrowError();
      expect(_mock.mock.calls).toMatchSnapshot();
    });

    test("Include SelectOption.tsx in root", () => {
      expect(() =>
        createCollector({
          includeImports: ["/SelectOption.tsx"],
          roots: ["src"]
        })
      ).not.toThrowError();
      expect(_mock.mock.calls).toMatchSnapshot();
    });

    test("Include SelectOption.tsx in first dir", () => {
      expect(() =>
        createCollector({
          includeImports: ["/*/SelectOption.tsx"],
          roots: ["src"]
        })
      ).not.toThrowError();
      expect(_mock.mock.calls).toMatchSnapshot();
    });

    test("Include SelectOption.tsx in root or first dir", () => {
      expect(() =>
        createCollector({
          includeImports: ["/**/SelectOption.tsx"],
          roots: ["src"]
        })
      ).not.toThrowError();
      expect(_mock.mock.calls).toMatchSnapshot();
    });

    test("Include SelectOption.tsx in second dir", () => {
      expect(() =>
        createCollector({
          includeImports: ["/*/*/SelectOption.tsx"],
          roots: ["src"]
        })
      ).not.toThrowError();
      expect(_mock.mock.calls).toMatchSnapshot();
    });

    test("Include all from folders", () => {
      expect(() =>
        createCollector({
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
      createCollector({
        roots: ["src"]
      })
    ).not.toThrowError();
    expect(_mock.mock.calls).toMatchSnapshot();
  });

  test("React mock calls", () => {
    _resolveReact.mockReturnValueOnce(require.resolve("react"));
    const react = jest.requireActual("react");

    expect(() =>
      createCollector({
        roots: ["src"]
      })
    ).not.toThrowError();

    // first call is react module
    expect(_mockReactHooks).not.toBeCalled();
    expect(_mock.mock.calls[0].length === 2).toBeTruthy();

    const mockedResult = _mock.mock.calls[0][1]();
    expect(_mockReactHooks).toBeCalled();

    expect(mockedResult.useCallback).not.toEqual(react.useCallback);
    expect(mockedResult.useContext).not.toEqual(react.useContext);
    expect(mockedResult.useEffect).not.toEqual(react.useEffect);
    expect(mockedResult.useRef).not.toEqual(react.useRef);
    expect(mockedResult.useState).not.toEqual(react.useState);
  });

  test("File mock calls", () => {
    _resolveReact.mockReturnValueOnce(undefined);
    const origin = jest.requireActual("../__tests-helper__/test-file.ts");

    Object.defineProperty(origin, "nonWritable", { writable: false });

    expect(() =>
      createCollector({
        includeImports: ["/test-file.ts"],
        roots: ["__tests-helper__"]
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
