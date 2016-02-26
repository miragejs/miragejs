import HasManyHelper from './has-many-helper';
import {module, test} from 'qunit';

module('Integration | Schema | hasMany #createAssociation');

HasManyHelper.forEachScenario(scenario => {
  if (/^savedParent/.test(scenario.state)) {
    test(`${scenario.title} can create an associated child`, function(assert) {
      let { parent: user, children, accessor, idsAccessor, createAccessor, otherIdAccessor } = scenario.go();

      var startingCount = children.length;

      var springfield = user[createAccessor]({name: '1 Springfield ave'});

      assert.ok(springfield.id, 'the child was persisted');
      assert.equal(springfield[otherIdAccessor], 1, 'the fk is set');
      assert.equal(user[accessor].length, startingCount + 1, 'the collection length is correct');
      assert.deepEqual(user[accessor].filter(a => a.id === springfield.id)[0], springfield, 'the homeAddress was added to user.homeAddresses');
      assert.ok(user[idsAccessor].indexOf(springfield.id) > -1, 'the id was added to the fks array');
    });

    test(`${scenario.title} can create an associated child without passing attrs (regression)`, function(assert) {
      let { parent: user, accessor, createAccessor } = scenario.go();

      var springfield = user[createAccessor]();

      assert.deepEqual(user[accessor].filter(a => a.id === springfield.id)[0], springfield, `the homeAddress was added to user.${accessor}`);
    });
  }


  if (/^newParent/.test(scenario.state)) {
    test(`${scenario.title} cannot create an associated child`, function(assert) {
      var { parent, createAccessor } = scenario.go();

      assert.throws(function() {
        parent[createAccessor]({name: '1 Springfield ave'});
      }, /unless the parent is saved/);
    });

  }

});
