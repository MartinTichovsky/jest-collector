![Jest Collector](https://github.com/MartinTichovsky/__sources__/raw/master/jest-collector.png)

[![NPM](https://img.shields.io/npm/v/jest-collector.svg)](https://www.npmjs.com/package/jest-collector)

## Table of Contents

- [Getting Started](#getting-started)
- [About](#about)
- [List of Collected Hooks](#list-of-collected-hooks)
- [Configuration](#configuration)
  - [Root Folder](#root-folder)
  - [Exclude Tests](#exclude-tests)
  - [Exclude Imports](#exclude-imports)
  - [Include Tests](#include-tests)
  - [Include Imports](#include-imports)
  - [Extensions](#extensions)
  - [Matches](#matches)
- [Documentation](#documentation)
  - [Enable Data Test Id Inheritance](#enable-data-test-id-inheritance)
  - [Disable Data Test Id Inheritance](#disable-data-test-id-inheritance)
  - [Get Call Count](#get-call-count)
  - [Get Component Data](#get-component-data)
  - [Get All Data For](#get-all-data-for)
  - [Get Data For](#get-data-for)
  - [Get React Hooks](#get-react-hooks)
  - [Get React Lifecycle](#get-react-lifecycle)
  - [Get Stats](#get-stats)
  - [Has Component](#has-component)
  - [Has Registered](#has-registered)
  - [Reset](#reset)
  - [Options](#options)
- [Real Examples](#real-examples)

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

## Create Collector Options

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

If you use Typescript add a globals file to your source code:

```ts
// globals.ts
import { Collector } from "jest-collector";

declare global {
  var collector: Collector;
}

```

### Enable Data Test Id Inheritance

```ts
// inheritance is disabled by default
enableDataTestIdInheritance(excludeNotMockedElements?: boolean): void
```

Each component should have a data-testid to be easily identified. In cases you do not want to put a data-testid to each component and you want to inherit data-testid from the parent, you can enable inheritance. When the inheritance is enabled, each component with no data-testid will try to inherit the data-testid from the parent. It works from not mocked elements as well as for mocked elements.

> IMPORTANT: When testing, on the highest level must be a mocked component to inherit the data-testid correctly.

Examples:

```ts
// enable the inheritance
collector.enableDataTestIdInheritance();

// the SimpleComponent will iherit the data-testid
render(
  <MockedComponent data-testid="test-id">
    <SimpleComponent />
  </MockedComponent>
);

// the SimpleComponent will be registered in the collector with the "test-id"
expect(collector.hasComponent(SimpleComponent.name, { dataTestId: "test-id" })).toBeTruthy();
```

```ts
// enable the inheritance
collector.enableDataTestIdInheritance();

// the SimpleComponent will iherit the data-testid
render(
  <MockedComponent>
    <div data-testid="test-id">
      <SimpleComponent />
    </div>
  </MockedComponent>
);

// the SimpleComponent will be registered in the collector with the "test-id"
expect(collector.hasComponent(SimpleComponent.name, { dataTestId: "test-id" })).toBeTruthy();
```

#### Exclude Not Mocked Components

When you would like to exclude not mocked components from data-testid inheritance, call `enableDataTestIdInheritance` with `true`

Examples:

```ts
// enable the inheritance
collector.enableDataTestIdInheritance(true);

// the SimpleComponent will iherit the data-testid if the Component 
// is mocked by the collector
render(
  <Component data-testid="test-id">
    <SimpleComponent />
  </Component>
);

// the SimpleComponent will be registered in the collector with the "test-id"
expect(collector.hasComponent(SimpleComponent.name, { dataTestId: "test-id" })).toBeTruthy();
```

```ts
// enable the inheritance
collector.enableDataTestIdInheritance(true);

// the SimpleComponent will iherit the data-testid from the component 
// if the Component is mocked by the collector, the "test-id-2" will
// be ignored
render(
  <Component data-testid="test-id-1">
    <div data-testid="test-id-2">
      <SimpleComponent />
    </div>
  </Component>
);

// the SimpleComponent will be registered in the collector with the "test-id-1"
expect(collector.hasComponent(SimpleComponent.name, { dataTestId: "test-id-1" })).toBeTruthy();
// there will be no SimpleComponent with the "test-id-2"
expect(collector.hasComponent(SimpleComponent.name, { dataTestId: "test-id-2" })).toBeFalsy();
```

### Disable Data Test Id Inheritance

```ts
disableDataTestIdInheritance(): void
```

When you turned on the inheritance and you would like to disable it again, you can call `disableDataTestIdInheritance` or [`reset`](#reset)

Example:

```ts
collector.disableDataTestIdInheritance();
```

### Get Call Count

```ts
getCallCount(name: string, options?: Options): number | undefined
```

Get number of calls for the function or a react component. If the component is a react class component, the returned number will be a number of how many times was the `render` method called. See all available [`Options`](#options).

Examples:

```ts
render(
  <SimpleComponent />
);

// the SimpleComponent will be called once
expect(collector.getCallCount(SimpleComponent.name)).toBe(1);
```

```ts
// these components are difficult to identify, both are under the root
// and they do not have a data-testid, therefore they will be considered
// as one
render(
  <>
    <SimpleComponent />
    <SimpleComponent />
  </>
);

// the SimpleComponent will be called twice
expect(collector.getCallCount(SimpleComponent.name)).toBe(2);
```

```ts
// when the parent is a mocked component, the children components
// will be registered with nthChild property to identify them
render(
  <MockedComponent>
    <SimpleComponent />
    <SimpleComponent />
  </MockedComponent>
);

// the SimpleComponent will be called twice
expect(collector.getCallCount(SimpleComponent.name)).toBe(2);
// the first SimpleComponent under the MockedComponent will be called once
expect(collector.getCallCount(SimpleComponent.name, { nthChild: 1 })).toBe(1);
// the second SimpleComponent under the MockedComponent will be called once
expect(collector.getCallCount(SimpleComponent.name, { nthChild: 2 })).toBe(1);
// the third SimpleComponent under the MockedComponent will not exist
expect(collector.getCallCount(SimpleComponent.name, { nthChild: 3 })).toBeUndefined();
```

```ts
// get the components by the parent
render(
  <>
    <MockedComponent>
      <SimpleComponent />
      <SimpleComponent />
    </MockedComponent>
    <SimpleComponent />
  </>
);

// the SimpleComponent will be called twice
expect(collector.getCallCount(SimpleComponent.name)).toBe(3);
// there are two SimpleComponents under the MockedComponent
expect(collector.getCallCount(SimpleComponent.name, { parent: { name: MockedComponent.name } })).toBe(2);
// there is only one SimpleComponent under the root
expect(collector.getCallCount(SimpleComponent.name, { parent: null })).toBe(1);
```

If the component has a `useState` or `useReducer` hook, can be called multiple times. You can check the call count on a regular function as well. Then you can test if the function was called (rendered) as many times as you expect.

### Get Component Data

```ts
getComponentData(componentName: string, options?: Options): RegisteredFunction<unknown> | undefined
```

This function is the same as [Get Data For](#get-data-for). The name serve only for better orientation when working with react components.

### Get All Data For

`getAllDataFor`

### Get Data For

`getDataFor`

### Get React Hooks

`getReactHooks`

### Get React Lifecycle

`getReactLifecycle`

### Get Stats

`getStats`

### Has Component

```ts
hasComponent(componentName: string, options?: Options): boolean
```

This function is the same as [Has Registered](#has-registered). The name serve only for better orientation when working with react components.

### Has Registered

```ts
hasRegistered(name: string, options?: Options): boolean
```

Check if a function or a react component was registered by the jest collector. See all available [`Options`](#options).

Example:

```ts
render(<SimpleComponent />);

// check if the SimpleComponent is registered in the collector
expect(collector.hasRegistered(SimpleComponent.name)).tobeTruthy();
// or you can use "hasComponent"
expect(collector.hasComponent(SimpleComponent.name)).tobeTruthy();
```

### Reset

```ts
reset(): void
reset(name: string, options?: Options): void
```

When you run more tests in the same test file, it is recomended to reset the collector data before run another test. Use [`beforeEach`](https://jestjs.io/docs/api#beforeeachfn-timeout) with the reset:

```ts
beforeEach(() => {
  collector.reset();
})
```

In cases when you would like to remove a specific function or a component from the collector, you can do it providing a name and or options. See all available [`Options`](#options).

```ts
// it will remove all registered SimpleComponents from the collector
collector.reset(SimpleComponent.name);
```

### Options

```ts
interface Options {
  dataTestId?: string | null;
  ignoreWarning?: true;
  nthChild?: number;
  parent?: OptionsParent | null;
  relativePath?: string;
}

interface OptionsParent {
  dataTestId?: string | null;
  name?: string;
  nthChild?: number;
  originMock?: boolean;
  parent?: OptionsParent | null;
  relativePath?: string;
}
```

## Real Examples