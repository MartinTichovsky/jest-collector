import { convertFileSystem } from "./utils";

const describeNativeComponentFrame = "describeNativeComponentFrame";

const extractFilePath = (fullPath: string) =>
  convertFileSystem(fullPath.replace(/:[0-9]+:[0-9]+$/, ""));

export const getCallerFromStack = (stack: string, callerNumber: number) => {
  const functionsMatches = getFunctionMatches(stack);
  const parentFunctionMatches = getParentFunctionMatches(
    functionsMatches!,
    callerNumber
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

const getFunctionMatches = (stack: string) =>
  stack.match(/at (Function\.)?(\w+) \(([^\)]+)\)/g);
const getParentFunctionMatches = (
  functionsMatches: RegExpMatchArray,
  index: number
) => functionsMatches[index].match(/at (Function\.)?(\w+) \(([^\)]+)\)/);

export const isCallerDescribeNativeComponentFrame = () => {
  try {
    throw new Error();
  } catch (ex: any) {
    const functionsMatches = getFunctionMatches(ex.stack);

    return (
      getParentFunctionMatches(functionsMatches!, 1)![2] ===
        describeNativeComponentFrame ||
      getParentFunctionMatches(functionsMatches!, 2)![2] ===
        describeNativeComponentFrame
    );
  }
};
