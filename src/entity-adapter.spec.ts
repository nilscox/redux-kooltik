import expect from '@nilscox/expect';

import { EntitiesState, EntityAdapter } from './entity-adapter';

type User = {
  id: string;
  name: string;
};

const tom: User = { id: '1', name: 'tom' };
const jeanne: User = { id: '2', name: 'jeanne' };

describe('EntityAdapter', () => {
  let userEntityAdapter: EntityAdapter<User>;
  let state: EntitiesState<User>;

  beforeEach(() => {
    userEntityAdapter = new EntityAdapter((user: User) => user.id);
    state = EntityAdapter.initialState<User>();
  });

  it('sets a single entity', () => {
    userEntityAdapter.setOne(state, tom);

    expect(state).toEqual({
      entities: { '1': tom },
      ids: [],
    });
  });

  it('adds a single entity', () => {
    userEntityAdapter.addOne(state, tom);

    expect(state).toEqual({
      entities: { '1': tom },
      ids: ['1'],
    });
  });

  it('replaces a single entity', () => {
    userEntityAdapter.addOne(state, tom);
    userEntityAdapter.setOne(state, { ...jeanne, id: '1' });

    expect(state).toEqual({
      entities: { '1': { ...jeanne, id: '1' } },
      ids: ['1'],
    });
  });

  it('sets many entities', () => {
    userEntityAdapter.setMany(state, [tom, jeanne]);

    expect(state).toEqual({
      entities: { '1': tom, '2': jeanne },
      ids: [],
    });
  });

  it('adds many entities', () => {
    userEntityAdapter.addMany(state, [tom, jeanne]);

    expect(state).toEqual({
      entities: { '1': tom, '2': jeanne },
      ids: ['1', '2'],
    });
  });

  it('retrieves a single entity from its id', () => {
    const state = {
      entities: { '1': tom },
      ids: [],
    };

    expect(userEntityAdapter.selectOne(state, '1')).toEqual(tom);
  });

  it('returns undefined when the entity does not exist', () => {
    const state = {
      entities: {},
      ids: [],
    };

    expect(userEntityAdapter.selectOne(state, '1')).toBe(undefined);
  });

  it('selects many entities', () => {
    const state = {
      entities: { '1': tom, '2': jeanne },
      ids: [],
    };

    expect(userEntityAdapter.selectMany(state, ['1', '2'])).toEqual([tom, jeanne]);
  });

  it('returns undefined when some of the entities does not exist', () => {
    const state = {
      entities: { '1': tom },
      ids: [],
    };

    expect(userEntityAdapter.selectMany(state, ['1', '2'])).toEqual([tom]);
  });
});
