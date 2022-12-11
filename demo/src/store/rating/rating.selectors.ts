import { createSelector } from 'reselect';
import { EntitySelectors } from 'tmp';

import { AppState } from '../store';

import { NormalizedRating } from './rating.actions';

const selectors = new EntitySelectors<AppState, NormalizedRating>('rating', (state) => state.ratings);

const text = selectors.entityPropertySelector('text');
const max = selectors.entityPropertySelector('max');
const value = selectors.entityPropertySelector('value');

const hasValue = createSelector(value.unsafe, (value) => value !== undefined);

export const ratingSelectors = {
  text,
  max,
  value,
  hasValue,
};
