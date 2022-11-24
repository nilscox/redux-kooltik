import { AnyAction, Middleware } from 'redux';

import { getNormalizationContext } from './create-normalizer';

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
