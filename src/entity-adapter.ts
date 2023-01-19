export type Entities<Entity> = {
  entities: Record<string, Entity>;
};

export class EntityAdapter<Entity> {
  constructor(private readonly selectId: (entity: Entity) => string) {}

  setOne = (state: Entities<Entity>, entity: Entity) => {
    state.entities[this.selectId(entity)] = entity;
  };

  setMany = (state: Entities<Entity>, entities: Entity[]) => {
    entities.forEach((entity) => this.setOne(state, entity));
  };

  selectOne = (entities: Entities<Entity>, entityId: string): Entity | undefined => {
    return entities.entities[entityId];
  };

  selectMany = (state: Entities<Entity>, entityIds: string[]): Entity[] => {
    return entityIds
      .map((entityId) => this.selectOne(state, entityId))
      .filter((entity): entity is Entity => Boolean(entity));
  };
}
