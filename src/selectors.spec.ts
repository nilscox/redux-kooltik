import expect from '@nilscox/expect';

import { Selectors } from './selectors';

type User = {
  name: string;
  age: number;
};

type State = {
  user: User;
};

class UserSelectors extends Selectors<State, User> {
  constructor() {
    super((state: State) => state.user);
  }

  selectUser = this.stateSelector();

  selectNameUppercase = this.createSelector((user) => {
    return user.name.toUpperCase();
  });

  selectAge = this.propertySelector('age');
}

describe('Selectors', () => {
  let userSelectors: UserSelectors;
  let state: State;

  beforeEach(() => {
    userSelectors = new UserSelectors();
    state = { user: { name: 'tom', age: 22 } };
  });

  it('creates a selector to retrieve the whole state', () => {
    expect(userSelectors.selectUser(state)).toEqual({ name: 'tom', age: 22 });
  });

  it('creates a selector computing a derived state', () => {
    expect(userSelectors.selectNameUppercase(state)).toEqual('TOM');
  });

  it('creates a selector using the propertySelector helper', () => {
    expect(userSelectors.selectAge(state)).toEqual(22);
  });
});
