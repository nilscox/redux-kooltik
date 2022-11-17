import { Selector } from './actions';

export class Selectors<RootState, State> {
  constructor(protected readonly selectState: Selector<RootState, [], State>) {}

  protected createSelector<Params extends unknown[], Result>(selector: Selector<State, Params, Result>) {
    return (state: RootState, ...params: Params): Result => {
      return selector(this.selectState(state), ...params);
    };
  }

  protected stateSelector() {
    return this.createSelector((state) => state);
  }

  protected propertySelector<Property extends keyof State>(property: Property) {
    return this.createSelector((state) => state[property]);
  }
}
