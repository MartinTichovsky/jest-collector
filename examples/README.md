## Jest Collector Examples

The `examples` is a monorepository using [`lerna`](https://github.com/lerna/lerna). I chose a monoreposity because of testing, if the Jest Collector works properly in monorepositories. Go over the projects in `packages` and check out containing tests. Every test contains a description of what is being tested and why.

To test it on your local machine, use `yarn` to install all needed packages:

```bash
yarn
```

Then go to a specific test and run the test in it. If you are using `Visual Studio Code` I recommend using [`Jest Runner`](https://marketplace.visualstudio.com/items?itemName=firsttris.vscode-jest-runner) to be able run a test more comfortably.

> NOTE: Not every test will pass and that is the intention.