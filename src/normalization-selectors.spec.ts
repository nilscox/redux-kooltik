import expect from '@nilscox/expect';
import { schema } from 'normalizr';

import { Normalized } from './create-normalizer';
import { NormalizationSelectors } from './normalization-selectors';

describe('NormalizationSelectors', () => {
  type User = { id: string; friends: User[] };
  type NormalizedUser = Normalized<User, 'friends'>;

  const userSchema = new schema.Entity('user');
  userSchema.define({ friends: [userSchema] });

  type State = {
    entities: {
      user: Record<string, NormalizedUser>;
    };
  };

  let state: State;
  let normalizationSelectors: NormalizationSelectors<State>;

  beforeEach(() => {
    normalizationSelectors = new NormalizationSelectors((state) => state.entities);

    state = {
      entities: {
        user: {
          '1': { id: '1', friends: ['2'] },
          '2': { id: '2', friends: [] },
        },
      },
    };
  });

  it('creates a selector performing entity denormalization', () => {
    const selectUser = normalizationSelectors.createEntitySelector<User>(userSchema);

    expect(selectUser(state, '1')).toEqual({
      id: '1',
      friends: [{ id: '2', friends: [] }],
    });
  });

  it('creates a selector performing entities denormalization', () => {
    const selectUser = normalizationSelectors.createEntitiesSelector<User>(userSchema);

    expect(selectUser(state, ['1', '2'])).toEqual([
      { id: '1', friends: [{ id: '2', friends: [] }] },
      { id: '2', friends: [] },
    ]);
  });
});
