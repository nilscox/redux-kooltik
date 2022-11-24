import { EntitySelectors } from 'tmp';

import { answerSchema } from '../normalization';
import { AppState } from '../store';

import { NormalizedAnswer } from './answer.actions';

class AnswerSelectors extends EntitySelectors<AppState, NormalizedAnswer> {
  protected schema = answerSchema;

  constructor() {
    super('answer', (state) => state.answers);
  }

  selectText = this.entityPropertySelector('text');
  selectIsSelected = this.entityPropertySelector('selected');
}

export const answerSelectors = new AnswerSelectors();
