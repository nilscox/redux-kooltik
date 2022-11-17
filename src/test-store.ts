import {
  applyMiddleware,
  legacy_createStore as createStore,
  Middleware,
  PreloadedState,
  Reducer,
  Store,
} from 'redux';

import { Selector } from './actions';

export interface TestStore<State> extends Store<State> {
  select<Params extends unknown[], Result>(
    selector: Selector<State, Params, Result>,
    ...params: Params
  ): Result;
  logActions(log?: boolean): void;
  logState(): void;
}

export const createTestStore = <State>(
  rootReducer: Reducer<State>,
  preloadedState?: PreloadedState<State>,
  middlewares?: Middleware[]
) => {
  let logActions = false;

  const logActionsMiddleware: Middleware = () => (next) => (action) => {
    if (logActions) {
      console.dir(action, { depth: null });
    }

    return next(action);
  };

  const store = createStore(
    rootReducer,
    preloadedState,
    applyMiddleware(...(middlewares ?? []), logActionsMiddleware)
  ) as TestStore<State>;

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
