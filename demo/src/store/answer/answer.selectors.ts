import { EntitySelectors } from 'tmp';

import { AppState } from '../store';

import { NormalizedAnswer } from './answer.actions';

const selectors = new EntitySelectors<AppState, NormalizedAnswer>('answer', (state) => state.answers);

export const answerSelectors = {
  text: selectors.entityPropertySelector('text'),
  isSelected: selectors.entityPropertySelector('selected'),
};
