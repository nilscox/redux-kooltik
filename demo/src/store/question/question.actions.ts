import { EntityActions, EntityAdapter, Normalized } from 'tmp';

import { randomId } from '../../utils';
import { Answer } from '../answer/answer.actions';
import { normalizeAnswer, normalizeQuestion, normalizeQuestions } from '../normalization';
import { SurveyStep } from '../survey/survey.actions';

import { toggleAnswer } from './toggle-answer/toggle-answer';

export type Question = {
  id: string;
  type: SurveyStep.question;
  text: string;
  validated: boolean;
  answers: Answer[];
};

export type NormalizedQuestion = Normalized<Question, 'answers'>;

export const createQuestion = (text: string, answers: Answer[]): Question => ({
  id: randomId(),
  type: SurveyStep.question,
  text,
  answers,
  validated: false,
});

class QuestionActions extends EntityActions<NormalizedQuestion> {
  private adapter = new EntityAdapter<NormalizedQuestion>((question) => question.id);

  constructor() {
    super('question');
  }

  setQuestions = this.action('set-questions', this.adapter.setMany);

  addQuestion = this.action('add-question', normalizeQuestion, this.adapter.addId);
  addQuestions = this.action('add-questions', normalizeQuestions, this.adapter.addIds);

  setText = this.setEntityProperty('text');

  addAnswer = this.entityAction('add-answer', normalizeAnswer, (question, answer) => {
    question.answers.push(answer.id);
  });

  toggleAnswer = toggleAnswer;
}

export const questionActions = new QuestionActions();
