/* istanbul ignore file */

import { Debugger, InspectorNotification, Runtime, Session } from "inspector";
import * as vm from "vm";
import { RESOLVE_PATH } from "./constants";
import { convertFileSystem } from "./utils";

type Context =
  | {
      contextId: number | undefined;
      func: unknown | undefined;
    }
  | undefined;

let context: Context = undefined;
let session: Session | undefined = undefined;
const scripts: Debugger.ScriptParsedEventDataType[] = [];

/**
 * Because each test is run separately with different
 * context, it is needed to use VM to get the
 * right context to resolve a function path
 */
const createContext = (session: Session) => {
  if (context === undefined) {
    context = {
      contextId: 0,
      func: undefined
    };

    session.post("Runtime.enable");
    let contextId: number | undefined = undefined;

    session.once(
      "Runtime.executionContextCreated",
      (
        message: InspectorNotification<Runtime.ExecutionContextCreatedEventDataType>
      ) => {
        contextId = message.params.context.id;
      }
    );

    vm.createContext(context);
    context.contextId = contextId;
    session.post("Runtime.disable");
  }

  return context;
};

const createSession = () => {
  if (session === undefined) {
    session = new Session();
    session.connect();

    session.on(
      "Debugger.scriptParsed",
      (message: InspectorNotification<Debugger.ScriptParsedEventDataType>) => {
        scripts[message.params.scriptId] = message.params;
      }
    );

    session.post("Debugger.enable");
  }

  return session;
};

/**
 * Resolve path using the debugger
 */
export const resolvePath = (func: unknown) => {
  const session = createSession();
  const context = createContext(session);

  context.func = func;
  const contextId = context.contextId;
  const expression = `func`;

  let objectId: string | undefined;

  session.post(
    "Runtime.evaluate",
    { contextId, expression },
    (err: Error | null, params: Runtime.EvaluateReturnType) => {
      if (!err && params.result?.objectId) {
        objectId = params.result.objectId;
      }
    }
  );

  let relativePath: string = RESOLVE_PATH;

  if (!objectId) {
    return relativePath;
  }

  session.post(
    "Runtime.getProperties",
    { objectId },
    (
      err: Error | null,
      params: Runtime.GetPropertiesReturnType | {} | undefined
    ) => {
      if (
        err ||
        !(params && "internalProperties" in params && params.internalProperties)
      ) {
        return;
      }

      const location = params.internalProperties.find(
        (item) => item.name === "[[FunctionLocation]]"
      );

      if (location?.value?.value?.scriptId) {
        const script = scripts[location.value.value.scriptId];
        const cwd = convertFileSystem(process.cwd());
        relativePath = script.url.replace(
          `file://${cwd.startsWith("/") ? cwd : `/${cwd}`}`,
          ""
        );
      }
    }
  );

  return relativePath;
};

/* 
Resources:
  https://github.com/midrissi/func-loc
  https://github.com/pulumi/pulumi/pull/6648/files
*/
