import expect from '@nilscox/expect';
import { combineReducers } from 'redux';

import { Actions } from './actions';
import { Selectors } from './selectors';
import { createTestStore } from './test-store';

type User = {
  name: string;
  age: number;
};

describe('Actions', () => {
  let actions: Actions<User>;
  let state: User;

  beforeEach(() => {
    actions = new Actions<User>('user', { name: '', age: 0 });
    state = { name: 'tom', age: 20 };
  });

  it('creates an action without payload', () => {
    const happyBirthday = actions.action('happy-birthday', (user: User) => {
      user.age++;
    });

    const reducer = actions.reducer();

    expect(happyBirthday()).toEqual({ type: 'user/happy-birthday' });
    expect(reducer(state, happyBirthday())).toEqual({ name: 'tom', age: 21 });
  });

  it('creates an action with a payload', () => {
    const getOld = actions.action('set-age', (user: User, years: number) => {
      user.age += years;
    });

    const reducer = actions.reducer();

    expect(getOld(2)).toEqual({ type: 'user/set-age', payload: 2 });
    expect(reducer(state, getOld(2))).toEqual({ name: 'tom', age: 22 });
  });

  it('creates an action using the propertyAction helper', () => {
    const setAge = actions.propertyAction('age', 'set-age', (_: number, age: number) => {
      if (age < 0) {
        return 0;
      }

      return age;
    });

    const reducer = actions.reducer();

    expect(setAge(22)).toEqual({ type: 'user/set-age', payload: 22 });
    expect(reducer(state, setAge(22))).toEqual({ name: 'tom', age: 22 });

    expect(setAge(-1)).toEqual({ type: 'user/set-age', payload: -1 });
    expect(reducer(state, setAge(-1))).toEqual({ name: 'tom', age: 0 });
  });

  it('creates an action using the setProperty helper', () => {
    const setAge = actions.setProperty('age');

    const reducer = actions.reducer();

    expect(setAge(22)).toEqual({ type: 'user/set-age', payload: 22 });
    expect(reducer(state, setAge(22))).toEqual({ name: 'tom', age: 22 });
  });

  it('creates an action with a transformer', () => {
    const setNameUppercase = actions.action(
      'set-name-uppercase',
      (name: string) => name.toUpperCase(),
      (user: User, name) => {
        user.name = name;
      }
    );

    const reducer = actions.reducer();

    expect(setNameUppercase('jan')).toEqual({ type: 'user/set-name-uppercase', payload: 'JAN' });
    expect(reducer(state, setNameUppercase('jan'))).toEqual({ name: 'JAN', age: 20 });
  });

  it('attaches extra data to the action using the transformer context', () => {
    type Extra = { extra: number };

    const transform = function (this: Extra, ageStr: string) {
      this.extra = Number(ageStr);
      return this.extra + 1;
    };

    const test = actions.action('test', transform, (state, age: number) => {
      state.age = age;
    });

    expect(test('1')).toEqual({
      type: 'user/test',
      extra: 1,
      payload: 2,
    });
  });

  it('throws when the actions already has an action of a given type', () => {
    actions.action('set-name', () => {});

    expect(() => actions.action('set-name', () => {})).toThrow(
      new Error('action "user/set-name" already exists')
    );
  });

  it('dispatches and selects using a redux store', () => {
    const setName = actions.setProperty('name');
    const setAge = actions.setProperty('age');

    class UserSelectors extends Selectors<State, User> {
      constructor() {
        super((state: State) => state.user);
      }

      selectName = this.property('name');
      selectAge = this.property('age');
    }

    const userSelectors = new UserSelectors();

    const store = createTestStore(
      combineReducers({
        user: actions.reducer(),
      })
    );

    type State = ReturnType<typeof store.getState>;

    store.dispatch(setName('tom'));
    expect(store.select(userSelectors.selectName)).toEqual('tom');

    store.dispatch(setAge(22));
    expect(store.select(userSelectors.selectAge)).toEqual(22);
  });

  it('subscribes to an action', () => {
    const happyBirthday = actions.action('happy-birthday', (user: User) => {
      user.age++;
    });

    const setAge = actions.setProperty('age');

    actions.subscribe(happyBirthday, (user: User) => {
      user.name = user.name + ` (${user.age})`;
    });

    actions.subscribe(setAge, (user: User, age: number) => {
      user.name = user.name + ` (${age})`;
    });

    const reducer = actions.reducer();

    expect(reducer(state, happyBirthday)).toEqual({ name: 'tom (21)', age: 21 });
    expect(reducer(state, setAge(22))).toEqual({ name: 'tom (22)', age: 22 });
  });

  it('throws when the actions already has a subscription of a given type', () => {
    const setName = actions.setProperty('name');

    actions.subscribe(setName, () => {});

    expect(() => actions.subscribe(setName, () => {})).toThrow(
      new Error('subscription to "user/set-name" already exists in actions "user"')
    );
  });
});
