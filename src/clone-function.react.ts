import React from "react";
import {
  getFunctionIdentity,
  getParentTestId,
  getRelativePathForUnknown
} from "./clone-function.helpers";
import {
  GetUpdatedReactObjectProps,
  MockChildrenProps,
  ProcessReactResultProps,
  ReactObject
} from "./clone-function.types";
import { __parentTestId__, __parent__, __relativePath__ } from "./constants";

/**
 * Re-create the react object to be able passing
 * the needed properties
 */
const getUpdatedReactObject = (
  { children, object, parent, parentTestId }: GetUpdatedReactObjectProps,
  defineProps: boolean = true
): ReactObject => {
  const objectDescriptors = Object.getOwnPropertyDescriptors(object);

  const updatedObjectDescriptors = {
    ...objectDescriptors,
    props: {
      ...objectDescriptors.props,
      value: {
        ...objectDescriptors.props.value,
        ...(children ? { children } : {}),
        ...(defineProps
          ? { [__parent__]: parent, [__parentTestId__]: parentTestId }
          : {})
      }
    }
  };

  const updatedObject = {} as ReactObject;
  Object.defineProperties(updatedObject, updatedObjectDescriptors);

  return updatedObject;
};

/**
 * Process the react object to add needed properties
 * for identification of the component to the props
 */
export const processReactObject = ({
  children,
  isDataTestIdInherited,
  isNotMockedElementExcluded,
  name,
  object,
  parent,
  parentTestId,
  privateCollector,
  relativePath
}: ProcessReactResultProps) => {
  if (!React.isValidElement(object)) {
    return object;
  }

  // if the children is an object
  if (
    !Array.isArray(object.props.children) &&
    React.isValidElement(object.props.children)
  ) {
    object = getUpdatedReactObject(
      {
        children: object.props.children.props.children
          ? // if the children does contain more children, update the properties
            getUpdatedReactObject({
              object: !object.props.children.type[__relativePath__]
                ? /*
                    if the children does contain more children and it is 
                    not a mocked component, must be processed too
                  */
                  processReactObject({
                    children,
                    isDataTestIdInherited,
                    isNotMockedElementExcluded,
                    name,
                    parent,
                    parentTestId: getParentTestId({
                      isDataTestIdInherited,
                      isNotMockedElementExcluded,
                      object,
                      parentTestId
                    }),
                    privateCollector,
                    relativePath,
                    object: object.props.children
                  })
                : object.props.children,
              parent,
              parentTestId: getParentTestId({
                isDataTestIdInherited,
                isNotMockedElementExcluded,
                object,
                parentTestId
              })
            })
          : !object.props.children.type[__relativePath__]
          ? // if it is a not mocked component, must be mocked
            mockReactComponent({
              isDataTestIdInherited,
              isNotMockedElementExcluded,
              object: object.props.children,
              parent,
              parentTestId: getParentTestId({
                isDataTestIdInherited,
                isNotMockedElementExcluded,
                object,
                parentTestId
              }),
              privateCollector
            })
          : // otherwise update the props to pass needed data to the children
            getUpdatedReactObject({
              object: object.props.children,
              parent,
              parentTestId: getParentTestId({
                isDataTestIdInherited,
                isNotMockedElementExcluded,
                object,
                parentTestId
              })
            }),
        object,
        parent
      },
      false
    );

    // add an element to the children
    if ((object.props.children as ReactObject).type![__relativePath__]) {
      children.push([
        object.props.children as ReactObject,
        getFunctionIdentity(
          object.props.children as ReactObject,
          isDataTestIdInherited,
          getParentTestId({
            isDataTestIdInherited,
            isNotMockedElementExcluded,
            object,
            parentTestId
          })
        )
      ]);
    }
  }
  // if the children does not exist and the react object is different from expected
  else if (
    !object.props.children &&
    object.type[__relativePath__] &&
    object.type[__relativePath__] !== relativePath
  ) {
    object = getUpdatedReactObject({
      object,
      parent,
      parentTestId: getParentTestId({
        isDataTestIdInherited,
        isNotMockedElementExcluded,
        object,
        parentTestId
      })
    });

    children.push([
      object,
      getFunctionIdentity(
        object,
        isDataTestIdInherited,
        getParentTestId({
          isDataTestIdInherited,
          isNotMockedElementExcluded,
          object,
          parentTestId
        })
      )
    ]);
  }
  // if the children is an array
  else if (Array.isArray(object.props.children)) {
    const newChildren: ReactObject[] = [];

    for (let i = 0; i < object.props.children.length; i++) {
      if (object.props.children[i].type?.[__relativePath__]) {
        // if the children does contain __relativePath__ it is a mocked component
        const child = getUpdatedReactObject({
          object: object.props.children[i],
          parent,
          parentTestId: getParentTestId({
            isDataTestIdInherited,
            isNotMockedElementExcluded,
            object: object.props.children[i],
            parentTestId
          })
        });

        newChildren.push(child);

        children.push([
          child,
          getFunctionIdentity(
            child,
            isDataTestIdInherited,
            getParentTestId({
              isDataTestIdInherited,
              isNotMockedElementExcluded,
              object: child,
              parentTestId
            })
          )
        ]);
      } else if (React.isValidElement(object.props.children[i])) {
        /*
          if the children is a valid react element and does not contain
          __relativePath__, it can contain inner children with mocked 
          component and must be processed to add the parent object
        */
        newChildren.push(
          object.props.children[i].props.children
            ? // if the children does contain other children, must be processed
              processReactObject({
                children,
                isDataTestIdInherited,
                isNotMockedElementExcluded,
                name,
                object: object.props.children[i],
                parent,
                parentTestId: getParentTestId({
                  isDataTestIdInherited,
                  isNotMockedElementExcluded,
                  object: object.props.children[i],
                  parentTestId
                }),
                privateCollector,
                relativePath
              })
            : // otherwise must be mocked
              mockReactComponent({
                isDataTestIdInherited,
                isNotMockedElementExcluded,
                object: object.props.children[i],
                parent,
                parentTestId: getParentTestId({
                  isDataTestIdInherited,
                  isNotMockedElementExcluded,
                  object: object.props.children[i],
                  parentTestId
                }),
                privateCollector
              })
        );
      } else {
        // others elements such as texts etc. will be not processed
        newChildren.push(object.props.children[i]);
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
  // if the component does contain function in type, muse be mocked
  else if (
    typeof object.type === "function" &&
    !object.type[__relativePath__]
  ) {
    object = mockReactComponent({
      isDataTestIdInherited,
      isNotMockedElementExcluded,
      object,
      parent,
      parentTestId: getParentTestId({
        isDataTestIdInherited,
        isNotMockedElementExcluded,
        object,
        parentTestId
      }),
      privateCollector
    });

    object = getUpdatedReactObject({
      object,
      parent,
      parentTestId: getParentTestId({
        isDataTestIdInherited,
        isNotMockedElementExcluded,
        object,
        parentTestId
      })
    });
  }

  return object;
};

/**
 * Not mocked components through the jest collecotor must be mocked
 * otherwise it is not possible to pass testid or identify inner
 * element. Not mocked components does contain a function in the type
 * and no props.children. After the react execute the function it
 * retrieve the next element.
 */
const mockReactComponent = ({
  isDataTestIdInherited,
  isNotMockedElementExcluded,
  object,
  parent,
  parentTestId,
  privateCollector
}: MockChildrenProps) => {
  if (typeof object.type !== "function") {
    return object;
  }

  object = getUpdatedReactObject({
    object,
    parentTestId: getParentTestId({
      isDataTestIdInherited,
      isNotMockedElementExcluded,
      object,
      parentTestId
    }),
    parent
  });

  const objectDescriptors = Object.getOwnPropertyDescriptors(object);
  const relativePath = getRelativePathForUnknown(object.type, privateCollector);

  const updatedObjectDescriptors = {
    ...objectDescriptors,
    type: {
      ...objectDescriptors.type,
      value: object.type!.clone(privateCollector, relativePath, false)
    }
  };

  const updatedObject = {};

  Object.defineProperties(updatedObject, updatedObjectDescriptors);

  return updatedObject as ReactObject;
};
