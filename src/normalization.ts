import { denormalize, Schema } from 'normalizr';
import { AnyAction, Middleware } from 'redux';

import { getNormalizationContext } from './create-normalizer';
import { EntitySelectors } from './entity-selectors';

interface SetEntities<NormalizedEntity> {
  (entities: NormalizedEntity[]): AnyAction;
}

export const createNormalizationMiddleware = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setEntitiesActions: Record<string, SetEntities<any>>
): Middleware => {
  return (store) => (next) => (action) => {
    const normalized = getNormalizationContext(action);

    if (!normalized) {
      return next(action);
    }

    for (const [name, entities] of Object.entries(normalized)) {
      const action = setEntitiesActions[name];

      if (action && entities) {
        store.dispatch(action(Object.values(entities)));
      }
    }

    return next(action);
  };
};

export const createNormalizedEntitySelectors = <RootState, NormalizedState>(
  selectNormalizedEntities: (state: RootState) => NormalizedState
) => {
  abstract class NormalizedEntitySelectors<Entity, NormalizedEntity> extends EntitySelectors<
    RootState,
    NormalizedEntity
  > {
    protected abstract readonly schema: Schema;

    protected selectEntity = (state: RootState, entityId: string): Entity => {
      return denormalize(entityId, this.schema, selectNormalizedEntities(state));
    };

    protected selectEntities = (state: RootState, entityIds: string[]): Entity[] => {
      return denormalize(entityIds, [this.schema], selectNormalizedEntities(state));
    };
  }

  return NormalizedEntitySelectors;
};
