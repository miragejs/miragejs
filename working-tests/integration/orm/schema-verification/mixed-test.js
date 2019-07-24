import { Model, hasMany, belongsTo } from '@miragejs/server';
import Schema from 'ember-cli-mirage/orm/schema';
import Db from 'ember-cli-mirage/db';
import { module, test } from 'qunit';

module('Integration | ORM | Schema Verification | Mixed', function() {
  test('unnamed one-to-many associations are correct', function(assert) {
    let schema = new Schema(new Db({
      wordSmiths: [
        { id: 1, name: 'Frodo' }
      ],
      blogPosts: [
        { id: 1, title: 'Lorem' }
      ]
    }), {
      wordSmith: Model.extend({
        blogPosts: hasMany()
      }),
      blogPost: Model.extend({
        wordSmith: belongsTo()
      })
    });

    let frodo = schema.wordSmiths.find(1);
    let association = frodo.associationFor('blogPosts');

    assert.equal(association.key, 'blogPosts');
    assert.equal(association.modelName, 'blog-post');
    assert.equal(association.ownerModelName, 'word-smith');

    let post = schema.blogPosts.find(1);

    assert.deepEqual(post.inverseFor(association), post.associationFor('wordSmith'));
  });

  test('a named one-to-many association is correct', function(assert) {
    let schema = new Schema(new Db({
      wordSmiths: [
        { id: 1, name: 'Frodo' }
      ],
      blogPosts: [
        { id: 1, title: 'Lorem' }
      ]
    }), {
      wordSmith: Model.extend({
        posts: hasMany('blog-post')
      }),
      blogPost: Model.extend({
        author: belongsTo('word-smith')
      })
    });

    let frodo = schema.wordSmiths.find(1);
    let association = frodo.associationFor('posts');

    assert.equal(association.key, 'posts');
    assert.equal(association.modelName, 'blog-post');
    assert.equal(association.ownerModelName, 'word-smith');

    let post = schema.blogPosts.find(1);

    assert.deepEqual(post.inverseFor(association), post.associationFor('author'));
  });

  test('multiple has-many associations of the same type', function(assert) {
    let schema = new Schema(new Db({
      users: [
        { id: 1, name: 'Frodo' }
      ],
      posts: [
        { id: 1, title: 'Lorem' }
      ]
    }), {
      user: Model.extend({
        notes: hasMany('post', { inverse: 'author' }),
        messages: hasMany('post', { inverse: 'messenger' })
      }),
      post: Model.extend({
        author: belongsTo('user', { inverse: 'notes' }),
        messenger: belongsTo('user', { inverse: 'messages' })
      })
    });

    let frodo = schema.users.find(1);
    let notesAssociation = frodo.associationFor('notes');

    assert.equal(notesAssociation.key, 'notes');
    assert.equal(notesAssociation.modelName, 'post');
    assert.equal(notesAssociation.ownerModelName, 'user');

    let post = schema.posts.find(1);

    assert.deepEqual(post.inverseFor(notesAssociation), post.associationFor('author'));

    let messagesAssociation = frodo.associationFor('messages');

    assert.equal(messagesAssociation.key, 'messages');
    assert.equal(messagesAssociation.modelName, 'post');
    assert.equal(messagesAssociation.ownerModelName, 'user');

    assert.deepEqual(post.inverseFor(messagesAssociation), post.associationFor('messenger'));
  });

  test('one-to-many reflexive association is correct', function(assert) {
    let schema = new Schema(new Db({
      users: [
        { id: 1, name: 'Frodo' }
      ]
    }), {
      user: Model.extend({
        parent: belongsTo('user', { inverse: 'children' }),
        children: hasMany('user', { inverse: 'parent' })
      })
    });

    let frodo = schema.users.find(1);
    let parentAssociation = frodo.associationFor('parent');

    assert.equal(parentAssociation.key, 'parent');
    assert.equal(parentAssociation.modelName, 'user');
    assert.equal(parentAssociation.ownerModelName, 'user');

    assert.deepEqual(frodo.inverseFor(parentAssociation), frodo.associationFor('children'));
  });

  test('one-to-many polymorphic association is correct', function(assert) {
    let schema = new Schema(new Db({
      authors: [
        { id: 1, name: 'Peter' }
      ],
      posts: [
        { id: 1, title: 'Lorem' }
      ],
      articles: [
        { id: 1, title: 'Ipsum' }
      ]
    }), {
      author: Model.extend({
        writings: hasMany({ polymorphic: true })
      }),
      post: Model.extend({
        author: belongsTo('author', { inverse: 'writings' })
      }),
      article: Model.extend({
        author: belongsTo('author', { inverse: 'writings' })
      })
    });

    let author = schema.authors.find(1);
    let writingsAssociation = author.associationFor('writings');

    let post = schema.posts.find(1);
    let postAuthorAssociation = post.associationFor('author');

    let article = schema.articles.find(1);
    let articleAuthorAssociation = article.associationFor('author');

    assert.deepEqual(post.inverseFor(writingsAssociation), postAuthorAssociation);
    assert.deepEqual(article.inverseFor(writingsAssociation), articleAuthorAssociation);
    assert.deepEqual(author.inverseFor(postAuthorAssociation), writingsAssociation);
    assert.deepEqual(author.inverseFor(postAuthorAssociation), writingsAssociation);
  });

  test('multiple implicit inverse associations with the same key throws an error', function(assert) {
    let schema = new Schema(new Db({
      users: [
        { id: 1, name: 'Frodo' }
      ],
      posts: [
        { id: 1, title: 'Lorem' }
      ]
    }), {
      user: Model.extend({
        posts: hasMany('post')
      }),
      post: Model.extend({
        editor: belongsTo('user'),
        authors: hasMany('user')
      })
    });

    let frodo = schema.users.find(1);
    let userPostsAssociation = frodo.associationFor('posts');
    let post = schema.posts.find(1);

    assert.throws(function() {
      post.inverseFor(userPostsAssociation);
    }, /The post model has multiple possible inverse associations for the user.posts association./);
  });

  test('multiple explicit inverse associations with the same key throws an error', function(assert) {
    let schema = new Schema(new Db({
      users: [
        { id: 1, name: 'Frodo' }
      ],
      posts: [
        { id: 1, title: 'Lorem' }
      ]
    }), {
      user: Model.extend({
        posts: hasMany('post', { inverse: 'authors' })
      }),
      post: Model.extend({
        editor: belongsTo('user', { inverse: 'posts' }),
        authors: hasMany('user', { inverse: 'posts' })
      })
    });

    let frodo = schema.users.find(1);
    let userPostsAssociation = frodo.associationFor('posts');
    let post = schema.posts.find(1);

    assert.throws(function() {
      post.inverseFor(userPostsAssociation);
    }, /The post model has defined multiple explicit inverse associations for the user.posts association./);
  });

  test('explicit inverse is chosen over implicit inverses', function(assert) {
    let schema = new Schema(new Db({
      users: [
        { id: 1, name: 'Frodo' }
      ],
      posts: [
        { id: 1, title: 'Lorem' }
      ]
    }), {
      user: Model.extend({
        posts: hasMany('post', { inverse: 'authors' })
      }),
      post: Model.extend({
        editor: belongsTo('user'),
        authors: hasMany('user', { inverse: 'posts' })
      })
    });

    let frodo = schema.users.find(1);
    let userPostsAssociation = frodo.associationFor('posts');

    assert.equal(userPostsAssociation.key, 'posts');
    assert.equal(userPostsAssociation.modelName, 'post');
    assert.equal(userPostsAssociation.ownerModelName, 'user');

    let post = schema.posts.find(1);

    assert.deepEqual(post.inverseFor(userPostsAssociation), post.associationFor('authors'));
  });

  test('multiple explicit inverse associations with the same key but different models does not throw an error', function(assert) {
    let schema = new Schema(new Db({
      users: [
        { id: 1, name: 'Frodo' }
      ],
      posts: [
        { id: 1, title: 'Lorem' }
      ],
      books: [
        { id: 1, title: 'Ipsum' }
      ]
    }), {
      user: Model.extend({
        authoredPosts: hasMany('post', { inverse: 'authors' }),
        authoredBooks: hasMany('book', { inverse: 'authors' })
      }),
      post: Model.extend({
        authors: hasMany('user', { inverse: 'authoredPosts' })
      }),
      book: Model.extend({
        authors: hasMany('user', { inverse: 'authoredBooks' })
      })
    });

    let frodo = schema.users.find(1);
    let post = schema.posts.find(1);
    let book = schema.books.find(1);

    let userAuthoredPostsAssociation = frodo.associationFor('authoredPosts');
    let userAuthoredBooksAssociation = frodo.associationFor('authoredBooks');
    let postsAuthorsAssociation = post.associationFor('authors');
    let bookAuthorsAssociation = book.associationFor('authors');
    assert.deepEqual(post.inverseFor(userAuthoredPostsAssociation), post.associationFor('authors'));
    assert.deepEqual(book.inverseFor(userAuthoredBooksAssociation), book.associationFor('authors'));
    assert.deepEqual(frodo.inverseFor(postsAuthorsAssociation), frodo.associationFor('authoredPosts'));
    assert.deepEqual(frodo.inverseFor(bookAuthorsAssociation), frodo.associationFor('authoredBooks'));
  });
});
