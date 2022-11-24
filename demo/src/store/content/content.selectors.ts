import { EntitySelectors } from 'tmp';

import { contentSchema } from '../normalization';
import { AppState } from '../store';

import { NormalizedContent } from './content.actions';

class ContentSelectors extends EntitySelectors<AppState, NormalizedContent> {
  protected schema = contentSchema;

  constructor() {
    super('content', (state) => state.contents);
  }

  selectText = this.entityPropertySelector('text');
}

export const contentSelectors = new ContentSelectors();
