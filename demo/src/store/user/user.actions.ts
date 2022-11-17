import { Actions, Normalized } from 'tmp';

export type User = {
  name: string;
};

export type NormalizedUser = Normalized<User>;

class UserActions extends Actions<User> {
  constructor() {
    super('user', { name: '' });
  }

  setName = this.createSetter('name');
}

export const userActions = new UserActions();
