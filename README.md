![Jest Collector](https://github.com/MartinTichovsky/__sources__/raw/master/jest-collector.png)

[![NPM](https://img.shields.io/npm/v/jest-collector.svg)](https://www.npmjs.com/package/jest-collector)

## Table of Contents

- [Getting Started](#getting-started)
- [About](#about)
- [List of Collected Hooks](#list-of-collected-hooks)
- [Configuration](#configuration)
  - [exclude](#exclude)
  - [excludeImports](#excludeimports)
  - [extensions](#extensions)
  - [include](#include)
  - [includeImports](#includeimports)
  - [roots](#roots)
  - [Matches](#matches)
- [Documentation](#documentation)
  - [enableDataTestIdInheritance](#enabledatatestidinheritance)
  - [disableDataTestIdInheritance](#disabledatatestidinheritance)
  - [getCallCount](#getcallcount)
  - [getComponentData](#getcomponentdata)
  - [getAllDataFor](#getalldatafor)
  - [getDataFor](#getdatafor)
  - [getReactHooks](#getreacthooks)
  - [getReactLifecycle](#getreactlifecycle)
  - [getStats](#getstats)
  - [hasComponent](#hascomponent)
  - [hasRegistered](#hasregistered)
  - [reset](#reset)
  - [Interfaces](#interfaces)
    - [Call](#call)
    - [CallStats](#callstats)
    - [Identity](#identity)
    - [Options](#options)
    - [Parent](#parent)
    - [ReactClassLifecycle](#reactclasslifecycle)
    - [RegisteredFunction](#registeredfunction)
    - [Stats](#stats)
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

> NOTE: React class components are not fully implemented yet!

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

### exclude

[_an array of matches_]

The collector is created for each test by default. In cases when you would like to exclude a test from being processed by the collector, you can exclude it with the `exclude` option. You can provide a [`match`](#matches) pattern.

_Example:_

```js
// it will exclude the "custom.test.ts" directly under the "src"
createColector({ 
  exclude: ["src/custom.test.ts"], 
  roots: ["src"] 
});
```

### excludeImports

[_an array of matches_]

The collector is mocking every file and its exports by default. In cases when you would like to exclude a file from being processed by the collector and mock the exports, you can exclude it with the `excludeImports` option. You can provide a [`match`](#matches) pattern.

> NOTE: Excluded files are not considered in the parent tree in the collector.

_Example:_

```js
// it will not mock the "custom.ts" directly under the "src"
createColector({ 
  excludeImports: ["src/custom.ts"], 
  roots: ["src"] 
});
```

### extensions

[_an array of file extensions_]

By default the extensions are set to `.ts` and `.js`. You can set an additional extension. New set of extensions will replace the default. It means if you set `extensions` option to `[.ts]` the collector will mock the exports only from typescript files. If you provide an empty array, the collector will try to mock all files matching other options.

_Example:_

```js
// exports from all javascript and typescript files will be mocked
createColector({ 
  extensions: [".ts", ".js"], 
  roots: ["src"] 
});
```

### include

[_an array of matches_]

The collector is created for each test by default. In cases when you would like to include only a specific test to being processed by the collector, you can include it with the `include` option. Only the tests matching the `include` array will be processed by the collector. If there is a match in `exclude` option for the same test file as in `include`, the test will not be processed by the collector. You can provide a [`match`](#matches) pattern.

_Example:_

```js
// it will include only the "custom.test.ts" directly in "src"
createColector({ 
  include: ["src/custom.test.ts"], 
  roots: ["src"] 
});
```

### includeImports

[_an array of matches_]

The collector is mocking every file with exports by default. In cases when you would like to include only a specific file to being processed by the collector and mock the exports, you can include it with the `includeImports` option. If there is a match in `excludeImports` option for the same file as in `includeImports`, the file will not be processed by the collector. You can provide a [`match`](#matches) pattern.

_Example:_

```js
// it will mock only the "custom.ts" directly under the "src"
createColector({ 
  includeImports: ["src/custom.ts"], 
  roots: ["src"] 
});
```

### roots

[_an array of folders_]

The collector must have set at least one root folder of your source code. You can set more folders. A folder must have a relative path to the jest process. All files matching the other options will be mocked and processed by the jest collector. If you do not set the other options, all typescript and javascript files will be mocked and processed.

Lets say you have two folders "admin" and "src" in your repository.

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

### enableDataTestIdInheritance

```ts
// inheritance is disabled by default
enableDataTestIdInheritance(excludeNotMockedElements?: boolean): void
```

Each component should have a data-testid to be easily identified. In cases you do not want to put a data-testid to each component and you want to inherit data-testid from the parent, you can enable inheritance. When the inheritance is enabled, each component with no data-testid will try to inherit the data-testid from the parent. It works from not mocked elements as well as for mocked elements.

> IMPORTANT: When testing, on the highest level must be a mocked component to inherit the data-testid correctly.

_Examples:_

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

_Examples:_

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

### disableDataTestIdInheritance

```ts
disableDataTestIdInheritance(): void
```

When you turned on the inheritance and you would like to disable it again, you can call `disableDataTestIdInheritance` or [`reset`](#reset)

_Example:_

```ts
collector.disableDataTestIdInheritance();
```

### getCallCount

```ts
getCallCount(name: string, options?: Options): number | undefined
```

_References:_
  - [`Options`](#options)

Get number of calls for the function or a react component. If the component is a react class component, the returned number will be a number of how many times was the `render` method called.

_Examples:_

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

### getComponentData

```ts
getComponentData(componentName: string, options?: Options): RegisteredFunction<unknown> | undefined
```

_References:_
  - [`Options`](#options)

This function is the same as [getDataFor](#getdatafor). The name serve only for better orientation when working with react components.

### getAllDataFor

```ts
getAllDataFor(name: string, options?: Options): RegisteredFunction[]
getAllDataFor(options: OptionsWithName): RegisteredFunction[]

interface OptionsWithName extends Options {
  name?: string;
}
```

_References:_
  - [`Options`](#options)
  - [`RegisteredFunction`](#registeredfunction)

This method is moreless the same as [`getDataFor`](#getdatafor). It returns an array of all founded registered functions/components in the collector and it does not log a warning if there are more functions/components matching the name and options.

_Examples:_

```ts
// it returns an array of founded results for the SimpleComponent
collector.getAllDataFor(SimpleComponent.name);
```

### getDataFor

`getDataFor`

### getReactHooks

`getReactHooks`

### getReactLifecycle

```ts
getReactLifecycle(componentName: string, options?: Options): ReactClassLifecycle | undefined
```

_References:_
  - [`Options`](#options)
  - [`ReactClassLifecycle`](#reactclasslifecycle)

When you would like to get all lifecycles for a react class component, you can use `getReactLifecycle` method. The mothod returns an object with properties `render` and `setState` which are a [`jest.fn`](#https://jestjs.io/docs/mock-functions). You can check how many times was `render` or `setState` called and or arguments passed to `setState` and its returns. For more info, read the [`jest.fn documentation`](#https://jestjs.io/docs/mock-functions)

> NOTE: React class components are not fully implemented yet!

### getStats

```ts
getStats(): Stats[]
getStats(options?: GetStatsOptions): Stats[]
getStats(name: string, options?: GetStatsOptions): Stats[] | Stats | undefined

interface GetStatsOptions extends Options {
  excludeTime?: boolean;
}
```

_References:_
  - [`Options`](#options)
  - [`Stats`](#stats)

This method serves for getting statistics from the whole collector or for a specific function/component. Data includes statistics for each call, calling aguments and a result of the function or component. Because the time statistics are a dynamic number, you can exclude time from statistics with `excludeTime` option. Excluding the time from statistics is needed for test snapshots.

_Examples:_

```ts
// it returns statistics for all registered functions/components
collector.getStats();

// it returns statistics for all registered functions/components
// and it excludes time from every call stats
collector.getStats({ excludeTime: true });

// it returns statistics for all registered functions/components
// which do not have a parent, they are rendered on the top
// of the render tree. You can combine all available options
// get only specific components with data-testid or parent etc.
collector.getStats({ parent: null });

// it returns statistics for the SimpleComponent only. Every
// registered SimpleComponent will be included in the
// statisctics, if there will be only one result, it returns
// an object, if there will be more results, it returns an array
collector.getStats(SimpleComponent.name);

// it returns statistics for the SimpleComponent with data-testid 
// equal to "test-id". You can filter the results with other
// available options such as parent, nthChild etc. If there
// will be more matching results, it returns an array
collector.getStats(SimpleComponent.name, { dataTestId: "test-id" });
```

### hasComponent

```ts
hasComponent(componentName: string, options?: Options): boolean
```

_References:_
  - [`Options`](#options)

This function is the same as [hasRegistered](#hasregistered). The name serve only for better orientation when working with react components.

### hasRegistered

```ts
hasRegistered(name: string, options?: Options): boolean
```

_References:_
  - [`Options`](#options)

Check if a function or a react component was registered by the jest collector.

_Example:_

```ts
render(<SimpleComponent />);

// check if the SimpleComponent is registered in the collector
expect(collector.hasRegistered(SimpleComponent.name)).tobeTruthy();
// or you can use "hasComponent"
expect(collector.hasComponent(SimpleComponent.name)).tobeTruthy();
```

### reset

```ts
reset(): void
reset(name: string, options?: Options): void
```

_References:_
  - [`Options`](#options)

When you run more tests in the same test file, it is recomended to reset the collector data before run another test. Use [`beforeEach`](https://jestjs.io/docs/api#beforeeachfn-timeout) with the reset:

```ts
beforeEach(() => {
  collector.reset();
})
```

In cases when you would like to remove a specific function or a component from the collector, you can do it providing a name and or options.

```ts
// it will remove all registered SimpleComponents from the collector
collector.reset(SimpleComponent.name);
```

### Interfaces

#### Call

```ts
interface Call {
  args: any;
  stats: CallStats;
  result?: any;
}
```

#### CallStats

```ts
interface CallStats {
  time?: number;
}
```

#### Identity

```ts
interface Identity {
  dataTestId: string | null;
  name: string;
  nthChild?: number;
  originMock: boolean;
  relativePath: string;
}
```

#### Options

```ts
interface Options {
  dataTestId?: string | null;
  ignoreWarning?: true;
  nthChild?: number;
  parent?: Parent | null;
  relativePath?: string;
}
```

#### Parent

```ts
interface Parent {
  dataTestId?: string | null;
  name?: string;
  nthChild?: number;
  originMock?: boolean;
  parent?: Parent | null;
  relativePath?: string;
}
```

#### ReactClassLifecycle

```ts
interface ReactClassLifecycle {
  render: jest.Mock;
  setState: jest.Mock;
}
```

#### RegisteredFunction

```ts
interface RegisteredFunction {
  calls: Call[];
  current: Identity;
  hooks?: ReactHooks; // only available in react functional components
  jestFn: jest.Mock;
  lifecycle?: ReactClassLifecycle; // only available in react class components
  parent: RegisteredFunction | null;
} 
```

#### Stats

```ts
interface Stats {
  calls: Call[];
  dataTestId: string | null;
  name: string;
  nthChild?: number;
  numberOfCalls: number;
  parent: Parent | null;
  relativePath: string;
}
```

## Real Examples