export type EntitiesState<Entity> = {
  ids: string[];
  entities: Record<string, Entity | undefined>;
};

export class EntityAdapter<Entity> {
  constructor(private readonly selectId: (entity: Entity) => string) {}

  static initialState<Entity>(): EntitiesState<Entity> {
    return {
      entities: {},
      ids: [],
    };
  }

  addId = (state: EntitiesState<Entity>, entity: Entity) => {
    const id = this.selectId(entity);

    if (!state.ids.includes(id)) {
      state.ids.push(id);
    }
  };

  addIds = (state: EntitiesState<Entity>, entities: Entity[]) => {
    entities.forEach((entity) => this.addId(state, entity));
  };

  setOne = (state: EntitiesState<Entity>, entity: Entity) => {
    const id = this.selectId(entity);

    state.entities[id] = entity;
  };

  addOne = (state: EntitiesState<Entity>, entity: Entity) => {
    this.setOne(state, entity);
    this.addId(state, entity);
  };

  setMany = (state: EntitiesState<Entity>, entities: Entity[]) => {
    entities.forEach((entity) => this.setOne(state, entity));
  };

  addMany = (state: EntitiesState<Entity>, entities: Entity[]) => {
    this.setMany(state, entities);
    this.addIds(state, entities);
  };

  selectOne = ({ entities }: EntitiesState<Entity>, entityId: string) => {
    return entities[entityId];
  };

  selectMany = (state: EntitiesState<Entity>, entityIds: string[]) => {
    return entityIds.map((entityId) => this.selectOne(state, entityId));
  };
}
