import { render } from "@testing-library/react";
import React from "react";
import { WrongUseEffectUse } from "./WrongUseEffectUse";

test("WrongUseEffectUse", () => {
  render(<WrongUseEffectUse />);

  expect(
    collector.getReactHooks(WrongUseEffectUse.name)?.getHook("useEffect", 1)
  ).not.toBeUndefined();
});
