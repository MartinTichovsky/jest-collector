import path from "path";
import { mockFunction } from "./clone-function";
import { Collector } from "./collector";
import { PrivateCollector } from "./private-collector";
import { mockReactHooks } from "./react-hooks";
import { Options } from "./types";
import { createRegexp, getFiles, testRegex } from "./utils";

export { Collector };
export { Options };

declare global {
  var collector: Collector;
}

export const jestCollector = ({ exclude, extensions, include }: Options) => {
  const privateCollector = new PrivateCollector();
  collector = new Collector(privateCollector);

  if (exclude !== undefined && !Array.isArray(exclude)) {
    throw Error("Exclude must be an array");
  }

  if (extensions !== undefined && !Array.isArray(extensions)) {
    throw Error("Extensions must be an array");
  }

  if (include !== undefined && !Array.isArray(include)) {
    throw Error("Include must be an array");
  }

  if (extensions === undefined) {
    extensions = [".ts", ".tsx"];
  }

  // mocking react to get statistics from calling hooks
  const reactModule = require.resolve("react", {
    paths: [process.cwd()]
  });

  if (reactModule) {
    jest.mock(reactModule, () => {
      const origin = jest.requireActual(
        require.resolve("react", {
          paths: [process.cwd()]
        })
      );

      return mockReactHooks(origin, privateCollector);
    });
  }

  let excludeItems = ["**/*/__tests__", "**/*.test.(tsx?|jsx?)"];

  if (exclude !== undefined) {
    excludeItems = excludeItems.concat(exclude);
  }

  excludeItems = excludeItems.map((value) => createRegexp(value));

  testRegex(excludeItems);

  // load all suitable files
  const files = include
    .map((value) =>
      getFiles({
        excludeItems,
        extensions: extensions!,
        folder: path.resolve(process.cwd(), value)
      })
    )
    .flat();

  // mock all functions
  files.forEach((file) => {
    const filePath = path.resolve(process.cwd(), file);

    jest.mock(filePath, () => {
      const origin = jest.requireActual(filePath);

      for (let key in origin) {
        if (typeof origin[key] === "function") {
          origin[key] = mockFunction(origin[key], privateCollector);
        }
      }

      return origin;
    });
  });
};
