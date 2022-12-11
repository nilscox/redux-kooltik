import expect from '@nilscox/expect';

import { array } from '../../utils';
import { answerActions, createAnswer } from '../answer/answer.actions';
import { Content, createContent } from '../content/content.actions';
import { createQuestion } from '../question/question.actions';
import { createRating, ratingActions } from '../rating/rating.actions';
import { createTestStore, TestStore } from '../test-store';

import { createSurvey, Survey, surveyActions } from './survey.actions';
import { surveySelectors } from './survey.selectors';

describe('SurveyActions', () => {
  let store: TestStore;
  let survey: Survey;

  beforeEach(() => {
    store = createTestStore();
    survey = createSurvey();

    store.dispatch(surveyActions.addSurvey(survey));
  });

  describe('selectTotalSteps', () => {
    it("returns a survey's total number of steps", () => {
      const content = createContent('');
      store.dispatch(surveyActions.addStep(survey.id, content));

      expect(store.select(surveySelectors.totalSteps, survey.id)).toEqual(1);
    });
  });

  describe('selectStep', () => {
    it("returns a survey's step from its id", () => {
      const content = createContent('');

      store.dispatch(surveyActions.addStep(survey.id, content));

      expect(store.select(surveySelectors.step, survey.id, content.id)).toEqual(content);
    });

    it("returns a survey's step index from its id", () => {
      const [content1, content2] = array(2, () => createContent(''));
      store.dispatch(surveyActions.addSteps(survey.id, [content1, content2]));

      expect(store.select(surveySelectors.stepIndex, survey.id, content1.id)).toEqual(0);
      expect(store.select(surveySelectors.stepIndex, survey.id, content2.id)).toEqual(1);
    });
  });

  describe('selectCanGoPrevious', () => {
    let content1: Content;
    let content2: Content;

    beforeEach(() => {
      [content1, content2] = array(2, () => createContent(''));
      store.dispatch(surveyActions.addSteps(survey.id, [content1, content2]));
    });

    it('returns false when the current step is the first one', () => {
      expect(store.select(surveySelectors.canGoPrevious, survey.id, content1.id)).toBe(false);
    });

    it('returns true when the current step is not the first one', () => {
      expect(store.select(surveySelectors.canGoPrevious, survey.id, content2.id)).toBe(true);
    });
  });

  describe('selectCanGoNext', () => {
    let content1: Content;
    let content2: Content;

    beforeEach(() => {
      [content1, content2] = array(2, () => createContent(''));
      store.dispatch(surveyActions.addSteps(survey.id, [content1, content2]));
    });

    it('returns true when the current step is not the last one', () => {
      expect(store.select(surveySelectors.canGoNext, survey.id, content1.id)).toBe(true);
    });

    it('returns false when the current step is the last one', () => {
      expect(store.select(surveySelectors.canGoNext, survey.id, content2.id)).toBe(false);
    });

    it('returns false when the current question has not been answered', () => {
      const question = createQuestion('', [createAnswer('')]);

      store.dispatch(surveyActions.addSurvey(survey));
      store.dispatch(surveyActions.addSteps(survey.id, [question, createContent('')]));

      expect(store.select(surveySelectors.canGoNext, survey.id, question.id)).toBe(false);
    });

    it('returns true when the current question has been answered', () => {
      const question = createQuestion('', [createAnswer('')]);

      store.dispatch(surveyActions.addSurvey(survey));
      store.dispatch(surveyActions.addSteps(survey.id, [question, createContent('')]));
      store.dispatch(answerActions.setSelected(question.answers[0].id, true));

      expect(store.select(surveySelectors.canGoNext, survey.id, question.id)).toBe(true);
    });

    it('returns false when the current rating has not been answered', () => {
      const rating = createRating('', 5);

      store.dispatch(surveyActions.addSurvey(survey));
      store.dispatch(surveyActions.addSteps(survey.id, [rating, createContent('')]));

      expect(store.select(surveySelectors.canGoNext, survey.id, rating.id)).toBe(false);
    });

    it('returns true when the current rating has been answered', () => {
      const rating = createRating('', 5);

      store.dispatch(surveyActions.addSurvey(survey));
      store.dispatch(surveyActions.addSteps(survey.id, [rating, createContent('')]));
      store.dispatch(ratingActions.setValue(rating.id, 1));

      expect(store.select(surveySelectors.canGoNext, survey.id, rating.id)).toBe(true);
    });
  });
});
