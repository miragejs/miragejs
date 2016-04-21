import HasManyHelper from './has-many-helper';
import {module, test} from 'qunit';

module('Integration | ORM | hasMany #setAssociation', {
  beforeEach() {
    this.helper = new HasManyHelper();
  }
});

HasManyHelper.forEachScenario((scenario) => {
  test(`${scenario.title} can update its association to a list of saved children`, function(assert) {
    let { parent: user, children: homeAddresses, helper, accessor, otherIdAccessor } = scenario.go();
    let savedHomeAddress = helper.savedChild();

    user[accessor] = [savedHomeAddress];
    savedHomeAddress.reload();

    assert.deepEqual(user[accessor].models[0], savedHomeAddress);
    homeAddresses.forEach(function(address) {
      if (address.isSaved()) {
        address.reload();
        assert.equal(address[otherIdAccessor], null, 'old saved children have their fks cleared');
      }
    });
  });

  if (/^savedParent/.test(scenario.state)) {
    test(`updating an association to a list of saved children updates the child's fk when ${scenario.title}`, function(assert) {
      let { parent: user, helper, accessor, otherIdAccessor } = scenario.go();
      let savedHomeAddress = helper.savedChild();

      user[accessor] = [savedHomeAddress];
      savedHomeAddress.reload();

      assert.equal(savedHomeAddress[otherIdAccessor], user.id, `the child's fk was set`);
    });
  }

  test(`${scenario.title} can update its association to a list of new children`, function(assert) {
    let { parent: user, children: homeAddresses, helper, accessor, otherIdAccessor } = scenario.go();
    let address = helper.newChild();

    user[accessor] = [address];
    // The address is saved if the user is a saved user. In that case, we need to reload.
    if (user.isSaved()) {
      address.reload();
    }

    assert.deepEqual(user[accessor].models[0], address);
    homeAddresses.forEach(function(address) {
      if (address.isSaved()) {
        address.reload();
        assert.equal(address[otherIdAccessor], null, 'old saved children have their fks cleared');
      }
    });
  });

  if (/^savedParent/.test(scenario.state)) {

    test(`updating an association to a list of new children saves the children and updates their fks when ${scenario.title}`, function(assert) {
      let { parent: user, helper, accessor, otherIdAccessor } = scenario.go();
      let address = helper.newChild();

      user[accessor] = [address];
      address.reload();

      assert.ok(address.isSaved(), 'the new child was saved');
      assert.equal(address[otherIdAccessor], user.id, `the child's fk was set`);
    });
  }

  test(`${scenario.title} can update its association to a list of mixed children`, function(assert) {
    let { parent: user, children: homeAddresses, helper, accessor, otherIdAccessor } = scenario.go();
    let savedHomeAddress = helper.savedChild();
    let newAddress = helper.newChild();

    user[accessor] = [savedHomeAddress, newAddress];
    savedHomeAddress.reload();
    // The new address is saved if the user is a saved user. In that case, we need to reload.
    if (user.isSaved()) {
      newAddress.reload();
    }

    assert.deepEqual(user[accessor].models[0], savedHomeAddress);
    assert.deepEqual(user[accessor].models[1], newAddress);
    homeAddresses.forEach(function(address) {
      if (address.isSaved()) {
        address.reload();
        assert.equal(address[otherIdAccessor], null, 'old saved children have their fks cleared');
      }
    });
  });

  if (/^savedParent/.test(scenario.state)) {
    test(`updating an association to a list of mixed children saves the new children and updates all children's fks when ${scenario.title}`, function(assert) {
      let { parent: user, helper, accessor, otherIdAccessor } = scenario.go();
      let savedHomeAddress = helper.savedChild();
      let newHomeAddress = helper.newChild();

      user[accessor] = [savedHomeAddress, newHomeAddress];
      savedHomeAddress.reload();
      newHomeAddress.reload();

      assert.ok(newHomeAddress.isSaved(), 'the new child was saved');
      assert.equal(savedHomeAddress[otherIdAccessor], user.id, `the saved child's fk was set`);
      assert.equal(newHomeAddress[otherIdAccessor], user.id, `the new child's fk was set`);
    });
  }

  test(`${scenario.title} can update its association to an empty list`, function(assert) {
    let { parent: user, children: homeAddresses, accessor, otherIdAccessor } = scenario.go();

    user[accessor] = [];

    assert.equal(user[accessor].models.length, 0);
    homeAddresses.forEach(function(address) {
      if (address.isSaved()) {
        address.reload();
        assert.equal(address[otherIdAccessor], null, 'old saved children have their fks cleared');
      }
    });
  });

});
