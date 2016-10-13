import { Model, belongsTo } from 'ember-cli-mirage';
import Schema from 'ember-cli-mirage/orm/schema';
import Db from 'ember-cli-mirage/db';

/*
  A model with a belongsTo association can be in six states
  with respect to its association. This helper class
  returns a child (and its association) in these various states.

  The return value is an array of the form

    [ child, parent ]

  where the parent may be undefined.
*/
export default class BelongsToHelper {

  constructor() {
    this.db = new Db();

    this.schema = new Schema(this.db, {
      user: Model.extend(),
      post: Model.extend({
        author: belongsTo('user')
      })
    });
  }

  savedChildNoParent() {
    let insertedPost = this.db.posts.insert({ title: 'Lorem' });

    return [ this.schema.posts.find(insertedPost.id), undefined ];
  }

  savedChildNewParent() {
    let insertedPost = this.db.posts.insert({ title: 'Lorem' });
    let post = this.schema.posts.find(insertedPost.id);
    let author = this.schema.users.new({ name: 'Bob' });

    post.author = author;

    return [ post, author ];
  }

  savedChildSavedParent() {
    let insertedAuthor = this.db.users.insert({ name: 'Bob' });
    let insertedPost = this.db.posts.insert({ title: 'Lorem', authorId: insertedAuthor.id });
    let post = this.schema.posts.find(insertedPost.id);
    let author = this.schema.users.find(insertedAuthor.id);

    return [ post, author ];
  }

  newChildNoParent() {
    return [ this.schema.posts.new({ title: 'Lorem' }), undefined ];
  }

  newChildNewParent() {
    let post = this.schema.posts.new({ title: 'Lorem' });
    let newAuthor = this.schema.users.new({ name: 'Bob' });
    post.author = newAuthor;

    return [ post, newAuthor ];
  }

  newChildSavedParent() {
    let insertedAuthor = this.db.users.insert({ name: 'Bob' });
    let post = this.schema.posts.new({ title: 'Lorem' });
    let savedAuthor = this.schema.users.find(insertedAuthor.id);

    post.author = savedAuthor;

    return [ post, savedAuthor ];
  }

  // Just a saved unassociated parent.
  savedParent() {
    let insertedAuthor = this.db.users.insert({ name: 'Bob' });

    return this.schema.users.find(insertedAuthor.id);
  }

  newParent() {
    return this.schema.users.new({ name: 'Bob' });
  }

}

export const states = [
  'savedChildNoParent',
  'savedChildNewParent',
  'savedChildSavedParent',
  'newChildNoParent',
  'newChildNewParent',
  'newChildSavedParent'
];
