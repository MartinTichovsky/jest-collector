import path from "path";
import { mockFunction } from "./clone-function";
import { Collector } from "./collector";
import { mock, resolveReact } from "./jest-globals";
import { PrivateCollector } from "./private-collector";
import { mockReactHooks } from "./react-hooks";
import { Options } from "./types";
import {
  convertFileSystem,
  createRegexp,
  getFiles,
  ignoreTest,
  testRegex
} from "./utils";

export { Collector };
export { Options };

declare global {
  var collector: Collector;
}

export const jestCollector = ({
  exclude,
  excludeImports,
  extensions,
  include,
  includeImports,
  roots
}: Options) => {
  if (roots !== undefined && !Array.isArray(roots)) {
    throw Error("Roots must be an array");
  }

  if (roots === undefined || !roots.length) {
    throw Error("Roots path must be provided");
  }

  if (exclude !== undefined && !Array.isArray(exclude)) {
    throw Error("Exclude must be an array");
  }

  if (excludeImports !== undefined && !Array.isArray(excludeImports)) {
    throw Error("ExcludeImports must be an array");
  }

  if (extensions !== undefined && !Array.isArray(extensions)) {
    throw Error("Extensions must be an array");
  }

  if (include !== undefined && !Array.isArray(include)) {
    throw Error("Include must be an array");
  }

  if (includeImports !== undefined && !Array.isArray(includeImports)) {
    throw Error("IncludeImports must be an array");
  }

  if (ignoreTest("exclude", exclude)) {
    return;
  }

  if (!ignoreTest("include", include)) {
    return;
  }

  const privateCollector = new PrivateCollector();
  collector = new Collector(privateCollector);

  if (extensions === undefined) {
    extensions = [".ts", ".tsx"];
  }

  // mocking react to get statistics from calling hooks
  let reactModule: string | undefined;

  try {
    reactModule = convertFileSystem(resolveReact());
  } catch {}

  if (reactModule) {
    mock(reactModule, () => {
      const origin = jest.requireActual(reactModule!);

      return mockReactHooks(origin, privateCollector);
    });
  }

  if (excludeImports === undefined) {
    excludeImports = [];
  }

  excludeImports = excludeImports.concat([
    "__tests__/**/*",
    "**/*.test.(tsx?|jsx?)"
  ]);

  excludeImports = excludeImports.map((value) => createRegexp(value));
  testRegex(excludeImports, "excludeImports");

  if (includeImports === undefined) {
    includeImports = [];
  }

  includeImports = includeImports.map((value) => createRegexp(value));
  testRegex(includeImports, "includeImports");

  // load all suitable files
  const files = roots
    .map((root) => {
      const rootFolder = path.resolve(process.cwd(), root);
      return getFiles({
        exclude: excludeImports!,
        extensions: extensions!,
        folder: rootFolder,
        include: includeImports!,
        root: path.basename(rootFolder)
      });
    })
    .flat()
    .map((file) => path.resolve(process.cwd(), file));

  // mock all functions
  files.forEach((file) => {
    mock(file, () => {
      const mocked = {};
      const origin = jest.requireActual(file);
      const relativePath = convertFileSystem(file.replace(process.cwd(), ""));

      for (let key in origin) {
        const propertyDescriptor = Object.getOwnPropertyDescriptor(origin, key);

        if (
          typeof origin[key] === "function" &&
          (propertyDescriptor === undefined || propertyDescriptor.writable)
        ) {
          mocked[key] = mockFunction(
            origin[key],
            privateCollector,
            relativePath
          );
        }
      }

      return { ...origin, ...mocked };
    });
  });
};
