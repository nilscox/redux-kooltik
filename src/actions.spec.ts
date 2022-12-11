import expect from '@nilscox/expect';
import { combineReducers } from 'redux';

import { Actions } from './actions';
import { Selectors } from './selectors';
import { createTestStore } from './test-store';

type User = {
  name: string;
  age: number;
};

class BaseUserActions extends Actions<User> {
  constructor() {
    super('user', { name: '', age: 0 });
  }
}

describe('Actions', () => {
  let state: User;

  beforeEach(() => {
    state = { name: 'tom', age: 20 };
  });

  it('creates an action without payload', () => {
    class UserActions extends BaseUserActions {
      happyBirthday = this.action('happy-birthday', (user: User) => {
        user.age++;
      });
    }

    const userActions = new UserActions();
    const reducer = userActions.reducer();

    expect(userActions.happyBirthday()).toEqual({ type: 'user/happy-birthday' });
    expect(reducer(state, userActions.happyBirthday())).toEqual({ name: 'tom', age: 21 });
  });

  it('creates an action with a payload', () => {
    class UserActions extends BaseUserActions {
      getOld = this.action('set-age', (user: User, years: number) => {
        user.age += years;
      });
    }

    const userActions = new UserActions();
    const reducer = userActions.reducer();

    expect(userActions.getOld(2)).toEqual({ type: 'user/set-age', payload: 2 });
    expect(reducer(state, userActions.getOld(2))).toEqual({ name: 'tom', age: 22 });
  });

  it('creates an action using the propertyAction helper', () => {
    class UserActions extends BaseUserActions {
      setAge = this.propertyAction('age', 'set-age', (_: number, age: number) => {
        if (age < 0) {
          return 0;
        }

        return age;
      });
    }

    const userActions = new UserActions();
    const reducer = userActions.reducer();

    expect(userActions.setAge(22)).toEqual({ type: 'user/set-age', payload: 22 });
    expect(reducer(state, userActions.setAge(22))).toEqual({ name: 'tom', age: 22 });

    expect(userActions.setAge(-1)).toEqual({ type: 'user/set-age', payload: -1 });
    expect(reducer(state, userActions.setAge(-1))).toEqual({ name: 'tom', age: 0 });
  });

  it('creates an action using the setProperty helper', () => {
    class UserActions extends BaseUserActions {
      setAge = this.setProperty('age');
    }

    const userActions = new UserActions();
    const reducer = userActions.reducer();

    expect(userActions.setAge(22)).toEqual({ type: 'user/set-age', payload: 22 });
    expect(reducer(state, userActions.setAge(22))).toEqual({ name: 'tom', age: 22 });
  });

  it('creates an action with a transformer', () => {
    class UserActions extends BaseUserActions {
      setNameUppercase = this.action(
        'set-name-uppercase',
        (name: string) => name.toUpperCase(),
        (user: User, name) => {
          user.name = name;
        }
      );
    }

    const userActions = new UserActions();
    const reducer = userActions.reducer();

    expect(userActions.setNameUppercase('jan')).toEqual({ type: 'user/set-name-uppercase', payload: 'JAN' });
    expect(reducer(state, userActions.setNameUppercase('jan'))).toEqual({ name: 'JAN', age: 20 });
  });

  it('attaches extra data to the action using the transformer context', () => {
    type Extra = { extra: number };

    const transform = function (this: Extra, ageStr: string) {
      this.extra = Number(ageStr);
      return this.extra + 1;
    };

    class UserActions extends BaseUserActions {
      test = this.action('test', transform, (state, age: number) => {
        state.age = age;
      });
    }

    const userActions = new UserActions();

    expect(userActions.test('1')).toEqual({
      type: 'user/test',
      extra: 1,
      payload: 2,
    });
  });

  it('throws when the actions already has an action of a given type', () => {
    class UserActions extends BaseUserActions {
      setName = this.action('set-name', () => {});
      setNameAgain = this.action('set-name', () => {});
    }

    expect(() => new UserActions()).toThrow(new Error('action "user/set-name" already exists'));
  });

  it('dispatches and selects using a redux store', () => {
    class UserActions extends BaseUserActions {
      setName = this.setProperty('name');
      setAge = this.setProperty('age');
    }

    class UserSelectors extends Selectors<State, User> {
      constructor() {
        super((state: State) => state.user);
      }

      selectName = this.propertySelector('name');
      selectAge = this.propertySelector('age');
    }

    const userActions = new UserActions();
    const userSelectors = new UserSelectors();

    const store = createTestStore(
      combineReducers({
        user: userActions.reducer(),
      })
    );

    type State = ReturnType<typeof store.getState>;

    store.dispatch(userActions.setName('tom'));
    expect(store.select(userSelectors.selectName)).toEqual('tom');

    store.dispatch(userActions.setAge(22));
    expect(store.select(userSelectors.selectAge)).toEqual(22);
  });

  it('subscribes to an action', () => {
    class UserActions extends BaseUserActions {
      constructor() {
        super();

        this.subscribe(this.happyBirthday, (user: User) => {
          user.name = user.name + ` (${user.age})`;
        });

        this.subscribe(this.setAge, (user: User, age: number) => {
          user.name = user.name + ` (${age})`;
        });
      }

      happyBirthday = this.action('happy-birthday', (user: User) => {
        user.age++;
      });

      setAge = this.setProperty('age');
    }

    const userActions = new UserActions();
    const reducer = userActions.reducer();

    expect(reducer(state, userActions.happyBirthday)).toEqual({ name: 'tom (21)', age: 21 });
    expect(reducer(state, userActions.setAge(22))).toEqual({ name: 'tom (22)', age: 22 });
  });

  it('throws when the actions already has a subscription of a given type', () => {
    class UserActions extends BaseUserActions {
      constructor() {
        super();

        this.subscribe(this.setName, () => {});
        this.subscribe(this.setName, () => {});
      }

      setName = this.setProperty('name');
    }

    expect(() => new UserActions()).toThrow(
      new Error('subscription to "user/set-name" already exists in actions "user"')
    );
  });
});
