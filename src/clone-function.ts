import React from "react";
import { getCaller } from "./caller";
import {
  GetUpdatedReactObjectProps,
  ProcessReactResult,
  ReactObject
} from "./clone-function.types";
import { PrivateCollector } from "./private-collector";
import { FunctionIdentity } from "./private-collector.types";
import { mockReactClass } from "./react-class";

const getDataFromArguments = (args: any) => {
  return {
    dataTestId: args && args[0] ? args[0]?.["data-testid"] : undefined,
    parent: args && args[0] ? args[0]?.["__parent__"] : undefined
  };
};

const getFunctionIdentity = (
  object: ReactObject,
  privateCollector: PrivateCollector
) => ({
  dataTestId:
    object.props?.["data-testid"] ||
    (privateCollector.isDataTestIdInherited
      ? privateCollector.getActiveFunction()?.dataTestId
      : undefined),
  name: object.type!.name,
  relativePath: object.type!.__relativePath__!
});

/**
 * Re-create the react object to be able pass
 * the needed properties
 */
const getUpdatedReactObject = (
  { children, object, parent }: GetUpdatedReactObjectProps,
  defineParent: boolean = true
): ReactObject => {
  const objectDescriptors = Object.getOwnPropertyDescriptors(object);

  const updtedObjectDescriptors = {
    ...objectDescriptors,
    props: {
      ...objectDescriptors.props,
      value: {
        ...objectDescriptors.props.value,
        ...(children ? { children } : {}),
        ...(defineParent ? { __parent__: parent } : {})
      }
    }
  };

  const updatedObject = {} as ReactObject;
  Object.defineProperties(updatedObject, updtedObjectDescriptors);

  return updatedObject;
};

/**
 * Process the react object to add needed properties
 * for identification of the component to the props
 */
const processReactObject = ({
  children,
  name,
  object,
  parent,
  privateCollector,
  relativePath
}: ProcessReactResult) => {
  if (!React.isValidElement(object)) {
    return object;
  }

  if (
    !Array.isArray(object.props.children) &&
    React.isValidElement(object.props.children)
  ) {
    // if the children is an object
    object = getUpdatedReactObject(
      {
        children: getUpdatedReactObject({
          object: !object.props.children.type.__relativePath__
            ? processReactObject({
                children,
                name,
                parent,
                privateCollector,
                relativePath,
                object: object.props.children
              })
            : object.props.children,
          parent
        }),
        object: object,
        parent
      },
      false
    );

    if ((object.props.children as ReactObject).type?.__relativePath__) {
      children.push(
        getFunctionIdentity(
          object.props.children as ReactObject,
          privateCollector
        )
      );
    }
  } else if (
    !object.props.children &&
    object.type.__relativePath__ &&
    (object.type.name !== name || object.type.__relativePath__ !== relativePath)
  ) {
    // if the children does not exist and the react object is different from expected
    object = getUpdatedReactObject({
      object,
      parent
    });
    children.push(getFunctionIdentity(object, privateCollector));
  }
  // process all children
  else if (Array.isArray(object.props.children)) {
    const newChildren: ReactObject[] = [];

    for (let i = 0; i < object.props.children.length; i++) {
      if (object.props.children[i]?.type?.__relativePath__) {
        // if the children contains __telativePath__ it is a mocked component
        newChildren.push(
          getUpdatedReactObject({ object: object.props.children[i], parent })
        );
        children.push(getFunctionIdentity(object, privateCollector));
      } else if (React.isValidElement(object.props.children[i])) {
        /*
          if the children is a valid react element and does not contain
          __relativePath__, it can contain inner children with mocked 
          component and must be processed to add the parent object
        */
        newChildren.push(
          processReactObject({
            children,
            name,
            parent,
            privateCollector,
            relativePath,
            object: object.props.children[i]
          })
        );
      } else {
        // others elements such as texts etc. will be not processed
        newChildren.push(object.props.children[i] as unknown as ReactObject);
      }
    }

    object = getUpdatedReactObject(
      {
        children: newChildren,
        object: object,
        parent
      },
      false
    );
  }

  return object;
};

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
          const children: FunctionIdentity[] = [];

          /*
            the result from the react must be mocked to pass the parent 
            to the children for state re-renders
          */
          result = processReactObject({
            children,
            name: _this.name,
            privateCollector,
            parent: registered.current,
            relativePath,
            object: result
          });

          if (result instanceof React.Component) {
            mockReactClass({
              component: _this,
              dataTestId: registered.dataTestId,
              componentName: _this.name,
              privateCollector,
              relativePath
            });
          }

          jestFn(arguments);

          privateCollector.functionExecuted({
            parent: registered.parent,
            children,
            dataTestId: registered.dataTestId,
            index: registered.index,
            name: _this.name,
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

      Object.defineProperty(_overload[_this.name], "__relativePath__", {
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
