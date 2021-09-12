import React from "react";
import { getCaller } from "./caller";
import {
  checkTheChildrenSequence,
  getDataFromArguments
} from "./clone-function.helpers";
import { processReactObject } from "./clone-function.react";
import { Children } from "./clone-function.types";
import { __relativePath__ } from "./constants";
import { PrivateCollector } from "./private-collector";
import { mockReactClass } from "./react-class";

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
          /*
            if the caller is describeNativeComponentFrame, it is a proffiler
            and it cause an extra call of the function and therefore must
            be skipped
          */
          if (getCaller(2).name === "describeNativeComponentFrame") {
            return null;
          }

          const data = getDataFromArguments(arguments);

          const registered = privateCollector.functionCalled({
            args: arguments,
            dataTestId: data.dataTestId,
            jestFn,
            name: _this.name,
            nthChild: data.nthChild,
            parent: data.parent,
            relativePath
          });

          const t0 = performance.now();

          result = new.target
            ? new _this(...Array.from(arguments))
            : _this.apply(_this, arguments);

          const t1 = performance.now();

          /*
            The children represent next expected calls. The react does not call the
            children components during the component call, but after the component is executed.
            Therefore to resolve the correct parent, is must be still as a active function
            in the collector.
          */
          const children: Children[] = [];

          /*
            the result from the react must be mocked to pass the parent 
            to the children for state re-renders
          */
          result = processReactObject({
            children,
            dataTestId: registered.current.dataTestId,
            isDataTestIdInherited: privateCollector.isDataTestIdInherited,
            isNotMockedElementExcluded:
              privateCollector.isNotMockedElementExcluded,
            name: _this.name,
            privateCollector,
            parent: registered.current,
            relativePath,
            object: result
          });

          /*
            When the components are rendered parallelly, there must be an easy
            way how to identify them. Therefore is created `nthChild` property.
          */
          checkTheChildrenSequence(children);

          if (result instanceof React.Component) {
            mockReactClass({
              component: _this,
              dataTestId: registered.current.dataTestId,
              componentName: _this.name,
              privateCollector,
              relativePath
            });
          }

          jestFn(arguments);

          privateCollector.functionExecuted({
            parent: registered.parent,
            children: children.map((item) => item[1]),
            dataTestId: registered.current.dataTestId,
            index: registered.index,
            name: _this.name,
            nthChild: registered.current.nthChild,
            relativePath,
            result,
            time: t1 - t0
          });

          return result;
        }
      };

      Object.defineProperty(_overload[_this.name], "name", {
        value: _this.name
      });

      Object.defineProperty(_overload[_this.name], __relativePath__, {
        value: relativePath
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
