import { Selector } from './actions';
import { EntitiesState } from './entity-adapter';
import { Selectors } from './selectors';

interface SafeEntitySelector<RootState, Entity> {
  (state: RootState, entityId: string): Entity;
  unsafe(state: RootState, entityId: string): Entity | undefined;
}

interface SafeEntityPropertySelector<RootState, Entity, Property extends keyof Entity> {
  (state: RootState, entityId: string): Entity[Property];
  unsafe(state: RootState, entityId: string): Entity[Property] | undefined;
}

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
    const selector: SafeEntitySelector<RootState, Entity> = (state, entityId) => {
      const entity = this.selectState(state).entities[entityId];

      if (!entity) {
        throw new Error(`${this.name} with id "${entityId}" does not exist`);
      }

      return entity;
    };

    selector.unsafe = (state: RootState, entityId: string) => {
      return this.selectState(state).entities[entityId];
    };

    return selector;
  }

  entityPropertySelector<Property extends keyof Entity>(property: Property) {
    const selector: SafeEntityPropertySelector<RootState, Entity, Property> = (state, entityId) => {
      const entity = this.selectState(state).entities[entityId];

      if (!entity) {
        throw new Error(
          `${this.name} with id "${entityId}" does not exist (selecting property "${String(property)}")`
        );
      }

      return entity[property];
    };

    selector.unsafe = (state: RootState, entityId: string) => {
      return this.selectState(state).entities[entityId]?.[property];
    };

    return selector;
  }
}
