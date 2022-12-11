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

const adapter = new EntityAdapter<NormalizedQuestion>((question) => question.id);
const actions = new EntityActions<NormalizedQuestion>('question');

export const questionActions = {
  setQuestions: actions.action('set-questions', adapter.setMany),

  addQuestion: actions.action('add-question', normalizeQuestion, adapter.addId),
  addQuestions: actions.action('add-questions', normalizeQuestions, adapter.addIds),

  setText: actions.setEntityProperty('text'),

  addAnswer: actions.entityAction('add-answer', normalizeAnswer, (question, answer) => {
    question.answers.push(answer.id);
  }),

  toggleAnswer,
};

export const questionReducer = actions.reducer();
