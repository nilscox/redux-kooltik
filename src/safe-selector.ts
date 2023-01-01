export interface SafeSelector<Params extends unknown[], Result> {
  (...params: Params): Result;
  unsafe(this: void, ...params: Params): Result | undefined;
}

export const createSafeSelector = <Params extends unknown[], Result>(
  getError: (...params: Params) => Error,
  unsafe: SafeSelector<Params, Result>['unsafe']
) => {
  const selector: SafeSelector<Params, Result> = (...params) => {
    const value = unsafe(...params);

    if (value === undefined) {
      throw getError(...params);
    }

    return value;
  };

  selector.unsafe = unsafe;

  return selector;
};
