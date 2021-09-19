import React from "react";
import { isCallerDescribeNativeComponentFrame } from "./caller";
import {
  checkTheChildrenSequence,
  getDataFromArguments
} from "./clone-function.helpers";
import { processReactObject } from "./clone-function.react";
import { Children, OriginMock } from "./clone-function.types";
import { __originMock__, __relativePath__ } from "./constants";
import { PrivateCollector } from "./private-collector";
import { mockReactClass } from "./react-class";
import { removeCollectorPrivatePropsFromArgs } from "./utils";

const originMocks: OriginMock[] = [];

export const registerClone = () => {
  if (!("clone" in Function.prototype)) {
    Function.prototype["clone"] = function (
      privateCollector: PrivateCollector,
      relativePath: string,
      originMock: boolean = true
    ) {
      if (!this.name) {
        return this;
      }

      const _this = this as any;
      let result: any;
      const jestFn = jest.fn((..._props) => result);

      const isExistingMock = !!originMocks.find(
        (item) => item.name === _this.name && item.relativePath === relativePath
      );

      originMock = originMock || isExistingMock;

      const _overload = {
        // this scope will be called on each call
        [_this.name]: function () {
          /*
            if the caller is describeNativeComponentFrame, it is a proffiler
            and it cause an extra call of the function and therefore must
            be skipped
          */
          if (isCallerDescribeNativeComponentFrame()) {
            return null;
          }

          const data = getDataFromArguments(arguments);
          const args = new.target
            ? arguments
            : removeCollectorPrivatePropsFromArgs(arguments);

          const called = privateCollector.functionCalled({
            args,
            dataTestId: data.dataTestId || data.parentTestId || null,
            jestFn,
            name: _this.name,
            nthChild: data.nthChild,
            originMock,
            parent: data.parent,
            relativePath
          });

          const t0 = performance.now();

          result = new.target
            ? new _this(...Array.from(args))
            : _this.apply(_this, args);

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
          processReactObject({
            children,
            isDataTestIdInherited: privateCollector.isDataTestIdInherited,
            isNotMockedElementExcluded:
              privateCollector.isNotMockedElementExcluded,
            name: _this.name,
            parent: (originMock ? called.registered : data.parent) || null,
            parentTestId: privateCollector.isDataTestIdInherited
              ? !privateCollector.isNotMockedElementExcluded || originMock
                ? data.dataTestId || data.parentTestId
                : data.parentTestId
              : null,
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
              privateCollector
            });
          }

          jestFn(...Array.from(args));

          privateCollector.functionExecuted({
            children: children.map((item) => item[1]),
            index: called.index,
            registered: called.registered,
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

      if (originMock) {
        Object.defineProperty(_overload[_this.name], __originMock__, {
          value: true
        });
      }

      if (originMock && !isExistingMock) {
        originMocks.push({
          name: _this.name,
          relativePath
        });
      }

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
  return member.clone(privateCollector, relativePath);
};
