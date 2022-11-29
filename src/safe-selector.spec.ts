import expect from '@nilscox/expect';

import { createSafeSelector } from './safe-selector';

describe('safe-selector', () => {
  it('creates a safe selector', () => {
    const selector = createSafeSelector(
      (value: number) => new Error(`${value} not found`),
      (value: number) => String(value)
    );

    expect(selector(1)).toEqual('1');
    expect(selector.unsafe(1)).toEqual('1');
  });

  it('throws when the value is undefined', () => {
    const selector = createSafeSelector(
      () => new Error('not found'),
      () => undefined
    );

    expect(selector).toThrow(new Error('not found'));
    expect(selector.unsafe()).toBe(undefined);
  });
});
