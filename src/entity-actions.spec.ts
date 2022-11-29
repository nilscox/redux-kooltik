import expect from '@nilscox/expect';
import { combineReducers } from 'redux';

import { EntityActions } from './entity-actions';
import { EntityAdapter } from './entity-adapter';
import { EntitySelectors } from './entity-selectors';
import { createTestStore } from './test-store';

type User = {
  id: string;
  name: string;
  age: number;
};

type UserMeta = {
  fetching: boolean;
};

class UserActions extends EntityActions<User, UserMeta> {
  private adapter = new EntityAdapter<User>((user) => user.id);

  constructor() {
    super('user', { fetching: false });
  }

  setUser = this.action('set-user', this.adapter.setOne);

  setName = this.entityAction('set-name', (user: User, name: string) => {
    user.name = name;
  });

  setAge = this.setEntityProperty('age');

  setFetching = this.createSetter('fetching');
}

describe('EntityActions', () => {
  let userActions: UserActions;

  beforeEach(() => {
    userActions = new UserActions();
  });

  it('creates an action targeting a specific entity', () => {
    expect(userActions.setName('1', 'tom')).toEqual({
      type: 'user/set-name',
      entityId: '1',
      payload: 'tom',
    });
  });

  it('creates an action using the setPropertyAction helper', () => {
    expect(userActions.setAge('1', 22)).toEqual({
      type: 'user/set-age',
      entityId: '1',
      payload: 22,
    });
  });

  it('creates an action on an extra property', () => {
    expect(userActions.setFetching(true)).toEqual({
      type: 'user/set-fetching',
      payload: true,
    });
  });

  it('initial extra properties typings ', () => {
    class WithoutExtraProperties extends EntityActions<User> {
      constructor() {
        // @ts-expect-error unexpected initial properties
        super('user', { fetching: false });
      }
    }

    class WithExtraProperties extends EntityActions<User, UserMeta> {
      constructor() {
        // @ts-expect-error missing initial properties
        super('user');
      }
    }

    WithoutExtraProperties;
    WithExtraProperties;
  });

  it('dispatches and selects using a redux store', () => {
    class UserSelectors extends EntitySelectors<State, User> {
      constructor() {
        super('user', (state: State) => state.users);
      }

      selectName = this.entityPropertySelector('name');
      selectAge = this.entityPropertySelector('age');
    }

    const userSelectors = new UserSelectors();

    const store = createTestStore(
      combineReducers({
        users: userActions.reducer(),
      })
    );

    type State = ReturnType<typeof store.getState>;

    store.dispatch(userActions.setUser({ id: '1', name: 'tom', age: 22 }));
    store.dispatch(userActions.setAge('1', 23));
    expect(store.select(userSelectors.selectAge, '1')).toEqual(23);
  });
});
