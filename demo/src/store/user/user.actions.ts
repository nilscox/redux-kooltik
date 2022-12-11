import { Actions, Normalized } from 'tmp';

export type User = {
  name: string;
};

export type NormalizedUser = Normalized<User>;

const actions = new Actions<User>('user', { name: '' });

export const userActions = {
  setName: actions.setProperty('name'),
};

export const userReducer = actions.reducer();
