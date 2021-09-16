import {
  Children,
  GetParentTestIdProps,
  ReactObject
} from "./clone-function.types";
import {
  DATA_TEST_ID,
  __nthChild__,
  __originMock__,
  __parentTestId__,
  __parent__,
  __relativePath__
} from "./constants";
import { FunctionIdentity } from "./private-collector.types";

/**
 * If the children are rendered next to each other, it is
 * hard to identify them. Therefore is created nthChild
 * property, which means the sequence of the component
 * during the render.
 */
export const checkTheChildrenSequence = (children: Children[]) => {
  for (let index = 0; index < children.length; index++) {
    const leftSideIndex = children.findIndex(
      (item, itemIndex) =>
        itemIndex < index && isMatch(children[index][1], item[1])
    );
    const rightSideIndex = children.findIndex(
      (item, itemIndex) =>
        itemIndex > index && isMatch(children[index][1], item[1])
    );

    let nthChild: number | undefined = undefined;

    if (leftSideIndex !== -1) {
      nthChild = children[leftSideIndex][1].nthChild! + 1;
    } else if (rightSideIndex !== -1) {
      nthChild = 1;
    }

    if (nthChild !== undefined) {
      children[index][0].props[__nthChild__] = nthChild;
      children[index][1].nthChild = nthChild;
    }
  }
};

export const getDataFromArguments = (args: any) => {
  return {
    dataTestId: args && args[0] ? args[0][DATA_TEST_ID] : undefined,
    nthChild: args && args[0] ? args[0][__nthChild__] : undefined,
    parent: args && args[0] ? args[0][__parent__] : undefined,
    parentTestId: args && args[0] ? args[0][__parentTestId__] : undefined
  };
};

export const getFunctionIdentity = (
  object: ReactObject,
  isDataTestIdInherited: boolean,
  dataTestId?: string
) => ({
  dataTestId:
    object.props[DATA_TEST_ID] ||
    object.props[__parentTestId__] ||
    (isDataTestIdInherited ? dataTestId : undefined),
  name: object.type!.name,
  relativePath: object.type![__relativePath__]!
});

export const getParentTestId = ({
  isDataTestIdInherited,
  isNotMockedElementExcluded,
  object,
  parentTestId
}: GetParentTestIdProps) => {
  if (!isDataTestIdInherited) {
    return undefined;
  }

  if (!isNotMockedElementExcluded || object.type![__originMock__]) {
    return object.props[DATA_TEST_ID] || parentTestId;
  }

  return parentTestId;
};

const isMatch = (leftSide: FunctionIdentity, rightSide: FunctionIdentity) =>
  leftSide.dataTestId === rightSide.dataTestId &&
  leftSide.name === rightSide.name &&
  leftSide.relativePath === rightSide.relativePath;
