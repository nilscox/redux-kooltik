import { answerActions } from '../../answer/answer.actions';
import { AppThunk } from '../../store';
import { questionSelectors } from '../question.selectors';

export const toggleAnswer = (answerId: string): AppThunk<void> => {
  return (dispatch, getState) => {
    const questionId = questionSelectors.questionIdFromAnswerId(getState(), answerId);
    const answers = questionSelectors.answers(getState(), questionId as string);

    for (const answer of answers) {
      if (answer.id === answerId) {
        dispatch(answerActions.setSelected(answer.id, !answer.selected));
      } else if (answer.selected) {
        dispatch(answerActions.setSelected(answer.id, false));
      }
    }
  };
};
