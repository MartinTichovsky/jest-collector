if (expect.getState().testPath.match(/__integration-tests__/)) {
  const { jestCollector } = require("./src/index");

  jestCollector({
    excludeImports: ["**/*.unregistered.(tsx?)"],
    include: ["src/__integration-tests__/**/*"],
    roots: ["src/__integration-tests__"]
  });
}
