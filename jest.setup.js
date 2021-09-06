if (expect.getState().testPath.match(/__implementation-tests/)) {
  const { jestCollector } = require("./src/index");

  jestCollector({
    excludeImports: ["unregistered/**/*"],
    include: ["src/__implementation-tests/**/*"],
    roots: ["src/__implementation-tests"]
  });
}
