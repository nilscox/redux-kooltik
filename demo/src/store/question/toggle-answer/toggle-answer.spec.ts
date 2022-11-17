import expect from '@nilscox/expect';

import { array } from '../../../utils';
import { createAnswer, answerActions } from '../../answer/answer.actions';
import { answerSelectors } from '../../answer/answer.selectors';
import { createTestStore } from '../../test-store';
import { createQuestion, questionActions } from '../question.actions';

import { toggleAnswer } from './toggle-answer';

describe('toggleAnswer', () => {
  it('marks an answer as selected', () => {
    const store = createTestStore();

    const answer = createAnswer('');
    const question = createQuestion('', [answer]);

    store.dispatch(questionActions.addQuestion(question));

    store.dispatch(toggleAnswer(answer.id));

    expect(store.select(answerSelectors.selectIsSelected, answer.id)).toBe(true);
  });

  it('unmarks an answer as selected', () => {
    const store = createTestStore();

    const answer = createAnswer('');
    const question = createQuestion('', [answer]);

    store.dispatch(questionActions.addQuestion(question));
    store.dispatch(answerActions.setSelected(answer.id, true));

    store.dispatch(toggleAnswer(answer.id));

    expect(store.select(answerSelectors.selectIsSelected, answer.id)).toBe(false);
  });

  it('unselects the previously selected answer', () => {
    const store = createTestStore();

    const [answer1, answer2] = array(2, () => createAnswer(''));
    const question = createQuestion('', [answer1, answer2]);

    store.dispatch(questionActions.addQuestion(question));
    store.dispatch(answerActions.setSelected(answer1.id, true));

    store.dispatch(toggleAnswer(answer2.id));

    expect(store.select(answerSelectors.selectIsSelected, answer1.id)).toBe(false);
  });
});
