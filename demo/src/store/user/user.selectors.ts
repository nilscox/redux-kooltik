import { Selectors } from 'tmp';

import { AppState } from '../store';

import { User } from './user.actions';

const selectors = new Selectors<AppState, User>((state: AppState) => state.user);

export const userSelectors = {
  selectName: selectors.property('name'),
};
