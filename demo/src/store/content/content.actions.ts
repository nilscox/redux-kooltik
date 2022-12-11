import { EntityActions, EntityAdapter, Normalized } from 'tmp';

import { randomId } from '../../utils';
import { normalizeContent, normalizeContents } from '../normalization';
import { SurveyStep } from '../survey/survey.actions';

export type Content = {
  id: string;
  type: SurveyStep.content;
  text: string;
  validated: boolean;
};

export type NormalizedContent = Normalized<Content>;

export const createContent = (text: string): Content => ({
  id: randomId(),
  type: SurveyStep.content,
  text,
  validated: false,
});

const adapter = new EntityAdapter<NormalizedContent>((content) => content.id);
const actions = new EntityActions<NormalizedContent>('content');

export const contentActions = {
  setContents: actions.action('set-contents', adapter.setMany),

  addContent: actions.action('add-content', normalizeContent, adapter.addId),
  addContents: actions.action('add-contents', normalizeContents, adapter.addIds),

  setText: actions.setEntityProperty('text'),
};

export const contentReducer = actions.reducer();
