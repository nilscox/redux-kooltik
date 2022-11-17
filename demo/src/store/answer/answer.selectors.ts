import { answerSchema, NormalizedEntitySelectors } from '../normalization';
import { AppState } from '../store';

import { Answer, NormalizedAnswer } from './answer.actions';

class AnswerSelectors extends NormalizedEntitySelectors<Answer, NormalizedAnswer> {
  protected schema = answerSchema;

  constructor() {
    super('answer', (state: AppState) => state.answers);
  }

  selectText = this.entityPropertySelector('text');
  selectIsSelected = this.entityPropertySelector('selected');
}

export const answerSelectors = new AnswerSelectors();
