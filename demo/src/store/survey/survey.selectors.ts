import { createSelector } from 'reselect';

import { NormalizedEntitySelectors, surveySchema } from '../normalization';
import { questionSelectors } from '../question/question.selectors';
import { ratingSelectors } from '../rating/rating.selectors';
import { AppState } from '../store';

import { NormalizedSurvey, Survey, SurveyStep } from './survey.actions';

class SurveySelectors extends NormalizedEntitySelectors<Survey, NormalizedSurvey> {
  protected schema = surveySchema;

  constructor() {
    super('survey', (state: AppState) => state.surveys);
  }

  selectSurvey = this.selectEntity;

  selectTotalSteps = createSelector(this.selectSurvey, (survey) => survey.steps.length);

  selectStep = createSelector([this.selectSurvey, (state, id, stepId: string) => stepId], (survey, stepId) =>
    survey.steps.find((step) => step.id === stepId)
  );

  selectStepIndex = createSelector(
    [this.selectSurvey, (state, entityId, stepId: string) => stepId],
    (survey, stepId) => survey.steps.findIndex((step) => step.id === stepId)
  );

  selectCanGoPrevious = createSelector(
    [this.selectSurvey, this.selectStepIndex],
    (survey, stepIndex) => stepIndex > 0
  );

  selectCanGoNext = createSelector(
    [(state: AppState) => state, this.selectSurvey, this.selectStepIndex],
    (state, survey, stepIndex) => {
      if (stepIndex >= survey.steps.length - 1) {
        return false;
      }

      const step = survey.steps[stepIndex];

      if (step.type === SurveyStep.question && !questionSelectors.selectHasSelectedAnswer(state, step.id)) {
        return false;
      }

      if (step.type === SurveyStep.rating && !ratingSelectors.selectHasValue(state, step.id)) {
        return false;
      }

      return true;
    }
  );
}

export const surveySelectors = new SurveySelectors();
