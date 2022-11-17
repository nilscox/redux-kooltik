import { normalize, Schema } from 'normalizr';
import { AnyAction } from 'redux';

import { Action, PayloadAction } from './actions';

export type Normalized<T, K extends keyof T = never> = Omit<T, K> & {
  [Key in K]: T[Key] extends unknown[] | undefined ? string[] : string;
};

const normalizedSymbol = Symbol('normalized');

type NormalizationContext = {
  [normalizedSymbol]: Record<string, unknown>;
};

export const createNormalizer = <Entity, NormalizedEntity>(name: string, schema: Schema) => {
  return function (this: NormalizationContext, entity: Entity) {
    const { entities, result } = normalize(entity, schema);

    this[normalizedSymbol] = entities;

    const getNormalizedResult = (result: string | { schema: string; id: string }) => {
      if (typeof result === 'string') {
        return entities[name]?.[result];
      }

      return entities[result.schema]?.[result.id];
    };

    if (Array.isArray(result)) {
      return result.map(getNormalizedResult) as NormalizedEntity;
    }

    return getNormalizedResult(result);
  };
};

createNormalizer.many = <Entity, NormalizedEntity>(name: string, schema: Schema) => {
  return createNormalizer<Entity[], NormalizedEntity[]>(name, [schema]);
};

const isNormalizedAction = (
  action: Action
): action is PayloadAction<unknown, { [normalizedSymbol]: Record<string, unknown> }> => {
  return typeof action === 'object' && action !== null && normalizedSymbol in action;
};

export const getNormalizationContext = (action: AnyAction) => {
  if (isNormalizedAction(action)) {
    return action[normalizedSymbol];
  }
};
