import { Server, Model, belongsTo } from "miragejs";

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
    this.server = new Server({
      environment: "test",
      models: {
        post: Model.extend({
          comment: belongsTo(),
        }),
        comment: Model.extend({
          commentable: belongsTo({ polymorphic: true }),
        }),
      },
    });

    this.db = this.server.db;
    this.loadData = this.db.loadData.bind(this.db);
    this.schema = this.server.schema;
  }

  shutdown() {
    this.server.shutdown();
  }

  savedChildNoParent() {
    let insertedComment = this.db.comments.insert({ text: "Lorem" });

    return [this.schema.comments.find(insertedComment.id), undefined];
  }

  savedChildNewParent() {
    let comment = this.schema.comments.create({ text: "Lorem" });
    let post = this.schema.posts.new({ title: "Post 1" });

    comment.commentable = post;

    return [comment, post];
  }

  savedChildSavedParent() {
    this.loadData({
      posts: [{ id: "1", title: "Post 1", commentId: "1" }],
      comments: [
        { id: "1", text: "Lorem", commentableId: { id: "1", type: "post" } },
      ],
    });

    let comment = this.schema.comments.find(1);
    let post = this.schema.posts.find(1);

    return [comment, post];
  }

  newChildNoParent() {
    return [this.schema.comments.new({ text: "Lorem" }), undefined];
  }

  newChildNewParent() {
    let post = this.schema.posts.new({ title: "Post 1" });
    let comment = this.schema.comments.new({ text: "Lorem" });
    comment.commentable = post;

    return [comment, post];
  }

  newChildSavedParent() {
    let insertedPost = this.db.posts.insert({ title: "Post 1" });
    let comment = this.schema.comments.new({ text: "Lorem" });
    let savedProfile = this.schema.posts.find(insertedPost.id);

    comment.commentable = savedProfile;

    return [comment, savedProfile];
  }

  // Just a saved unassociated parent.
  savedParent() {
    let insertedPost = this.db.posts.insert({ title: "Post 1" });

    return this.schema.posts.find(insertedPost.id);
  }

  newParent() {
    return this.schema.posts.new({ title: "Post 1" });
  }
}

export const states = [
  "savedChildNoParent",
  "savedChildNewParent",
  "savedChildSavedParent",
  "newChildNoParent",
  "newChildNewParent",
  "newChildSavedParent",
];
