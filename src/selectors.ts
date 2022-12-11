import { Selector } from './actions';

export class Selectors<RootState, State> {
  constructor(protected readonly selectState: Selector<RootState, [], State>) {}

  selector<Params extends unknown[], Result>(selector: Selector<State, Params, Result>) {
    return (state: RootState, ...params: Params): Result => {
      return selector(this.selectState(state), ...params);
    };
  }

  state() {
    return this.selector((state) => state);
  }

  property<Property extends keyof State>(property: Property) {
    return this.selector((state) => state[property]);
  }
}
