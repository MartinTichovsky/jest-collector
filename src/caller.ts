export const getCallerName = (callerNumber = 1) => {
  try {
    throw new Error();
  } catch (ex: any) {
    const functionsMatches = ex.stack.match(/(\w+)@|at (Function\.)?(\w+) \(/g);
    const parentFunctionMatches = functionsMatches[callerNumber].match(
      /(\w+)@|at (Function\.)?(\w+) \(/
    );
    return parentFunctionMatches[1] || parentFunctionMatches[3];
  }
};
