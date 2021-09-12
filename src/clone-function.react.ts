import React from "react";
import {
  getFunctionIdentity,
  getTrueDataTestId
} from "./clone-function.helpers";
import {
  GetUpdatedReactObjectProps,
  MockChildrenProps,
  ProcessReactResult,
  ReactObject
} from "./clone-function.types";
import {
  RESOLVE_PATH,
  __dataTestId__,
  __parent__,
  __relativePath__
} from "./constants";

/**
 * Re-create the react object to be able passing
 * the needed properties
 */
const getUpdatedReactObject = (
  { children, dataTestId, object, parent }: GetUpdatedReactObjectProps,
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
          ? { [__parent__]: parent, [__dataTestId__]: dataTestId }
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
  dataTestId,
  isDataTestIdInherited,
  isNotMockedElementExcluded,
  name,
  object,
  parent,
  privateCollector,
  relativePath
}: ProcessReactResult) => {
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
              dataTestId: getTrueDataTestId({
                dataTestId,
                isDataTestIdInherited,
                isNotMockedElementExcluded,
                object
              }),
              object: !object.props.children.type[__relativePath__]
                ? /*
                    if the children does contain more children and it is 
                    not a mocked component, must be processed too
                  */
                  processReactObject({
                    children,
                    dataTestId: getTrueDataTestId({
                      dataTestId,
                      isDataTestIdInherited,
                      isNotMockedElementExcluded,
                      object
                    }),
                    isDataTestIdInherited,
                    isNotMockedElementExcluded,
                    name,
                    parent,
                    privateCollector,
                    relativePath,
                    object: object.props.children
                  })
                : object.props.children,
              parent
            })
          : !object.props.children.type[__relativePath__]
          ? // if it is a not mocked component, must be mocked
            mockReactComponent({
              dataTestId,
              isDataTestIdInherited,
              isNotMockedElementExcluded,
              object: object.props.children,
              parent,
              privateCollector
            })
          : // otherwise update the props to pass needed data to the children
            getUpdatedReactObject({
              object: object.props.children,
              dataTestId: getTrueDataTestId({
                dataTestId,
                isDataTestIdInherited,
                isNotMockedElementExcluded,
                object
              }),
              parent
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
          getTrueDataTestId({
            dataTestId,
            isDataTestIdInherited,
            isNotMockedElementExcluded,
            object
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
      dataTestId: getTrueDataTestId({
        dataTestId,
        isDataTestIdInherited,
        isNotMockedElementExcluded,
        object
      }),
      parent
    });

    children.push([
      object,
      getFunctionIdentity(
        object,
        isDataTestIdInherited,
        getTrueDataTestId({
          dataTestId,
          isDataTestIdInherited,
          isNotMockedElementExcluded,
          object
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
          dataTestId: getTrueDataTestId({
            dataTestId,
            isDataTestIdInherited,
            isNotMockedElementExcluded,
            object: object.props.children[i]
          }),
          object: object.props.children[i],
          parent
        });

        newChildren.push(child);

        children.push([
          child,
          getFunctionIdentity(
            child,
            isDataTestIdInherited,
            getTrueDataTestId({
              dataTestId,
              isDataTestIdInherited,
              isNotMockedElementExcluded,
              object: child
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
                dataTestId: getTrueDataTestId({
                  dataTestId,
                  isDataTestIdInherited,
                  isNotMockedElementExcluded,
                  object: object.props.children[i]
                }),
                isDataTestIdInherited,
                isNotMockedElementExcluded,
                name,
                object: object.props.children[i],
                parent,
                privateCollector,
                relativePath
              })
            : // otherwise must be mocked
              mockReactComponent({
                dataTestId: getTrueDataTestId({
                  dataTestId,
                  isDataTestIdInherited,
                  isNotMockedElementExcluded,
                  object: object.props.children[i]
                }),
                isDataTestIdInherited,
                isNotMockedElementExcluded,
                object: object.props.children[i],
                parent,
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
      dataTestId: getTrueDataTestId({
        dataTestId,
        isDataTestIdInherited,
        isNotMockedElementExcluded,
        object
      }),
      isDataTestIdInherited,
      isNotMockedElementExcluded,
      object,
      parent,
      privateCollector
    });

    object = getUpdatedReactObject({
      dataTestId: getTrueDataTestId({
        dataTestId,
        isDataTestIdInherited,
        isNotMockedElementExcluded,
        object
      }),
      object,
      parent
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
  dataTestId,
  isDataTestIdInherited,
  isNotMockedElementExcluded,
  object,
  parent,
  privateCollector
}: MockChildrenProps) => {
  if (typeof object.type !== "function") {
    return object;
  }

  object = getUpdatedReactObject({
    dataTestId: getTrueDataTestId({
      dataTestId,
      isDataTestIdInherited,
      isNotMockedElementExcluded,
      object
    }),
    object,
    parent
  });

  const objectDescriptors = Object.getOwnPropertyDescriptors(object);

  const updatedObjectDescriptors = {
    ...objectDescriptors,
    type: {
      ...objectDescriptors.type,
      value: object.type!.clone(privateCollector, RESOLVE_PATH)
    }
  };

  const updatedObject = {};

  Object.defineProperties(updatedObject, updatedObjectDescriptors);

  return updatedObject as ReactObject;
};
