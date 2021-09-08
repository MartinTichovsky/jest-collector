import { RegisteredFunction } from "../private-collector.types";

export const removeStatsFromCalls = (
  registered: RegisteredFunction<never> | undefined
) => {
  if (!registered) {
    return undefined;
  }

  const result = [];

  for (let call of registered.calls) {
    const item = { ...call };
    delete (item as any).stats;
    result.push(item);
  }

  return {
    ...registered,
    calls: result
  };
};
