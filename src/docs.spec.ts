import expect from '@nilscox/expect';
import { combineReducers, legacy_createStore as createStore } from 'redux';

import { Actions } from './actions';
import { Selectors } from './selectors';

it('readme example', () => {
  type User = {
    name: string;
    age: number;
  };

  const actions = new Actions<User>('user', {
    name: 'tom',
    age: 20,
  });

  const setName = actions.setProperty('name');

  setName('jan');
  // { type: 'user/set-name', payload: 'jan' }

  const setAge = actions.action('set-age', (user: User, age: number) => {
    if (age < 0) {
      user.age = 0;
    } else {
      user.age = age;
    }
  });

  const selectors = new Selectors<AppState, User>((state) => state.user);

  const selectName = selectors.property('name');
  const selectIsOld = selectors.selector((user) => user.age > 42);

  const store = createStore(
    combineReducers({
      user: actions.reducer(),
    })
  );

  type AppState = ReturnType<typeof store.getState>;

  expect(selectName(store.getState())).toEqual('tom');
  // tom

  store.dispatch(setName('jan'));
  store.dispatch(setAge(-10));

  expect(store.getState()).toEqual({ user: { name: 'jan', age: 0 } });
  // { user: { name: 'jan', age: 0 } }

  store.dispatch(setAge(51));
  expect(selectIsOld(store.getState())).toBe(true);
  // true
});
