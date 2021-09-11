import { PrivateCollector } from "./private-collector";
import { FunctionIdentity, Identity } from "./private-collector.types";

export interface GetUpdatedReactObjectProps {
  children?: ReactObject[] | ReactObject;
  object: ReactObject;
  parent?: Identity;
}

export interface ProcessReactResult {
  children: FunctionIdentity[];
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
