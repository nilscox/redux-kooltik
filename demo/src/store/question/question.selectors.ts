import { createSelector } from 'reselect';
import { EntitySelectors } from 'tmp';

import { normalizationSelectors, questionSchema } from '../normalization';
import { AppState } from '../store';

import { NormalizedQuestion, Question } from './question.actions';

export class QuestionSelectors extends EntitySelectors<AppState, NormalizedQuestion> {
  protected schema = questionSchema;

  constructor() {
    super('question', (state) => state.questions);
  }

  selectQuestion = normalizationSelectors.createEntitySelector<Question>('question', questionSchema);

  selectText = this.entityPropertySelector('text');

  selectAnswers = createSelector(this.selectQuestion, (question) => question.answers);

  selectSelectedAnswers = createSelector(this.selectAnswers, (answers) =>
    answers.filter((answer) => answer.selected)
  );

  selectQuestions = this.entitiesSelector();
  selectQuestionIdFromAnswerId = createSelector(
    [this.selectQuestions, (questions, answerId: string) => answerId],
    (questions, answerId) =>
      Object.values(questions).find((question) => question?.answers?.includes(answerId))?.id
  );

  selectHasSelectedAnswer = createSelector(this.selectQuestion, (question) => {
    return question.answers.some(({ selected }) => selected);
  });
}

export const questionSelectors = new QuestionSelectors();
