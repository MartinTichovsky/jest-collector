![Jest Collector](https://github.com/MartinTichovsky/__sources__/raw/master/jest-collector.png)

[![NPM](https://img.shields.io/npm/v/jest-collector.svg)](https://www.npmjs.com/package/jest-collector)

## Table of Contents

- [Getting Started](#getting-started)
- [About](#about)
- [List of Collected Hooks](#list-of-collected-hooks)
- [Configuration](#configuration)
  - [Options](#options)
    - [Root Folder](#root-folder)
    - [Exclude Tests](#exclude-tests)
    - [Exclude Imports](#exclude-imports)
    - [Include Tests](#include-tests)
    - [Include Imports](#include-imports)
    - [Extensions](#extensions)
  - [Matches](#matches)
- [Documentation](#documentation)

## Getting Started

Install Jest Collector using [`yarn`](https://yarnpkg.com/en/package/jest):

```bash
yarn add --dev jest-collector
```

or [`npm`](https://www.npmjs.com/package/jest):

```bash
npm install --save-dev jest-collector
```

## About

The Jest Collector is a tool for mocking all imports and collect data about the functions. It is mainly targeted on the React components, but it can be used for regular functions as well. In the collector is stored an info about the function/component, every call, every hook and a parent tree.

This tool is providing a way of testing how many times was your component rendered (called), if it contains the correct properties or if you used correct dependencies in React hooks such as in `useEffect`, `useCallback` or in `useMemo`.

> NOTE: React class components are not fully supported yet!

## List of Collected Hooks

These hooks are processed by the collector:

`useCallback`, `useContext`, `useEffect`, `useMemo`, `useRef`, `useReducer`, `useState`

## Configuration

Jest Collector must be run before all tests, because it uses [`jest.mock`](https://jestjs.io/docs/mock-functions#mocking-partials) as the major function to collect the data. Therefore is needed to set a setup file in `setupFilesAfterEnv` and register `collector` name in globals to be able use it in the tests.

Set the needed options in `package.json` or in `jest.config.js`.

```json
// package.json
{
  "jest": {
    "globals": {
      "collector": null
    },
    "setupFilesAfterEnv": [
      "./jest.setup.js"
    ]
  }
}
```

or

```js
// jest.config.js
module.exports = async () => {
  return {
    globals: {
      collector: null
    },
    setupFilesAfterEnv: [
      "./jest.setup.js"
    ]
  };
};
```

Now create `jest.setup.js` to create the collector and set the root folder of your source code. In this case I set "src" as the root folder.

> NOTE: Files ending with `.test.ts`, `.test.tsx`, `.test.js` or `.test.tsx` and all `__tests__` folders are excluded from mocking the exports.

```js
// jest.setup.js
const { createCollector } = require("jest-collector");

createCollector({
  roots: ["src"]
});
```

## Options

### Root Folder

`roots` - an array of folders

The collector must have set at least one root folder of your source code. You can set more folders. A folder must have a relative path to the jest process. All files matching the other options will be mocked and processed by the jest collector. If you do not set the other options, all typescript and javascript files will be mocked and processed.

Lets say you have two folders in your repository "admin" and "src".

```
.
..
admin
src
jest.setup.js
package.json
```

You can set both folders with:

```js
createColector({ roots: ["admin", "src"] });
```

If you would like to set an inner folder, it is possible:

```js
createColector({ roots: ["src/inner-folder"] });
```

### Exclude Tests

`exclude` - an array of matches

The collector is created for each test by default. In cases when you would like to exclude a test from being processed by the collector, you can exclude it with the `exclude` option. You can provide a [`match`](#matches) pattern.

Example:

```js
// it will exclude the "custom.test.ts" directly under the "src"
createColector({ 
  exclude: ["src/custom.test.ts"], 
  roots: ["src"] 
});
```

### Exclude Imports

`excludeImports` - an array of matches

The collector is mocking every file and its exports by default. In cases when you would like to exclude a file from being processed by the collector and mock the exports, you can exclude it with the `excludeImports` option. You can provide a [`match`](#matches) pattern.

> NOTE: Excluded files are not considered in the parent tree in the collector.

Example:

```js
// it will not mock the "custom.ts" directly under the "src"
createColector({ 
  excludeImports: ["src/custom.ts"], 
  roots: ["src"] 
});
```

### Include Tests

`include` - an array of matches

The collector is created for each test by default. In cases when you would like to include only a specific test to being processed by the collector, you can include it with the `include` option. Only the tests matching the `include` array will be processed by the collector. If there is a match in `exclude` option for the same test file as in `include`, the test will not be processed by the collector. You can provide a [`match`](#matches) pattern.

Example:

```js
// it will include only the "custom.test.ts" directly in "src"
createColector({ 
  include: ["src/custom.test.ts"], 
  roots: ["src"] 
});
```

### Include Imports

`includeImports` - an array of matches

The collector is mocking every file with exports by default. In cases when you would like to include only a specific file to being processed by the collector and mock the exports, you can include it with the `includeImports` option. If there is a match in `excludeimports` option for the same file as in `includeImports`, the file will not be processed by the collector. You can provide a [`match`](#matches) pattern.

Example:

```js
// it will mock only the "custom.ts" directly under the "src"
createColector({ 
  includeImports: ["src/custom.ts"], 
  roots: ["src"] 
});
```

### Extensions

`extensions` - an array of file extensions

By default the extensions are set to `.ts` and `.js`. You can set an additional extension. New set of extensions will replace the default. It means if you set `extensions` option to `[.ts]` the collector will mock the exports only from typescript files. If you provide an empty array, the collector will try to mock all files matching other options.

Example:

```js
// exports from all javascript and typescript files will be mocked
createColector({ 
  extensions: [".ts", ".js"], 
  roots: ["src"] 
});
```

## Matches

There are examples using a match pattern:

```js
// it matches any file in any folder under the "src/utils"
"src/utils/**/*"

// it matches "custom.ts" directly under the "src"
"src/custom.ts"

// it matches all files in any folder under the "src" ending with ".exclude.test.ts"
"src/**/*.exclude.test.ts"

// it matches all files in any folder under the "src" ending with ".exclude.test.ts" 
// or ".exclude.test.tsx"
"src/**/*.exclude.test.(ts|tsx)"

// it matches all files with the name "utils.ts" in every folder
"**/*/utils.ts"

// it matches all files with the name "utils.ts" in the first tree folder under 
// the "src". it matches "src/folder/utils.ts" but not "src/utils.ts" 
// or "src/folder/folder/utils.ts"
"src/**/utils.ts"

// it matches all files directly under the "src" ending with ".utils.ts", 
// for example "src/tool.utils.ts"
"src/*.utils.ts"
```

> NOTE: Matches are case sensitive. Always use UNIX file system style even when you run the tests under Windows.

## Documentation