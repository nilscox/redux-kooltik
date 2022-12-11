import { EntitySelectors } from 'tmp';

import { AppState } from '../store';

import { NormalizedContent } from './content.actions';

const selectors = new EntitySelectors<AppState, NormalizedContent>('content', (state) => state.contents);

export const contentSelectors = {
  text: selectors.entityPropertySelector('text'),
};
