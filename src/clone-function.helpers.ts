import {
  Children,
  GetParentTestIdProps,
  ReactObject
} from "./clone-function.types";
import {
  DATA_TEST_ID,
  __collectorProps__,
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
    const leftSideIndex = findLeftSideIndex(children, index);
    const rightSideIndex = findRightSideIndex(children, index);

    let nthChild: number | undefined = undefined;

    if (leftSideIndex !== -1) {
      nthChild = children[leftSideIndex][1].nthChild! + 1;
    } else if (rightSideIndex !== -1) {
      nthChild = 1;
    }

    if (
      nthChild !== undefined &&
      children[index][0].props[__collectorProps__]
    ) {
      children[index][0].props[__collectorProps__]![__nthChild__] = nthChild;
      children[index][1].nthChild = nthChild;
    }
  }
};

const findRightSideIndex = (children: Children[], index: number) =>
  children.findIndex(
    (item, itemIndex) =>
      itemIndex > index && isMatch(children[index][1], item[1])
  );

const findLeftSideIndex = (children: Children[], index: number) => {
  for (let i = index - 1; i >= 0; i--) {
    if (isMatch(children[index][1], children[i][1])) {
      return i;
    }
  }

  return -1;
};

export const getDataFromArguments = (args: any) => {
  return {
    dataTestId: args && args[0] ? args[0][DATA_TEST_ID] : null,
    nthChild:
      args && args[0]
        ? args[0][__collectorProps__] &&
          args[0][__collectorProps__][__nthChild__]
        : undefined,
    parent:
      args && args[0]
        ? args[0][__collectorProps__] && args[0][__collectorProps__][__parent__]
        : undefined,
    parentTestId:
      args && args[0]
        ? args[0][__collectorProps__] &&
          args[0][__collectorProps__][__parentTestId__]
        : undefined
  };
};

export const getFunctionIdentity = (
  object: ReactObject,
  isDataTestIdInherited: boolean,
  dataTestId?: string
) => ({
  dataTestId:
    object.props[DATA_TEST_ID] ||
    (object.props[__collectorProps__] &&
      object.props[__collectorProps__][__parentTestId__]) ||
    (isDataTestIdInherited && dataTestId ? dataTestId : null),
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
