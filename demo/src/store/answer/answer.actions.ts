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

class AnswerActions extends EntityActions<NormalizedAnswer> {
  private adapter = new EntityAdapter<NormalizedAnswer>((answer) => answer.id);

  constructor() {
    super('answer');
  }

  setAnswers = this.action('set-answers', this.adapter.setMany);

  setSelected = this.setEntityProperty('selected');
}

export const answerActions = new AnswerActions();
