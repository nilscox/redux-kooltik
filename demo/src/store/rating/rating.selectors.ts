import { createSelector } from 'reselect';
import { EntitySelectors } from 'tmp';

import { ratingSchema } from '../normalization';
import { AppState } from '../store';

import { NormalizedRating } from './rating.actions';

class RatingSelectors extends EntitySelectors<AppState, NormalizedRating> {
  protected schema = ratingSchema;

  constructor() {
    super('rating', (state) => state.ratings);
  }

  selectText = this.entityPropertySelector('text');
  selectMax = this.entityPropertySelector('max');
  selectValue = this.entityPropertySelector('value');

  selectHasValue = createSelector(this.selectValue, (value) => value !== undefined);
}

export const ratingSelectors = new RatingSelectors();
