import HasManyHelper from './has-many-helper';
import {module, test} from 'qunit';

module('Integration | ORM | hasMany #createAssociation');

HasManyHelper.forEachScenario((scenario) => {
  if (/^savedParent/.test(scenario.state)) {
    test(`${scenario.title} can create an associated child`, function(assert) {
      let { parent: user, children, accessor, idsAccessor, createAccessor, otherIdAccessor } = scenario.go();

      let startingCount = children.length;

      let springfield = user[createAccessor]({ name: '1 Springfield ave' });

      assert.ok(springfield.id, 'the child was persisted');
      assert.equal(springfield[otherIdAccessor], 1, 'the fk is set');
      assert.equal(user[accessor].models.length, startingCount + 1, 'the collection length is correct');
      assert.deepEqual(user[accessor].filter((a) => a.id === springfield.id).models[0], springfield, 'the homeAddress was added to user.homeAddresses');
      assert.ok(user[idsAccessor].indexOf(springfield.id) > -1, 'the id was added to the fks array');
    });

    test(`${scenario.title} can create an associated child without passing attrs (regression)`, function(assert) {
      let { parent: user, accessor, createAccessor } = scenario.go();

      let springfield = user[createAccessor]();

      assert.deepEqual(user[accessor].filter((a) => a.id === springfield.id).models[0], springfield, `the homeAddress was added to user.${accessor}`);
    });
  }

  if (/^newParent/.test(scenario.state)) {
    test(`${scenario.title} cannot create an associated child`, function(assert) {
      let { parent, createAccessor } = scenario.go();

      assert.throws(function() {
        parent[createAccessor]({ name: '1 Springfield ave' });
      }, /unless the parent is saved/);
    });

  }

});
