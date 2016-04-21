import HasManyHelper from './has-many-helper';
import {module, test} from 'qunit';

module('Integration | ORM | hasMany #newAssociation');

HasManyHelper.forEachScenario((scenario) => {

  test(`${scenario.title} can build a new associated parent`, function(assert) {
    let { parent: user, children: homeAddresses, newAccessor, accessor, otherIdAccessor } = scenario.go();

    let startingCount = homeAddresses.length;

    let springfield = user[newAccessor]({ name: '1 Springfield ave' });

    assert.ok(!springfield.id, 'the child was not persisted');
    assert.deepEqual(user[accessor].models[startingCount], springfield, `the child is appended to the parent's collection`);

    if (!user.isNew()) {
      assert.equal(springfield[otherIdAccessor], user.id, `the new address's fk reference the saved parent`);
    }

    user.save();

    assert.ok(springfield.id, 'saving the parent persists the child');
    assert.equal(springfield[otherIdAccessor], user.id, 'the childs fk was updated');
    assert.equal(springfield.name, '1 Springfield ave', 'the childs attrs were saved');
  });

  test(`${scenario.title} can build a new associated parent without passing in attrs (regression)`, function(assert) {
    let { parent: user, children: homeAddresses, newAccessor, accessor } = scenario.go();
    let startingCount = homeAddresses.length;

    let springfield = user[newAccessor]();

    assert.deepEqual(user[accessor].models[startingCount], springfield, `the child is appended to the parent's collection`);
  });

});
