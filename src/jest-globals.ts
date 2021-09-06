import { expect } from "@jest/globals";

/* istanbul ignore next */
export const getTestPath = () => expect && expect.getState().testPath;

/* istanbul ignore next */
export const mock = (...props: Parameters<typeof jest.mock>) =>
  jest.mock(...props);

/* istanbul ignore next */
export const resolveReact = () =>
  require.resolve("react", {
    paths: [process.cwd()]
  });
