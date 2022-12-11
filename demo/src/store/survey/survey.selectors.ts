import { createSelector } from 'reselect';

import { normalizationSelectors, surveySchema } from '../normalization';
import { questionSelectors } from '../question/question.selectors';
import { ratingSelectors } from '../rating/rating.selectors';
import { AppState } from '../store';

import { Survey, SurveyStep } from './survey.actions';

const byId = normalizationSelectors.createEntitySelector<Survey>('survey', surveySchema);

const stepIndex = createSelector([byId, (state, entityId, stepId: string) => stepId], (survey, stepId) =>
  survey.steps.findIndex((step) => step.id === stepId)
);

const totalSteps = createSelector(byId, (survey) => survey.steps.length);

const step = createSelector([byId, (state, id, stepId: string) => stepId], (survey, stepId) =>
  survey.steps.find((step) => step.id === stepId)
);

const canGoPrevious = createSelector([byId, stepIndex], (survey, stepIndex) => stepIndex > 0);

const canGoNext = createSelector(
  [(state: AppState) => state, byId, stepIndex],
  (state, survey, stepIndex) => {
    if (stepIndex >= survey.steps.length - 1) {
      return false;
    }

    const step = survey.steps[stepIndex];

    if (step.type === SurveyStep.question && !questionSelectors.hasSelectedAnswer(state, step.id)) {
      return false;
    }

    if (step.type === SurveyStep.rating && !ratingSelectors.hasValue(state, step.id)) {
      return false;
    }

    return true;
  }
);

export const surveySelectors = {
  byId,
  stepIndex,
  totalSteps,
  step,
  canGoPrevious,
  canGoNext,
};
