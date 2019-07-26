import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Mixed | One To Many Polymorphic | association #create', function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
  });

  /*
    The model can create a has-many association, for all states
  */
  states.forEach((state) => {

    test(`a ${state} can create an associated parent`, function(assert) {
      let [ user ] = this.helper[state]();
      let initialCount = user.things.models.length;

      let post = user.createThing('post', { title: 'Lorem ipsum' });

      assert.ok(post.id, 'the child was persisted');
      assert.equal(user.things.models.length, initialCount + 1, 'the collection size was increased');
      assert.ok(user.things.includes(post), 'the model was added to user.posts');
      assert.ok(user.thingIds.find(obj => {
        return (obj.id === post.id && obj.type === 'post');
      }), 'the id was added to the fks array');
      assert.ok(user.attrs.thingIds.find(obj => {
        return (obj.id === post.id && obj.type === 'post');
      }), 'fks were persisted');

      // Check the inverse
      assert.deepEqual(post.user.attrs, user.attrs);
      assert.deepEqual(post.userId, user.id);
    });

  });
});
