import { schema } from 'normalizr';
import { createNormalizedEntitySelectors, createNormalizer, EntitiesState } from 'tmp';

import type { Answer, NormalizedAnswer } from './answer/answer.actions';
import type { Content, NormalizedContent } from './content/content.actions';
import type { NormalizedQuestion, Question } from './question/question.actions';
import type { NormalizedRating, Rating } from './rating/rating.actions';
import type { AppState } from './store';
import type { NormalizedStep, NormalizedSurvey, Step, Survey } from './survey/survey.actions';
import type { NormalizedUser, User } from './user/user.actions';

export const answerSchema = new schema.Entity('answer');
export const normalizeAnswer = createNormalizer<Answer, NormalizedAnswer>('answer', answerSchema);

export const questionSchema = new schema.Entity('question', { answers: [answerSchema] });
export const normalizeQuestion = createNormalizer<Question, NormalizedQuestion>('question', questionSchema);
export const normalizeQuestions = createNormalizer.many<Question, NormalizedQuestion>(
  'question',
  questionSchema
);

export const contentSchema = new schema.Entity('content');
export const normalizeContent = createNormalizer<Content, NormalizedContent>('content', contentSchema);
export const normalizeContents = createNormalizer.many<Content, NormalizedContent>('content', contentSchema);

export const ratingSchema = new schema.Entity('rating');
export const normalizeRating = createNormalizer<Rating, NormalizedRating>('rating', ratingSchema);
export const normalizeRatings = createNormalizer.many<Rating, NormalizedRating>('rating', ratingSchema);

export const stepSchema = new schema.Union(
  { content: contentSchema, question: questionSchema, rating: ratingSchema },
  'type'
);
export const normalizeStep = createNormalizer<Step, NormalizedStep>('step', stepSchema);
export const normalizeSteps = createNormalizer.many<Step, NormalizedStep>('step', stepSchema);

export const surveySchema = new schema.Entity('survey', { steps: [stepSchema] });
export const normalizeSurvey = createNormalizer<Survey, NormalizedSurvey>('survey', surveySchema);

export const userSchema = new schema.Entity('user', {}, { idAttribute: 'name' });
export const normalizeUser = createNormalizer<User, NormalizedUser>('user', userSchema);

const asEntitiesState = <T>(id: string, value: T): EntitiesState<T> => ({
  ids: [id],
  entities: { [id]: value },
});

export const selectNormalizedEntities = (state: AppState) => ({
  answer: state.answers.entities,
  content: state.contents.entities,
  question: state.questions.entities,
  rating: state.ratings.entities,
  survey: state.surveys.entities,
  user: asEntitiesState(state.user.name, state.user),
});

export const NormalizedEntitySelectors = createNormalizedEntitySelectors(selectNormalizedEntities);
