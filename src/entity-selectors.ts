import { Selector } from './actions';
import { EntitiesState } from './entity-adapter';
import { createSafeSelector } from './safe-selector';
import { Selectors } from './selectors';

export class EntitySelectors<RootState, Entity, ExtraProperties = unknown> extends Selectors<
  RootState,
  EntitiesState<Entity, ExtraProperties>
> {
  constructor(
    protected readonly name: string,
    protected readonly selectState: Selector<RootState, [], EntitiesState<Entity, ExtraProperties>>
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
    return createSafeSelector<[RootState, string], Entity[Property]>(
      (state, entityId) => {
        if (this.selectState(state).entities[entityId]) {
          return new Error(`${this.name} with id "${entityId}" does not have property "${String(property)}"`);
        } else {
          return new Error(`${this.name} with id "${entityId}" does not exist`);
        }
      },
      (state, entityId) => this.selectState(state).entities[entityId]?.[property]
    );
  }
}
