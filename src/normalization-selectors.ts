import { denormalize, Schema } from 'normalizr';

import { createSafeSelector } from './safe-selector';

export class NormalizationSelectors<RootState> {
  constructor(private readonly selectNormalizedEntities: (state: RootState) => unknown) {}

  createEntitySelector<Entity>(name: string, schema: Schema) {
    return createSafeSelector(
      (state: RootState, entityId: string) => new Error(`${name} with id "${entityId}" does not exist`),
      (state: RootState, entityId: string): Entity => {
        return denormalize(entityId, schema, this.selectNormalizedEntities(state));
      }
    );
  }

  createEntitiesSelector = <Entity>(schema: Schema) => {
    return (state: RootState, entityIds: string[]): Entity[] => {
      return denormalize(entityIds, [schema], this.selectNormalizedEntities(state));
    };
  };
}
