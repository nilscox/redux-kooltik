import { Middleware } from 'redux';
import { Selector } from 'tmp';

import { AppState, AppStore, createStore } from './store';

export interface TestStore extends AppStore {
  select<Params extends unknown[], Result>(
    selector: Selector<AppState, Params, Result>,
    ...params: Params
  ): Result;
  logActions(log?: boolean): void;
  logState(): void;
}

export const createTestStore = () => {
  let logActions = false;

  const logActionsMiddleware: Middleware = () => (next) => (action) => {
    if (logActions) {
      console.dir(action, { depth: null });
    }

    return next(action);
  };

  const store = createStore(undefined, [logActionsMiddleware]) as TestStore;

  store.select = (selector, ...params) => {
    return selector(store.getState(), ...params);
  };

  store.logActions = (log = true) => {
    logActions = log;
  };

  store.logState = () => {
    console.dir(store.getState(), { depth: null });
  };

  return store;
};
