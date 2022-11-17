import * as ReactDOM from 'react-dom/client';
import { Provider as ReduxProvider } from 'react-redux';

import './styles.css';

import { App } from './app';
import { createAnswer } from './store/answer/answer.actions';
import { createContent } from './store/content/content.actions';
import { createQuestion } from './store/question/question.actions';
import { createRating } from './store/rating/rating.actions';
import { createStore } from './store/store';
import { createSurvey, surveyActions } from './store/survey/survey.actions';

const store = createStore();

const intro = createContent('Developer survey');

const question1 = createQuestion('Are you a developer?', [
  createAnswer('Yes'),
  createAnswer('No'),
  createAnswer("I'm a cat"),
]);

const question2 = createQuestion('What kind of developer are you?', [
  createAnswer('The best'),
  createAnswer('A good one'),
  createAnswer("I don't know"),
  createAnswer("Told you I'm a cat"),
]);

const rating = createRating('How good would you say you are as a developer?', 5);

const conclusion = createContent('Thank you for your time!');

const survey = createSurvey();
survey.id = 'id';

store.dispatch(surveyActions.addSurvey(survey));

store.dispatch(surveyActions.addStep(survey.id, intro));
store.dispatch(surveyActions.addStep(survey.id, question1));
store.dispatch(surveyActions.addStep(survey.id, question2));
store.dispatch(surveyActions.addStep(survey.id, rating));
store.dispatch(surveyActions.addStep(survey.id, conclusion));

ReactDOM.createRoot(document.getElementById('app') as HTMLElement).render(
  <ReduxProvider store={store}>
    <App />
  </ReduxProvider>
);
