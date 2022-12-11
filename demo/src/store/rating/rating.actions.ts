import { EntityActions, EntityAdapter, Normalized } from 'tmp';

import { randomId } from '../../utils';
import { normalizeRating, normalizeRatings } from '../normalization';
import { SurveyStep } from '../survey/survey.actions';

export type Rating = {
  id: string;
  type: SurveyStep.rating;
  text: string;
  max: number;
  value?: number;
  validated: boolean;
};

export type NormalizedRating = Normalized<Rating>;

export const createRating = (text: string, max: number): Rating => ({
  id: randomId(),
  type: SurveyStep.rating,
  text,
  max,
  validated: false,
});

const adapter = new EntityAdapter<NormalizedRating>((rating) => rating.id);
const actions = new EntityActions<NormalizedRating>('rating');

export const ratingActions = {
  setRatings: actions.action('set-ratings', adapter.setMany),

  addRating: actions.action('add-rating', normalizeRating, adapter.addId),
  addRatings: actions.action('add-ratings', normalizeRatings, adapter.addIds),

  setText: actions.setEntityProperty('text'),
  setValue: actions.setEntityProperty('value'),
};

export const ratingReducer = actions.reducer();
