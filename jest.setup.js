if (expect.getState().testPath.match(/__integration-tests__/)) {
  const { createCollector } = require("./src/index");

  createCollector({
    excludeImports: ["**/*.unregistered.(tsx?)"],
    include: ["src/__integration-tests__/**/*"],
    roots: ["src/__integration-tests__"]
  });
}
