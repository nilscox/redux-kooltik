import { EntityActions, EntityAdapter, Normalized } from 'tmp';

import { randomId } from '../../utils';
import { Content, NormalizedContent } from '../content/content.actions';
import { normalizeStep, normalizeSteps, normalizeSurvey } from '../normalization';
import { NormalizedQuestion, Question } from '../question/question.actions';
import { NormalizedRating, Rating } from '../rating/rating.actions';

export type Step = Content | Question | Rating;
export type NormalizedStep = NormalizedContent | NormalizedQuestion | NormalizedRating;

export type Survey = {
  id: string;
  steps: Step[];
};

export type NormalizedSurvey = Omit<Normalized<Survey>, 'steps'> & {
  steps: Array<{ id: string; schema: SurveyStep }>;
};

export const createSurvey = (): Survey => ({
  id: randomId(),
  steps: [],
});

export enum SurveyStep {
  content = 'content',
  question = 'question',
  rating = 'rating',
}

const adapter = new EntityAdapter<NormalizedSurvey>((survey) => survey.id);
const actions = new EntityActions<NormalizedSurvey>('survey');

export const surveyActions = {
  setSurveys: actions.action('set-surveys', adapter.setMany),

  addSurvey: actions.action('add-survey', normalizeSurvey, adapter.addId),

  addStep: actions.entityAction('add-step', normalizeStep, (survey, step: NormalizedStep) => {
    survey.steps.push({ id: step.id, schema: step.type });
  }),

  addSteps: actions.entityAction('add-steps', normalizeSteps, (survey, steps: NormalizedStep[]) => {
    survey.steps.push(...steps.map((step) => ({ id: step.id, schema: step.type })));
  }),
};

export const surveyReducer = actions.reducer();
