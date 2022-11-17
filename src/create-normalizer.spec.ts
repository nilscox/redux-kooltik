import expect from '@nilscox/expect';
import { schema } from 'normalizr';
import { AnyAction } from 'redux';

import { Normalized, getNormalizationContext, createNormalizer } from './create-normalizer';

describe('createNormalizer', () => {
  type User = { name: string; friends: User[] };
  type NormalizedUser = Normalized<User, 'friends'>;

  let userSchema: schema.Entity;

  let user: User;

  beforeEach(() => {
    userSchema = new schema.Entity('user', {}, { idAttribute: 'name' });
    userSchema.define({ friends: [userSchema] });

    user = { name: 'nils', friends: [{ name: 'mano', friends: [] }] };
  });

  const test = (params: {
    // eslint-disable-next-line @typescript-eslint/ban-types
    fn: Function;
    input: unknown;
    expectedResult: unknown;
    expectedContext: unknown;
  }) => {
    const { fn, input, expectedResult, expectedContext } = params;
    const ctx: AnyAction = { type: '' };

    expect(fn.call(ctx, input)).toEqual(expectedResult);
    expect<unknown>(getNormalizationContext(ctx)).toEqual(expectedContext);
  };

  it('creates a normalization function for a single entity', () => {
    test({
      fn: createNormalizer<User, NormalizedUser>('user', userSchema),
      input: user,
      expectedResult: {
        name: 'nils',
        friends: ['mano'],
      },
      expectedContext: {
        user: {
          mano: { name: 'mano', friends: [] },
          nils: { name: 'nils', friends: ['mano'] },
        },
      },
    });
  });

  it('creates a normalization function for an array of entities', () => {
    test({
      fn: createNormalizer.many<User, NormalizedUser>('user', userSchema),
      input: [user],
      expectedResult: [
        {
          name: 'nils',
          friends: ['mano'],
        },
      ],
      expectedContext: {
        user: {
          mano: { name: 'mano', friends: [] },
          nils: { name: 'nils', friends: ['mano'] },
        },
      },
    });
  });

  describe('polymorphic entities', () => {
    type Group = { type: 'group'; id: string };

    type Owner = User | Group;
    type NormalizedOwner = { id: string; schema: 'user' | 'group' };

    type Thing = { id: string; owner: Owner };
    type NormalizedThing = { id: '51'; owner: NormalizedOwner };

    let groupSchema: schema.Entity;
    let ownerSchema: schema.Union;
    let thingSchema: schema.Entity;

    let owner: Owner;
    let thing: Thing;

    beforeEach(() => {
      groupSchema = new schema.Entity('group');
      ownerSchema = new schema.Union({ user: userSchema, group: groupSchema }, 'type');
      thingSchema = new schema.Entity('thing', { owner: ownerSchema });

      owner = { type: 'group', id: '42' };
      thing = { id: '51', owner };
    });

    it('polymorphic entity', () => {
      test({
        fn: createNormalizer<Owner, NormalizedOwner>('owner', ownerSchema),
        input: owner,
        expectedResult: { id: '42', type: 'group' },
        expectedContext: { group: { '42': { id: '42', type: 'group' } } },
      });
    });

    it('array of polymorphic entities', () => {
      test({
        fn: createNormalizer.many<Owner, NormalizedOwner>('owner', ownerSchema),
        input: [owner],
        expectedResult: [{ id: '42', type: 'group' }],
        expectedContext: { group: { '42': { id: '42', type: 'group' } } },
      });
    });

    it('entity containing a polymorphic entity', () => {
      test({
        fn: createNormalizer<Thing, NormalizedThing>('thing', thingSchema),
        input: thing,
        expectedResult: { id: '51', owner: { id: '42', schema: 'group' } },
        expectedContext: {
          thing: { '51': { id: '51', owner: { id: '42', schema: 'group' } } },
          group: { '42': { id: '42', type: 'group' } },
        },
      });
    });

    it('array of entities containing a polymorphic entity', () => {
      test({
        fn: createNormalizer.many<Thing, NormalizedThing>('thing', thingSchema),
        input: [thing],
        expectedResult: [{ id: '51', owner: { id: '42', schema: 'group' } }],
        expectedContext: {
          thing: { '51': { id: '51', owner: { id: '42', schema: 'group' } } },
          group: { '42': { id: '42', type: 'group' } },
        },
      });
    });
  });
});
