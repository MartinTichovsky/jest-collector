import { RegisteredFunction } from "../private-collector.types";

export const removeStatsFromCalls = (
  registered: RegisteredFunction<unknown> | undefined
) => {
  if (!registered) {
    return undefined;
  }

  const result = [];

  for (let call of registered.calls) {
    const item = { ...call };
    delete (item as Record<string, unknown>).stats;
    result.push(item);
  }

  return {
    ...registered,
    calls: result
  };
};
