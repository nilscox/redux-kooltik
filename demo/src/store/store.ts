import { composeWithDevTools } from '@redux-devtools/extension';
import {
  AnyAction,
  applyMiddleware,
  combineReducers,
  legacy_createStore as createReduxStore,
  Middleware,
} from 'redux';
import thunk, { ThunkAction, ThunkDispatch } from 'redux-thunk';
import { createNormalizationMiddleware } from 'tmp';

import { answerActions, answerReducer } from './answer/answer.actions';
import { contentActions, contentReducer } from './content/content.actions';
import { questionActions, questionReducer } from './question/question.actions';
import { ratingActions, ratingReducer } from './rating/rating.actions';
import { surveyActions, surveyReducer } from './survey/survey.actions';
import { userReducer } from './user/user.actions';

export const normalizationMiddleware = createNormalizationMiddleware({
  answer: answerActions.setAnswers,
  content: contentActions.setContents,
  question: questionActions.setQuestions,
  rating: ratingActions.setRatings,
  survey: surveyActions.setSurveys,
});

const rootReducer = combineReducers({
  answers: answerReducer,
  contents: contentReducer,
  questions: questionReducer,
  ratings: ratingReducer,
  surveys: surveyReducer,
  user: userReducer,
});

const thunkMiddleware = thunk;

export const createStore = (
  preloadedState?: ReturnType<typeof rootReducer>,
  middlewares: Middleware[] = []
) => {
  const enhancer = applyMiddleware<ThunkDispatch<ReturnType<typeof rootReducer>, unknown, AnyAction>>(
    thunkMiddleware,
    normalizationMiddleware,
    ...middlewares
  );

  return createReduxStore(rootReducer, preloadedState, composeWithDevTools(enhancer) as typeof enhancer);
};

export type AppStore = ReturnType<typeof createStore>;

export type AppState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];

export type AppThunk<ReturnType> = ThunkAction<ReturnType, AppState, unknown, AnyAction>;
