import { Selectors } from 'tmp';

import { AppState } from '../store';

import { User } from './user.actions';

export class UserSelectors extends Selectors<AppState, User> {
  constructor() {
    super((state: AppState) => state.user);
  }

  selectName = this.propertySelector('name');
}
