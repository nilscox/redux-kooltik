import expect from '@nilscox/expect';

import { EntitiesState, EntityActions } from './entity-actions';
import { EntityAdapter } from './entity-adapter';
import { createTestStore } from './test-store';

type User = {
  id: string;
  name: string;
};

const users = (users: User[]): EntitiesState<User> => {
  return {
    entities: users.reduce((obj, user) => ({ ...obj, [user.id]: user }), {}),
  };
};

describe('EntityActions', () => {
  let actions: EntityActions<User>;

  const state = users([{ id: '1', name: 'tom' }]);

  beforeEach(() => {
    actions = new EntityActions<User>('user');
  });

  it('creates an action targeting a specific entity', () => {
    const setName = actions.entityAction('set-name', (user: User, name: string) => {
      user.name = name;
    });

    const reducer = actions.reducer();

    expect(setName('1', 'jan')).toEqual({
      type: 'user/set-name',
      entityId: '1',
      payload: 'jan',
    });

    expect(reducer(state, setName('1', 'jan'))).toEqual(users([{ id: '1', name: 'jan' }]));
  });

  it('creates an action using the setEntityProperty helper', () => {
    const setName = actions.setEntityProperty('name');
    const reducer = actions.reducer();

    expect(setName('1', 'jan')).toEqual({
      type: 'user/set-name',
      entityId: '1',
      payload: 'jan',
    });

    expect(reducer(state, setName('1', 'jan'))).toEqual(users([{ id: '1', name: 'jan' }]));
  });

  it('creates an action using the setEntitiesProperty helper', () => {
    const setAllNames = actions.setEntitiesProperty('name');
    const reducer = actions.reducer();

    expect(setAllNames('jan')).toEqual({
      type: 'user/set-all-name',
      payload: 'jan',
    });

    expect(reducer(state, setAllNames('jan'))).toEqual(users([{ id: '1', name: 'jan' }]));
  });

  it('creates an action on an extra property', () => {
    const actions = new EntityActions<User, { fetching: boolean }>('user', { fetching: false });
    const setFetching = actions.setProperty('fetching');
    const reducer = actions.reducer();

    expect(setFetching(true)).toEqual({
      type: 'user/set-fetching',
      payload: true,
    });

    expect(reducer({ ...state, fetching: false }, setFetching(true))).toEqual({
      ...state,
      fetching: true,
    });
  });

  it('initial extra properties typings ', () => {
    // @ts-expect-error unexpected initial properties
    new EntityActions<User>('user', { fetching: false });

    // @ts-expect-error missing initial properties
    new EntityActions<User, { fetching: boolean }>('user');
  });

  it('dispatches and selects using a redux store', () => {
    const adapter = new EntityAdapter<User>((user) => user.id);

    const setUser = actions.action('add-user', adapter.setOne);
    const setName = actions.setEntityProperty('name');

    const store = createTestStore(actions.reducer());

    store.dispatch(setUser({ id: '1', name: 'tom' }));
    store.dispatch(setName('1', 'jan'));

    expect(store.getState()).toEqual(users([{ id: '1', name: 'jan' }]));
  });
});
