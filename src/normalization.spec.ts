import expect from '@nilscox/expect';
import { schema } from 'normalizr';
import { combineReducers } from 'redux';

import { createNormalizer, Normalized } from './create-normalizer';
import { EntityActions } from './entity-actions';
import { EntityAdapter } from './entity-adapter';
import { EntitySelectors } from './entity-selectors';
import { createNormalizationMiddleware } from './normalization-middleware';
import { NormalizationSelectors } from './normalization-selectors';
import { createTestStore } from './test-store';

describe('normalization', () => {
  type User = {
    name: string;
    friends: User[];
  };

  type NormalizedUser = Normalized<User, 'friends'>;

  const userSchema = new schema.Entity('user', {}, { idAttribute: 'name' });
  userSchema.define({ friends: [userSchema] });

  type Post = {
    id: string;
    author: User;
    text: string;
  };

  type NormalizedPost = Normalized<Post, 'author'>;

  const postSchema = new schema.Entity('post', { author: userSchema });

  const normalizeUser = createNormalizer<User, NormalizedUser>('user', userSchema);
  const normalizePost = createNormalizer<Post, NormalizedPost>('post', postSchema);

  class UserActions extends EntityActions<NormalizedUser> {
    adapter = new EntityAdapter((user: NormalizedUser) => user.name);

    constructor() {
      super('user');
    }

    setUsers = this.action('set-users', this.adapter.setMany);

    addUser = this.action('add-user', normalizeUser, this.adapter.addId);

    addFriend = this.entityAction('add-friend', normalizeUser, (user, friend) => {
      user.friends.push(friend.name);
    });
  }

  class PostActions extends EntityActions<NormalizedPost> {
    adapter = new EntityAdapter((post: NormalizedPost) => post.id);

    constructor() {
      super('post');
    }

    setPosts = this.action('set-posts', this.adapter.setMany);

    addPost = this.action('add-post', normalizePost, this.adapter.addId);

    setAuthor = this.entityAction('set-author', normalizeUser, (post, author) => {
      post.author = author.name;
    });
  }

  const userActions = new UserActions();
  const postActions = new PostActions();

  const rootReducer = combineReducers({
    user: userActions.reducer(),
    post: postActions.reducer(),
  });

  type AppState = ReturnType<typeof rootReducer>;

  const normalizationSelectors = new NormalizationSelectors((state: AppState) => ({
    user: state.user.entities,
    post: state.post.entities,
  }));

  class PostSelectors extends EntitySelectors<AppState, NormalizedPost> {
    constructor() {
      super('post', (state: AppState) => state.post);
    }

    selectPost = normalizationSelectors.createEntitySelector(postSchema);
    selectPosts = normalizationSelectors.createEntitiesSelector(postSchema);
  }

  class UserSelectors extends EntitySelectors<AppState, NormalizedUser> {
    constructor() {
      super('user', (state: AppState) => state.user);
    }

    selectUser = normalizationSelectors.createEntitySelector(userSchema);
    selectUsers = normalizationSelectors.createEntitiesSelector(userSchema);
  }

  const postSelectors = new PostSelectors();
  const userSelectors = new UserSelectors();

  const normalizationMiddleware = createNormalizationMiddleware({
    user: userActions.setUsers,
    post: postActions.setPosts,
  });

  it('normalization', () => {
    const store = createTestStore(rootReducer, undefined, [normalizationMiddleware]);

    const jeanne: User = { name: 'jeanne', friends: [] };
    const tom: User = { name: 'tom', friends: [] };

    store.dispatch(userActions.addUser(tom));
    store.dispatch(userActions.addFriend('tom', jeanne));

    expect(store.select(userSelectors.selectUser, 'tom')).toEqual({ ...tom, friends: [jeanne] });

    const nils: User = { name: 'nils', friends: [tom, jeanne] };
    const post: Post = { id: '1', author: nils, text: 'hello' };

    store.dispatch(postActions.addPost(post));

    const mano: User = { name: 'mano', friends: [tom] };
    const vio: User = { name: 'vio', friends: [nils, jeanne, mano] };

    store.dispatch(postActions.setAuthor(post.id, vio));

    expect(store.select(postSelectors.selectPost, '1')).toEqual({ ...post, author: vio });
  });
});
