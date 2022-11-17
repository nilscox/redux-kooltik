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

class ContentActions extends EntityActions<NormalizedContent> {
  private adapter = new EntityAdapter<NormalizedContent>((content) => content.id);

  constructor() {
    super('content');
  }

  setContents = this.action('set-contents', this.adapter.setMany);

  addContent = this.action('add-content', normalizeContent, this.adapter.addId);
  addContents = this.action('add-contents', normalizeContents, this.adapter.addIds);

  setText = this.setEntityProperty('text');
}

export const contentActions = new ContentActions();
