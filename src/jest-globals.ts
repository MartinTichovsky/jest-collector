/* istanbul ignore file */

import { expect } from "@jest/globals";

export const getTestPath = () => expect && expect.getState().testPath;

export const mock = (...props: Parameters<typeof jest.mock>) =>
  jest.mock(...props);

export const resolveReact = () =>
  require.resolve("react", {
    paths: [process.cwd()]
  });
