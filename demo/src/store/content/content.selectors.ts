import { contentSchema, NormalizedEntitySelectors } from '../normalization';
import { AppState } from '../store';

import { Content, NormalizedContent } from './content.actions';

class ContentSelectors extends NormalizedEntitySelectors<Content, NormalizedContent> {
  protected schema = contentSchema;

  constructor() {
    super('content', (state: AppState) => state.contents);
  }

  selectText = this.entityPropertySelector('text');
}

export const contentSelectors = new ContentSelectors();
