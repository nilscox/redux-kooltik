import expect from '@nilscox/expect';

import { Entities, EntityAdapter } from './entity-adapter';

type User = {
  id: string;
  name: string;
};

const tom: User = { id: '1', name: 'tom' };
const jeanne: User = { id: '2', name: 'jeanne' };

describe('EntityAdapter', () => {
  let userEntityAdapter: EntityAdapter<User>;
  let state: Entities<User>;

  beforeEach(() => {
    userEntityAdapter = new EntityAdapter((user: User) => user.id);
    state = { entities: {} };
  });

  it('sets a single entity', () => {
    userEntityAdapter.setOne(state, tom);

    expect(state.entities).toEqual({ '1': tom });
  });

  it('replaces a single entity', () => {
    userEntityAdapter.setOne(state, tom);
    userEntityAdapter.setOne(state, { ...jeanne, id: '1' });

    expect(state.entities).toEqual({ '1': { ...jeanne, id: '1' } });
  });

  it('sets many entities', () => {
    userEntityAdapter.setMany(state, [tom, jeanne]);

    expect(state.entities).toEqual({ '1': tom, '2': jeanne });
  });

  it('retrieves a single entity from its id', () => {
    const state = {
      entities: { '1': tom },
    };

    expect(userEntityAdapter.selectOne(state, '1')).toEqual(tom);
  });

  it('returns undefined when the entity does not exist', () => {
    const state = {
      entities: {},
    };

    expect(userEntityAdapter.selectOne(state, '1')).toBe(undefined);
  });

  it('selects many entities', () => {
    const state = {
      entities: { '1': tom, '2': jeanne },
    };

    expect(userEntityAdapter.selectMany(state, ['1', '2'])).toEqual([tom, jeanne]);
  });

  it('excludes unexisting entities when selecting many entities', () => {
    const state = {
      entities: { '1': tom },
    };

    expect(userEntityAdapter.selectMany(state, ['1', '2'])).toEqual([tom]);
  });
});
