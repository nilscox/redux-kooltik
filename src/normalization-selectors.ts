import { denormalize, Schema } from 'normalizr';

export class NormalizationSelectors<RootState> {
  constructor(private readonly selectNormalizedEntities: (state: RootState) => unknown) {}

  createEntitySelector = <Entity>(schema: Schema) => {
    return (state: RootState, entityId: string): Entity => {
      return denormalize(entityId, schema, this.selectNormalizedEntities(state));
    };
  };

  createEntitiesSelector = <Entity>(schema: Schema) => {
    return (state: RootState, entityIds: string[]): Entity[] => {
      return denormalize(entityIds, [schema], this.selectNormalizedEntities(state));
    };
  };
}
