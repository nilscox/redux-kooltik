import expect from '@nilscox/expect';

import { EntityActions } from './entity-actions';
import { EntitiesState, EntityAdapter } from './entity-adapter';
import { createTestStore } from './test-store';

type User = {
  id: string;
  name: string;
};

class BaseUserActions extends EntityActions<User> {
  protected adapter = new EntityAdapter<User>((user) => user.id);

  constructor() {
    super('user');
  }
}

describe('EntityActions', () => {
  const state: EntitiesState<User> = {
    ids: ['1'],
    entities: {
      '1': { id: '1', name: 'tom' },
    },
  };

  it('creates an action targeting a specific entity', () => {
    class UserActions extends BaseUserActions {
      setName = this.entityAction('set-name', (user: User, name: string) => {
        user.name = name;
      });
    }

    const userActions = new UserActions();
    const reducer = userActions.reducer();

    expect(userActions.setName('1', 'jan')).toEqual({
      type: 'user/set-name',
      entityId: '1',
      payload: 'jan',
    });

    expect(reducer(state, userActions.setName('1', 'jan'))).toEqual({
      ids: ['1'],
      entities: {
        '1': { id: '1', name: 'jan' },
      },
    });
  });

  it('creates an action using the setEntityProperty helper', () => {
    class UserActions extends BaseUserActions {
      setName = this.setEntityProperty('name');
    }

    const userActions = new UserActions();
    const reducer = userActions.reducer();

    expect(userActions.setName('1', 'jan')).toEqual({
      type: 'user/set-name',
      entityId: '1',
      payload: 'jan',
    });

    expect(reducer(state, userActions.setName('1', 'jan'))).toEqual({
      ids: ['1'],
      entities: {
        '1': { id: '1', name: 'jan' },
      },
    });
  });

  it('creates an action using the setEntitiesProperty helper', () => {
    class UserActions extends BaseUserActions {
      setAllNames = this.setEntitiesProperty('name');
    }

    const userActions = new UserActions();
    const reducer = userActions.reducer();

    expect(userActions.setAllNames('jan')).toEqual({
      type: 'user/set-all-name',
      payload: 'jan',
    });

    expect(reducer(state, userActions.setAllNames('jan'))).toEqual({
      ids: ['1'],
      entities: {
        '1': { id: '1', name: 'jan' },
      },
    });
  });

  it('creates an action on an extra property', () => {
    class UserActions extends EntityActions<User, { fetching: boolean }> {
      constructor() {
        super('user', { fetching: false });
      }

      setFetching = this.setProperty('fetching');
    }

    const userActions = new UserActions();
    const reducer = userActions.reducer();

    expect(userActions.setFetching(true)).toEqual({
      type: 'user/set-fetching',
      payload: true,
    });

    expect(reducer({ ...state, fetching: false }, userActions.setFetching(true))).toEqual({
      ...state,
      fetching: true,
    });
  });

  it('initial extra properties typings ', () => {
    class WithoutExtraProperties extends EntityActions<User> {
      constructor() {
        // @ts-expect-error unexpected initial properties
        super('user', { fetching: false });
      }
    }

    class WithExtraProperties extends EntityActions<User, { fetching: boolean }> {
      constructor() {
        // @ts-expect-error missing initial properties
        super('user');
      }
    }

    WithoutExtraProperties;
    WithExtraProperties;
  });

  it('dispatches and selects using a redux store', () => {
    class UserActions extends BaseUserActions {
      addUser = this.action('add-user', this.adapter.addOne);
      setName = this.setEntityProperty('name');
    }

    const userActions = new UserActions();

    const store = createTestStore(userActions.reducer());

    store.dispatch(userActions.addUser({ id: '1', name: 'tom' }));
    store.dispatch(userActions.setName('1', 'jan'));

    expect(store.getState()).toEqual({
      ids: ['1'],
      entities: {
        '1': { id: '1', name: 'jan' },
      },
    });
  });
});
