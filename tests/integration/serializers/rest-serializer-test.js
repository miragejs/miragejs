import { module, test } from 'qunit';
import Server from 'ember-cli-mirage/server';
import { Model, hasMany, belongsTo, RestSerializer } from 'ember-cli-mirage';

module('Integration | Serializer | RestSerializer', function(hooks) {

  test('it sideloads associations and camel-cases relationships and attributes correctly for a model', function(assert) {
    let server = new Server({
      environment: 'test',
      models: {
        wordSmith: Model.extend({
          blogPosts: hasMany()
        }),
        blogPost: Model.extend({
          wordSmith: belongsTo()
        })
      },
      serializers: {
        application: RestSerializer,
        wordSmith: RestSerializer.extend({
          attrs: ['id', 'name'],
          include: ['blogPosts']
        }),
        blogPost: RestSerializer.extend({
          include: ['wordSmith']
        })
      }
    });

    let link = server.create('word-smith', { name: 'Link', age: 123 });
    link.createBlogPost({ title: 'Lorem' });
    link.createBlogPost({ title: 'Ipsum' });

    server.create('word-smith', { name: 'Zelda', age: 230 });

    let result = server.serializerOrRegistry.serialize(link);

    assert.deepEqual(result, {
      wordSmith: {
        id: '1',
        name: 'Link',
        blogPosts: ['1', '2']
      },
      blogPosts: [
        {
          id: '1',
          title: 'Lorem',
          wordSmith: '1'
        },
        {
          id: '2',
          title: 'Ipsum',
          wordSmith: '1'
        }
      ]
    });
  });

  test('it works for has-many polymorphic associations', function(assert) {
    let server = new Server({
      environment: 'test',
      models: {
        wordSmith: Model.extend({
          posts: hasMany({ polymorphic: true })
        }),
        blogPost: Model.extend()
      },
      serializers: {
        application: RestSerializer
      }
    });

    let post = server.create('blog-post', { title: 'Post 1' });
    let link = server.create('word-smith', {
      name: 'Link',
      age: 123,
      posts: [ post ]
    });

    let result = server.serializerOrRegistry.serialize(link);

    assert.deepEqual(result, {
      wordSmith: {
        id: '1',
        name: 'Link',
        age: 123,
        posts: [
          { id: '1', type: 'blog-post' }
        ]
      }
    });
  });

});
