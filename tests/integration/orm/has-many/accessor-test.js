import HasManyHelper from './has-many-helper';
import {module, test} from 'qunit';

module('Integration | ORM | hasMany #accessor');

/*
  #association behavior works regardless of the state of the parent
*/

HasManyHelper.forEachScenario((scenario) => {
  test(`the references of a ${scenario.title} are correct`, function(assert) {
    let { parent, children, accessor, idsAccessor } = scenario.go();
    assert.equal(parent[accessor].models.length, children.length, 'parent has correct number of children');
    assert.equal(parent[idsAccessor].length, children.length, 'parent has correct number of child ids');

    children.forEach(function(child, i) {
      assert.deepEqual(parent[accessor].models[i], children[i], 'each child is in parent.children array');

      if (!child.isNew()) {
        assert.ok(parent[idsAccessor].indexOf(child.id) > -1, 'each saved child id is in parent.childrenIds array');
      }
    });
  });
});
