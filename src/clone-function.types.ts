/* istanbul ignore file */

import {
  DATA_TEST_ID,
  __collectorProps__,
  __nthChild__,
  __originMock__,
  __parentTestId__,
  __parent__,
  __relativePath__
} from "./constants";
import { PrivateCollector } from "./private-collector";
import {
  FunctionIdentity,
  NthChild,
  RegisteredFunction
} from "./private-collector.types";

export interface GetParentTestIdProps {
  isDataTestIdInherited: boolean;
  isNotMockedElementExcluded: boolean;
  object: ReactObject;
  parentTestId?: string;
}

export interface GetUpdatedReactObjectProps {
  object: ReactObject;
  parent?: RegisteredFunction | null;
  parentTestId?: string;
}

export interface OriginMock {
  name: string;
  relativePath: string;
}

export interface ProcessReactResultProps {
  children: Children[];
  isDataTestIdInherited: boolean;
  isNotMockedElementExcluded: boolean;
  name?: string;
  object: ReactObject;
  parent?: RegisteredFunction | null;
  parentTestId?: string;
  relativePath?: string;
}

export interface ReactObject {
  props: {
    [__collectorProps__]?: {
      [__nthChild__]?: number;
      [__parent__]?: RegisteredFunction | null;
      [__parentTestId__]?: string;
    };
    [DATA_TEST_ID]?: string | null;
    children?: ReactObject | ReactObject[];
  };
  type?: {
    [__originMock__]?: boolean;
    [__relativePath__]?: string;
    name: string;
    clone: (
      privateCollector: PrivateCollector,
      relativePath: string,
      originMock: boolean
    ) => unknown;
  };
}

export type Children = [ReactObject, FunctionIdentity & NthChild];
