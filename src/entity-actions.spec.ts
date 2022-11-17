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

class UserActions extends EntityActions<User> {
  private adapter = new EntityAdapter<User>((user) => user.id);

  constructor() {
    super('user');
  }

  setUser = this.action('set-user', this.adapter.setOne);

  setName = this.entityAction('set-name', (user, name: string) => {
    user.name = name;
  });

  setAge = this.setEntityProperty('age');
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
