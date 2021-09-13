import { convertFileSystem } from "./utils";

const extractFilePath = (fullPath: string) =>
  convertFileSystem(fullPath.replace(/:[0-9]+:[0-9]+$/, ""));

export const getCallerFromStack = (stack: string, callerNumber: number) => {
  const functionsMatches = stack.match(/at (Function\.)?(\w+) \(([^\)]+)\)/g);
  const parentFunctionMatches = functionsMatches![callerNumber].match(
    /at (Function\.)?(\w+) \(([^\)]+)\)/
  )!;
  const fullPath = extractFilePath(parentFunctionMatches[3]);

  return {
    name: parentFunctionMatches[2],
    fullPath,
    relativePath: fullPath.replace(convertFileSystem(process.cwd()), "")
  };
};

export const getCaller = (callerNumber = 1) => {
  try {
    throw new Error();
  } catch (ex: any) {
    return getCallerFromStack(ex.stack, callerNumber);
  }
};
