import React from "react";
import { getFunctionIdentity, getParentTestId } from "./clone-function.helpers";
import {
  GetUpdatedReactObjectProps,
  ProcessReactResultProps
} from "./clone-function.types";
import {
  __collectorProps__,
  __parentTestId__,
  __parent__,
  __relativePath__
} from "./constants";

const a = new Map<any, any>();

/**
 * Pass needed properties
 */
const updatedReactObject = ({
  object,
  parent,
  parentTestId
}: GetUpdatedReactObjectProps) => {
  if (object.props[__collectorProps__]) {
    object.props[__collectorProps__][__parent__] = parent;
    object.props[__collectorProps__][__parentTestId__] = parentTestId;
  }
};

/**
 * Process the React object to add needed properties
 * to the props for identification of the component
 */
export const processReactObject = ({
  children,
  isDataTestIdInherited,
  isNotMockedElementExcluded,
  name,
  object,
  parent,
  parentTestId,
  relativePath
}: ProcessReactResultProps) => {
  if (!React.isValidElement(object)) {
    return object;
  }

  // if the type is diferent from expected, update the props and don't proceed the rest
  if (
    object.type[__relativePath__] &&
    relativePath &&
    name &&
    (object.type[__relativePath__] !== relativePath ||
      (object.type[__relativePath__] === relativePath &&
        object.type.name !== name))
  ) {
    updatedReactObject({
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
  // if children is an object
  else if (
    !Array.isArray(object.props.children) &&
    React.isValidElement(object.props.children)
  ) {
    updatedReactObject({
      object: object.props.children,
      parent,
      parentTestId: getParentTestId({
        isDataTestIdInherited,
        isNotMockedElementExcluded,
        object,
        parentTestId
      })
    });

    const isMockedComponent =
      typeof object.props.children.type === "function" &&
      object.props.children.type![__relativePath__];

    // add an element to children
    if (isMockedComponent) {
      children.push([
        object.props.children,
        getFunctionIdentity(
          object.props.children,
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

    processReactObject({
      children: isMockedComponent ? [] : children,
      isDataTestIdInherited,
      isNotMockedElementExcluded,
      name: object.props.children.type.name,
      object: object.props.children,
      parent,
      parentTestId: getParentTestId({
        isDataTestIdInherited,
        isNotMockedElementExcluded,
        object: object.props.children,
        parentTestId
      }),
      relativePath: object.props.children.type[__relativePath__]
    });
  }
  // if children is an array
  else if (Array.isArray(object.props.children)) {
    for (let i = 0; i < object.props.children.length; i++) {
      if (!React.isValidElement(object.props.children[i])) {
        continue;
      }

      updatedReactObject({
        object: object.props.children[i],
        parent,
        parentTestId: getParentTestId({
          isDataTestIdInherited,
          isNotMockedElementExcluded,
          object: object.props.children[i],
          parentTestId
        })
      });

      const isMockedComponent =
        typeof object.props.children[i].type === "function" &&
        object.props.children[i].type![__relativePath__];

      if (isMockedComponent) {
        children.push([
          object.props.children[i],
          getFunctionIdentity(
            object.props.children[i],
            isDataTestIdInherited,
            getParentTestId({
              isDataTestIdInherited,
              isNotMockedElementExcluded,
              object: object.props.children[i],
              parentTestId
            })
          )
        ]);
      }

      processReactObject({
        children: isMockedComponent ? [] : children,
        isDataTestIdInherited,
        isNotMockedElementExcluded,
        name: object.props.children[i].type!.name,
        object: object.props.children[i],
        parent,
        parentTestId: getParentTestId({
          isDataTestIdInherited,
          isNotMockedElementExcluded,
          object: object.props.children[i],
          parentTestId
        }),
        relativePath: object.props.children[i].type![__relativePath__]
      });
    }
  }
};
