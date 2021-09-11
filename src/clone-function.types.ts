import { PrivateCollector } from "./private-collector";
import {
  FunctionIdentity,
  Identity,
  NthChild
} from "./private-collector.types";

export interface GetUpdatedReactObjectProps {
  children?: ReactObject[] | ReactObject;
  dataTestId?: string;
  object: ReactObject;
  parent?: Identity;
}

export interface ProcessReactResult {
  children: Children[];
  dataTestId?: string;
  isDataTestIdInherited: boolean;
  name: string;
  object: ReactObject;
  parent?: Identity;
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
  };
}

export type Children = [ReactObject, FunctionIdentity & NthChild];
