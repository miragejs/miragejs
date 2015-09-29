import Mirage from 'ember-cli-mirage';
import Server from 'ember-cli-mirage/server';
import Model from 'ember-cli-mirage/orm/model';
import Serializer from 'ember-cli-mirage/serializer';
import {module, test} from 'qunit';

module('Integration | Serializers | Base | Full Request', {
  beforeEach: function() {
    this.server = new Server({
      environment: 'development',
      models: {
        author: Model.extend({
          posts: Mirage.hasMany()
        }),
        post: Model.extend({
          author: Mirage.belongsTo(),
          comments: Mirage.hasMany()
        }),
        comment: Model.extend({
          post: Mirage.belongsTo()
        }),
      },
      serializers: {
        application: Serializer.extend({
          embed: true,
          root: false
        }),
        author: Serializer.extend({
          embed: true,
          attrs: ['id', 'first'],
          relationships: ['posts']
        })
      }
    });
    this.server.timing = 0;
    this.server.logging = false;
  },
  afterEach: function() {
    this.server.shutdown();
  }
});

test('the appropriate serializer is used', function(assert) {
  assert.expect(1);
  var done = assert.async();
  let author = this.server.schema.author.create({
    first: 'Link',
    last: 'of Hyrule',
    age: 323
  });
  author.createPost({title: 'Lorem ipsum'});

  this.server.get('/authors/:id', function(schema, request) {
    let id = request.params.id;

    return schema.author.find(id);
  });

  $.ajax({
    method: 'GET',
    url: '/authors/1'
  }).done(function(res) {
    assert.deepEqual(res, {
      author: {
        id: 1,
        first: 'Link',
        posts: [
          {id: 1, title: 'Lorem ipsum'}
        ]
      }
    });
    done();
  });
});

test('a response falls back to the application serializer, if it exists', function(assert) {
  assert.expect(1);
  var done = assert.async();
  this.server.schema.post.create({
    title: 'Lorem',
    date: '20001010'
  });

  this.server.get('/posts/:id', function(schema, request) {
    let id = request.params.id;

    return schema.post.find(id);
  });

  $.ajax({
    method: 'GET',
    url: '/posts/1'
  }).done(function(res) {
    assert.deepEqual(res, {
      id: 1,
      title: 'Lorem',
      date: '20001010'
    });
    done();
  });
});
