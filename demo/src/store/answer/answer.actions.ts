import { EntityActions, EntityAdapter, Normalized } from 'tmp';

import { randomId } from '../../utils';

export type Answer = {
  id: string;
  text: string;
  selected: boolean;
};

export type NormalizedAnswer = Normalized<Answer>;

export const createAnswer = (text: string): Answer => ({
  id: randomId(),
  text,
  selected: false,
});

const adapter = new EntityAdapter<NormalizedAnswer>((answer) => answer.id);
const actions = new EntityActions<NormalizedAnswer>('answer');

export const answerActions = {
  setAnswers: actions.action('set-answers', adapter.setMany),
  setSelected: actions.setEntityProperty('selected'),
};

export const answerReducer = actions.reducer();
