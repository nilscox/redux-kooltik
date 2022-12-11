This package is a set of helpers to reduce redux's boilerplate and help create action creators and selectors.
It also helps to work with normalized data in a convinrent way. Take a look at [the demo folder](./demo) for
an example of how it can be used, or browse through the [api reference](./api).

Quick example:

```ts
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

selectName(store.getState());
// tom

store.dispatch(setName('jan'));
store.dispatch(setAge(-10));

store.getState();
// { user: { name: 'jan', age: 0 } }

store.dispatch(setAge(51));
selectIsOld(store.getState());
// true
```
