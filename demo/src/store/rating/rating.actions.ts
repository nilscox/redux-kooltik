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

class RatingActions extends EntityActions<NormalizedRating> {
  private adapter = new EntityAdapter<NormalizedRating>((rating) => rating.id);

  constructor() {
    super('rating');
  }

  setRatings = this.action('set-ratings', this.adapter.setMany);

  addRating = this.action('add-rating', normalizeRating, this.adapter.addId);
  addRatings = this.action('add-ratings', normalizeRatings, this.adapter.addIds);

  setText = this.setEntityProperty('text');
  setValue = this.setEntityProperty('value');
}

export const ratingActions = new RatingActions();
