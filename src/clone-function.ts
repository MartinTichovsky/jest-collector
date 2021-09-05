import { getCallerName } from "./caller";
import { PrivateCollector } from "./private-collector";

export const registerClone = () => {
  if (!("clone" in Function.prototype)) {
    Function.prototype["clone"] = function (
      privateCollector: PrivateCollector
    ) {
      if (!this.name) {
        return this;
      }

      const _this = this as any;
      let result: any;
      const jestFn = jest.fn((...props) => result);

      const _overload = {
        // this scope will be called on each call
        [_this.name]: function () {
          if (getCallerName(2) === "describeNativeComponentFrame") {
            return null;
          }

          const dataTestId = arguments[0]?.["data-testid"];

          const functionIndex = privateCollector.functionCalled({
            args: arguments,
            dataTestId,
            jestFn,
            name: _this.name
          });

          result = new.target
            ? new _this(...Array.from(arguments))
            : _this.apply(_this, arguments);

          jestFn(arguments);

          privateCollector.functionExecuted({
            dataTestId,
            index: functionIndex,
            name: _this.name,
            result
          });

          return result;
        }
      };

      Object.defineProperty(_overload[_this.name], "name", {
        value: _this.name
      });

      Object.setPrototypeOf(
        _overload[_this.name],
        Object.getPrototypeOf(_this)
      );

      Object.defineProperties(
        _overload[_this.name],
        Object.getOwnPropertyDescriptors(this)
      );

      return _overload[_this.name];
    };
  }
};

export const mockFunction = (
  member: any,
  privateCollector: PrivateCollector
) => {
  registerClone();
  return member.clone(privateCollector);
};
