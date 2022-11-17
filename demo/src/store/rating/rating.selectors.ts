import { createSelector } from 'reselect';

import { NormalizedEntitySelectors, ratingSchema } from '../normalization';
import { AppState } from '../store';

import { NormalizedRating, Rating } from './rating.actions';

class RatingSelectors extends NormalizedEntitySelectors<Rating, NormalizedRating> {
  protected schema = ratingSchema;

  constructor() {
    super('rating', (state: AppState) => state.ratings);
  }

  selectText = this.entityPropertySelector('text');
  selectMax = this.entityPropertySelector('max');
  selectValue = this.entityPropertySelector('value');

  selectHasValue = createSelector(this.selectValue, (value) => value !== undefined);
}

export const ratingSelectors = new RatingSelectors();
