import Helper, { states } from './_helper';
import { module, test } from 'qunit';

describe('Integration | ORM | Mixed | One To Many Polymorphic | delete', function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
  });

  states.forEach((state) => {

    test(`deleting children updates the parent's foreign key for a ${state}`, assert => {
      let [ user, posts ] = this.helper[state]();

      if (posts && posts.length) {
        posts.forEach(p => p.destroy());
        user.reload();
      }

      expect(user.things.length).toEqual(0);
      expect(user.thingIds.length).toEqual(0);
    });

  });
});
