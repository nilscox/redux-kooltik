import expect from '@nilscox/expect';

import { EntitiesState, EntityAdapter } from './entity-adapter';
import { EntitySelectors } from './entity-selectors';

type User = {
  name: string;
  age?: number;
};

type UserMeta = {
  fetching: boolean;
};

type State = {
  users: EntitiesState<User, UserMeta>;
};

class UserSelectors extends EntitySelectors<State, User, UserMeta> {
  constructor() {
    super('user', (state: State) => state.users);
  }

  selectIsFetching = this.property('fetching');

  selectUsers = this.entitiesSelector();
  selectUserIds = this.idsSelector();

  selectUser = this.entitySelector();
  selectName = this.entityPropertySelector('name');
  selectAge = this.entityPropertySelector('age');
}

describe('EntitySelectors', () => {
  let userSelectors: UserSelectors;
  let state: State;
  let user: User;

  beforeEach(() => {
    userSelectors = new UserSelectors();
    state = { users: EntityAdapter.initialState({ fetching: false }) };
    user = { name: 'tom', age: 22 };
    state.users.entities['tom'] = user;
    state.users.ids = ['tom'];
  });

  it('selects all the entities', () => {
    expect(userSelectors.selectUsers(state)).toEqual({ tom: user });
  });

  it('selects all the ids', () => {
    expect(userSelectors.selectUserIds(state)).toEqual(['tom']);
  });

  it('selects a single entity', () => {
    expect(userSelectors.selectUser(state, 'tom')).toEqual(user);
  });

  it('throws when the entity does not exist', () => {
    expect(() => userSelectors.selectUser(state, 'jeanne')).toThrow(
      new Error('user with id "jeanne" does not exist')
    );
  });

  it('selects a single entity using an unsafe selector', () => {
    expect(userSelectors.selectUser.unsafe(state, 'tom')).toEqual(user);
  });

  it('returns undefined when the entity does not exist', () => {
    expect(userSelectors.selectUser.unsafe(state, 'jeanne')).toBe(undefined);
  });

  it("selects an entity's property", () => {
    expect(userSelectors.selectName(state, 'tom')).toEqual('tom');
  });

  it('throws when the entity does not exist', () => {
    expect(() => userSelectors.selectName(state, 'jeanne')).toThrow(
      new Error('user with id "jeanne" does not exist')
    );
  });

  it("throws when the entity's property does not exist", () => {
    delete user.age;

    expect(() => userSelectors.selectAge(state, 'tom')).toThrow(
      new Error('user with id "tom" does not have property "age"')
    );
  });

  it("selects an entity's property using an unsafe selector", () => {
    expect(userSelectors.selectName.unsafe(state, 'tom')).toEqual('tom');
  });

  it('returns undefined when the entity does not exist', () => {
    expect(userSelectors.selectName.unsafe(state, 'jeanne')).toBe(undefined);
  });

  it('selects an extra property', () => {
    expect(userSelectors.selectIsFetching(state)).toBe(false);
  });
});
