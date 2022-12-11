import expect from '@nilscox/expect';

import { Selectors } from './selectors';

type User = {
  name: string;
  age: number;
};

type State = {
  user: User;
};

describe('Selectors', () => {
  let selectors: Selectors<State, User>;
  let state: State;

  beforeEach(() => {
    selectors = new Selectors<State, User>((state) => state.user);
    state = { user: { name: 'tom', age: 22 } };
  });

  it('creates a selector to retrieve the whole state', () => {
    const selectUser = selectors.state();

    expect(selectUser(state)).toEqual({ name: 'tom', age: 22 });
  });

  it('creates a selector computing a derived state', () => {
    const selectNameUppercase = selectors.selector((user) => {
      return user.name.toUpperCase();
    });

    expect(selectNameUppercase(state)).toEqual('TOM');
  });

  it('creates a selector using the propertySelector helper', () => {
    const selectAge = selectors.property('age');

    expect(selectAge(state)).toEqual(22);
  });
});
