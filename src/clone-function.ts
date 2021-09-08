import React from "react";
import { getCaller } from "./caller";
import { PrivateCollector } from "./private-collector";
import { mockReactComponent } from "./react-component";

export const registerClone = () => {
  if (!("clone" in Function.prototype)) {
    Function.prototype["clone"] = function (
      privateCollector: PrivateCollector,
      relativePath: string
    ) {
      if (!this.name) {
        return this;
      }

      const _this = this as any;
      let result: any;
      const jestFn = jest.fn((..._props) => result);

      const _overload = {
        // this scope will be called on each call
        [_this.name]: function () {
          if (getCaller(2).name === "describeNativeComponentFrame") {
            return null;
          }

          let dataTestId = arguments[0]?.["data-testid"];

          const functionIndex = privateCollector.functionCalled({
            args: arguments,
            dataTestId,
            jestFn,
            name: _this.name,
            relativePath
          });

          result = new.target
            ? new _this(...Array.from(arguments))
            : _this.apply(_this, arguments);

          if (result instanceof React.Component) {
            mockReactComponent({
              component: _this,
              dataTestId,
              componentName: _this.name,
              privateCollector,
              relativePath
            });
          }

          jestFn(arguments);

          privateCollector.functionExecuted({
            dataTestId,
            index: functionIndex,
            name: _this.name,
            relativePath,
            result
          });

          return result;
        }
      };

      Object.defineProperty(_overload[_this.name], "name", {
        value: _this.name
      });

      Object.setPrototypeOf(
        _overload[_this.name],
        Object.getPrototypeOf(_this)
      );

      Object.defineProperties(
        _overload[_this.name],
        Object.getOwnPropertyDescriptors(this)
      );

      return _overload[_this.name];
    };
  }
};

export const mockFunction = (
  member: any,
  privateCollector: PrivateCollector,
  relativePath: string
) => {
  registerClone();
  return member.clone(privateCollector, relativePath);
};
