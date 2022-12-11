import { createSelector } from 'reselect';
import { EntitySelectors } from 'tmp';

import { normalizationSelectors, questionSchema } from '../normalization';
import { AppState } from '../store';

import { NormalizedQuestion, Question } from './question.actions';

const selectors = new EntitySelectors<AppState, NormalizedQuestion>('question', (state) => state.questions);

const selectAllNormalized = selectors.entitiesSelector();
const byId = normalizationSelectors.createEntitySelector<Question>('question', questionSchema);

export const questionSelectors = {
  byId,

  text: selectors.entityPropertySelector('text'),

  answers: createSelector(byId, (question) => question.answers),

  selectedAnswers() {
    return createSelector(this.answers, (answers) => answers.filter((answer) => answer.selected));
  },

  questionIdFromAnswerId: createSelector(
    [selectAllNormalized, (state, answerId: string) => answerId],
    (questions, answerId) => {
      const question = Object.values(questions).find((question) => question.answers.includes(answerId));
      return question?.id;
    }
  ),

  hasSelectedAnswer: createSelector(byId, (question) => {
    return question.answers.some(({ selected }) => selected);
  }),
};
