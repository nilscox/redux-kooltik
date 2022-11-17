import expect from '@nilscox/expect';
import { combineReducers } from 'redux';

import { Actions } from './actions';
import { Selectors } from './selectors';
import { createTestStore } from './test-store';

type User = {
  name: string;
  age: number;
};

type State = {
  user: User;
};

class UserActions extends Actions<User> {
  constructor() {
    super('user', { name: '', age: 0 });
  }

  setName = this.action('set-name', (user, name: string) => {
    user.name = name;
  });

  setAge = this.createSetter('age');

  setNameUppercase = this.action(
    'set-name-uppercase',
    (name: string) => name.toUpperCase(),
    (user, name) => {
      user.name = name;
    }
  );

  selectors = new UserSelectors();
}

class UserSelectors extends Selectors<State, User> {
  constructor() {
    super((state: State) => state.user);
  }

  selectName = this.propertySelector('name');
  selectAge = this.propertySelector('age');
}

describe('Actions', () => {
  let userActions: UserActions;
  let userSelectors: UserSelectors;

  beforeEach(() => {
    userActions = new UserActions();
    userSelectors = new UserSelectors();
  });

  it('creates an action', () => {
    expect(userActions.setName('tom')).toEqual({ type: 'user/set-name', payload: 'tom' });
  });

  it('creates an action using the setProperty helper', () => {
    expect(userActions.setAge(22)).toEqual({ type: 'user/set-age', payload: 22 });
  });

  it("transforms an action's payload", () => {
    expect(userActions.setNameUppercase('tom')).toEqual({ type: 'user/set-name-uppercase', payload: 'TOM' });
  });

  it('attaches extra data to the action using the transformer context', () => {
    type Extra = { extra: number };

    const transform = function (this: Extra, ageStr: string) {
      this.extra = Number(ageStr);
      return this.extra + 1;
    };

    class Test extends UserActions {
      test = this.action('test', transform, (state, age: number) => {
        state.age = age;
      });
    }

    const testActions = new Test();

    expect(testActions.test('1')).toEqual({
      type: 'user/test',
      extra: 1,
      payload: 2,
    });
  });

  it('throws when the actions already has an action of a given type', () => {
    class TestActions extends UserActions {
      setNameAgain = this.action('set-name', () => {});
    }

    expect(() => new TestActions()).toThrow(new Error('action "user/set-name" already exists'));
  });

  it('dispatches and selects using a redux store', () => {
    const store = createTestStore(
      combineReducers({
        user: userActions.reducer(),
      })
    );

    store.dispatch(userActions.setName('tom'));
    expect(store.select(userSelectors.selectName)).toEqual('tom');

    store.dispatch(userActions.setAge(22));
    expect(store.select(userSelectors.selectAge)).toEqual(22);
  });

  it('allows a actions to subscribes to an action', () => {
    class TestSelectors extends Selectors<State, number> {
      constructor() {
        super((state: State) => state.test);
      }

      selectValue = this.stateSelector();
    }

    class TestActions extends Actions<number> {
      constructor() {
        super('test', 0);

        this.subscribe(userActions.setAge, (value, age) => {
          return value + age;
        });
      }

      setValue = this.setState();
    }

    const testActions = new TestActions();
    const testSelectors = new TestSelectors();

    const store = createTestStore(
      combineReducers({
        user: userActions.reducer(),
        test: testActions.reducer(),
      })
    );

    type State = ReturnType<typeof store.getState>;

    store.dispatch(testActions.setValue(2));
    store.dispatch(userActions.setAge(22));
    expect(store.select(testSelectors.selectValue)).toEqual(24);
  });

  it('throws when the actions already has a subscription of a given type', () => {
    class TestActions extends UserActions {
      constructor() {
        super();

        this.subscribe(this.setName, () => {});
        this.subscribe(this.setName, () => {});
      }
    }

    expect(() => new TestActions()).toThrow(
      new Error('subscription to "user/set-name" already exists in actions "user"')
    );
  });
});
