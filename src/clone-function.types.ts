import { PrivateCollector } from "./private-collector";
import {
  FunctionIdentity,
  Identity,
  NthChild
} from "./private-collector.types";

export interface GetParentTestIdProps {
  isDataTestIdInherited: boolean;
  isNotMockedElementExcluded: boolean;
  object: ReactObject;
  parentTestId?: string;
}

export interface GetUpdatedReactObjectProps {
  children?: ReactObject[] | ReactObject;
  object: ReactObject;
  parent?: Identity;
  parentTestId?: string;
}

export interface MockChildrenProps {
  isDataTestIdInherited: boolean;
  isNotMockedElementExcluded: boolean;
  object: ReactObject;
  parent?: Identity;
  parentTestId?: string;
  privateCollector: PrivateCollector;
}

export interface ProcessReactResultProps {
  children: Children[];
  isDataTestIdInherited: boolean;
  isNotMockedElementExcluded: boolean;
  name: string;
  object: ReactObject;
  parent?: Identity;
  parentTestId?: string;
  privateCollector: PrivateCollector;
  relativePath: string;
}

export interface ReactObject {
  props: {
    children?: ReactObject | ReactObject[];
  };
  type?: {
    __relativePath__?: string;
    name: string;
    clone: (
      privateCollector: PrivateCollector,
      relativePath: string,
      originMock: boolean
    ) => unknown;
  };
}

export type Children = [ReactObject, FunctionIdentity & NthChild];
