import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Has Many | One-way Polymorphic | association #set', function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
  });

  /*
    The model can update its association via parent, for all states
  */
  states.forEach((state) => {

    test(`a ${state} can update its association to a list of saved children`, assert => {
      let [ user ] = this.helper[state]();
      let savedPost = this.helper.savedChild();

      user.things = [ savedPost ];

      expect(user.things.models.includes(savedPost)).toBeTruthy();
      expect(
        user.thingIds.find(({ id, type }) => ((id === savedPost.id && type === 'post')))
      ).toBeTruthy();
    });

    test(`a ${state} can update its association to a new parent`, assert => {
      let [ user ] = this.helper[state]();
      let newPost = this.helper.newChild();

      user.things = [ newPost ];

      expect(user.thingIds).toEqual([ { type: 'post', id: undefined } ]);
      expect(user.things.models[0]).toEqual(newPost);
    });

    test(`a ${state} can clear its association via an empty list`, assert => {
      let [ user ] = this.helper[state]();

      user.things = [ ];

      expect(user.thingIds).toEqual([ ]);
      expect(user.things.models.length).toEqual(0);
    });

    test(`a ${state} can clear its association via null`, assert => {
      let [ user ] = this.helper[state]();

      user.things = null;

      expect(user.thingIds).toEqual([ ]);
      expect(user.things.models.length).toEqual(0);
    });

  });
});
