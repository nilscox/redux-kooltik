import { Selector } from './actions';
import { EntitiesState } from './entity-adapter';
import { Selectors } from './selectors';

export interface SafeSelector<Params extends unknown[], Result> {
  (...params: Params): Result;
  unsafe(...params: Params): Result | undefined;
}

export const createSafeSelector = <Params extends unknown[], Result>(
  getError: (...params: Params) => Error,
  unsafe: SafeSelector<Params, Result>['unsafe']
) => {
  const selector: SafeSelector<Params, Result> = (...params) => {
    const value = unsafe(...params);

    if (!value) {
      throw getError(...params);
    }

    return value;
  };

  selector.unsafe = unsafe;

  return selector;
};

export class EntitySelectors<RootState, Entity> extends Selectors<RootState, EntitiesState<Entity>> {
  constructor(
    protected readonly name: string,
    protected readonly selectState: Selector<RootState, [], EntitiesState<Entity>>
  ) {
    super(selectState);
  }

  entitiesSelector() {
    return this.createSelector((state) => state.entities);
  }

  idsSelector() {
    return this.createSelector((state) => state.ids);
  }

  entitySelector() {
    return createSafeSelector<[RootState, string], Entity>(
      (state, entityId) => new Error(`${this.name} with id "${entityId}" does not exist`),
      (state, entityId) => this.selectState(state).entities[entityId]
    );
  }

  entityPropertySelector<Property extends keyof Entity>(property: Property) {
    const message = (entityId: string) => {
      return `${this.name} with id "${entityId}" does not exist (selecting property "${String(property)}")`;
    };

    return createSafeSelector<[RootState, string], Entity[Property]>(
      (state, entityId) => new Error(message(entityId)),
      (state, entityId) => this.selectState(state).entities[entityId]?.[property]
    );
  }
}
