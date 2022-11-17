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

class SurveyActions extends EntityActions<NormalizedSurvey> {
  private adapter = new EntityAdapter<NormalizedSurvey>((survey) => survey.id);

  constructor() {
    super('survey');
  }

  setSurveys = this.action('set-surveys', this.adapter.setMany);

  addSurvey = this.action('add-survey', normalizeSurvey, this.adapter.addId);

  addStep = this.entityAction('add-step', normalizeStep, (survey, step: NormalizedStep) => {
    survey.steps.push({ id: step.id, schema: step.type });
  });

  addSteps = this.entityAction('add-steps', normalizeSteps, (survey, steps: NormalizedStep[]) => {
    survey.steps.push(...steps.map((step) => ({ id: step.id, schema: step.type })));
  });
}

export const surveyActions = new SurveyActions();
