import HasManyHelper from './has-many-helper';
import {module, test} from 'qunit';

module('Integration | ORM | hasMany #setAssociationIds');

HasManyHelper.forEachScenario((scenario) => {
  test(`${scenario.title} can update its associationIds to a list of saved child ids`, function(assert) {
    let { parent: user, children: homeAddresses, helper, idsAccessor, accessor, otherIdAccessor } = scenario.go();

    let savedHomeAddress = helper.savedChild();

    user[idsAccessor] = [savedHomeAddress.id];
    savedHomeAddress.reload();

    assert.deepEqual(user[accessor].models[0], savedHomeAddress);
    homeAddresses.forEach(function(homeAddress) {
      if (homeAddress.isSaved()) {
        homeAddress.reload();
        assert.equal(homeAddress[otherIdAccessor], null, 'old saved children have their fks cleared');
      }
    });
  });

  if (/^savedParent/.test(scenario.state)) {
    test(`updating associationIds to a list of saved children ids updates the child's fk, with ${scenario.title}`, function(assert) {

      let { parent: user, helper, idsAccessor, otherIdAccessor } = scenario.go();
      let savedHomeAddress = helper.savedChild();

      user[idsAccessor] = [savedHomeAddress.id];
      savedHomeAddress.reload();

      assert.equal(savedHomeAddress[otherIdAccessor], user.id, `the child's fk was set`);
    });
  }

  test(`${scenario.title} can update its associationIds to an empty list`, function(assert) {
    let { parent: user, children: homeAddresses, idsAccessor, accessor, otherIdAccessor } = scenario.go();

    user[idsAccessor] = [];

    assert.equal(user[accessor].models.length, 0);

    homeAddresses.forEach(function(homeAddress) {
      if (homeAddress.isSaved()) {
        homeAddress.reload();
        assert.equal(homeAddress[otherIdAccessor], null, 'old saved children have their fks cleared');
      }
    });
  });

});
