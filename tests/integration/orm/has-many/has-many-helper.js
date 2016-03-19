import Model from 'ember-cli-mirage/orm/model';
import Schema from 'ember-cli-mirage/orm/schema';
import Db from 'ember-cli-mirage/db';
import { hasMany } from 'ember-cli-mirage';
import { pluralize, singularize, capitalize, camelize } from 'ember-cli-mirage/utils/inflector';
import _ from 'lodash';

/*
  A model with a hasMany association can be in eight states
  with respect to its association. This helper class
  returns a parent (and its children) in these various states.

  The return value is an array of the form

    [parent, [child1, child2...]]

  where the children array may be undefined.
*/
class HasManyHelper {

  constructor(opts) {

    let { ownKey, ownModel, otherKey, otherModel } = _.defaults({}, opts, {
      ownKey: 'homeAddresses',
      ownModel: 'user',
      otherKey: 'user',
      otherModel: 'homeAddress'
    });

    this.ownKey = ownKey;
    this.ownModel = ownModel;
    this.otherKey = otherKey;
    this.otherModel = otherModel;
    this.db = new Db();

    let hasManyArgs = [];
    if (pluralize(otherModel) !== ownKey) {
      hasManyArgs.push(otherModel);
    }
    if (ownModel !== otherKey) {
      hasManyArgs.push({ inverse: otherKey });
    }

    this.schema = new Schema(this.db, {
      [ownModel]: Model.extend({
        [ownKey]: hasMany(...hasManyArgs)
      }),
      [otherModel]: Model
    });
  }

  savedParentNoChildren() {
    let insertedUser = this.db[pluralize(this.ownModel)].insert({ name: 'Link' });

    return [this.schema[pluralize(this.ownModel)].find(insertedUser.id), []];
  }

  savedParentNewChildren() {
    let insertedUser = this.db[pluralize(this.ownModel)].insert({ name: 'Link' });

    let user = this.schema[pluralize(this.ownModel)].find(insertedUser.id);
    let newHomeAddress = user[`new${singularize(capitalize(this.ownKey))}`]();

    return [user, [newHomeAddress]];
  }

  savedParentSavedChildren() {
    let insertedUser = this.db[pluralize(this.ownModel)].insert({ name: 'Link' });
    let insertedHomeAddress = this.db[pluralize(this.otherModel)].insert({ name: '123 Hyrule Way', [`${camelize(this.otherKey)}Id`]: insertedUser.id });

    let user = this.schema[pluralize(this.ownModel)].find(insertedUser.id);
    let homeAddress = this.schema[pluralize(this.otherModel)].find(insertedHomeAddress.id);

    return [user, [homeAddress]];
  }

  savedParentMixedChildren() {
    let insertedUser = this.db[pluralize(this.ownModel)].insert({ name: 'Link' });
    let insertedHomeAddress = this.db[pluralize(this.otherModel)].insert({ name: '123 Hyrule Way', [`${camelize(this.otherKey)}Id`]: insertedUser.id });

    let user = this.schema[pluralize(this.ownModel)].find(insertedUser.id);
    let savedHomeAddress = this.schema[pluralize(this.otherModel)].find(insertedHomeAddress.id);
    let newHomeAddress = user[`new${singularize(capitalize(this.ownKey))}`]();

    return [user, [savedHomeAddress, newHomeAddress]];
  }

  newParentNoChildren() {
    let user = this.schema[pluralize(this.ownModel)].new();

    return [user, []];
  }

  newParentNewChildren() {
    let user = this.schema[pluralize(this.ownModel)].new();
    let newHomeAddress = user[`new${singularize(capitalize(this.ownKey))}`]();

    return [user, [newHomeAddress]];
  }

  newParentSavedChildren() {
    let insertedHomeAddress = this.db[pluralize(this.otherModel)].insert({ name: '123 Hyrule Way' });
    let savedHomeAddress = this.schema[pluralize(this.otherModel)].find(insertedHomeAddress.id);
    let newUser = this.schema[pluralize(this.ownModel)].new({ [this.ownKey]: [savedHomeAddress] });

    return [newUser, [savedHomeAddress]];
  }

  newParentMixedChildren() {
    let insertedHomeAddress = this.db[pluralize(this.otherModel)].insert({ name: '123 Hyrule Way' });
    let savedHomeAddress = this.schema[pluralize(this.otherModel)].find(insertedHomeAddress.id);
    let newHomeAddress = this.schema[pluralize(this.otherModel)].new();

    let newUser = this.schema[pluralize(this.ownModel)].new({ [this.ownKey]: [savedHomeAddress, newHomeAddress] });

    return [newUser, [savedHomeAddress, newHomeAddress]];
  }

  // Just a saved unassociated child. The id is high so as not to
  // interfere with any other children
  savedChild() {
    let insertedHomeAddress = this.db[pluralize(this.otherModel)].insert({ name: 'foo' });

    return this.schema[pluralize(this.otherModel)].find(insertedHomeAddress.id);
  }

  newChild() {
    return this.schema[pluralize(this.otherModel)].new({ name: 'Newbie' });
  }

}

HasManyHelper.forEachScenario = function(fn) {
  [
    [true, true],
    [true, false],
    [false, true],
    [false, false]
  ].forEach(([useDefaultOwnKey, useDefaultOtherKey]) => {

    let accessor = 'homeAddresses';
    let idsAccessor = 'homeAddressIds';
    let createAccessor = 'createHomeAddress';
    let newAccessor = 'newHomeAddress';
    let otherAccessor = 'user';
    let otherIdAccessor = 'userId';

    let opts = {};
    if (!useDefaultOwnKey) {
      opts.ownKey = 'altHomeAddresses';
      accessor = 'altHomeAddresses';
      idsAccessor = 'altHomeAddressIds';
      createAccessor = 'createAltHomeAddress';
      newAccessor = 'newAltHomeAddress';
    }
    if (!useDefaultOtherKey) {
      opts.otherKey = 'altUser';
      otherAccessor = 'altUser';
      otherIdAccessor = 'altUserId';
    }

    [
      'savedParentNoChildren',
      'savedParentNewChildren',
      'savedParentSavedChildren',
      'savedParentMixedChildren',
      'newParentNoChildren',
      'newParentNewChildren',
      'newParentSavedChildren',
      'newParentMixedChildren'
    ].forEach((state) => {
      let title = `${state} with ${useDefaultOwnKey ? 'default' : 'non-default'} own key and ${useDefaultOtherKey ? 'default' : 'non-default'} other key`;
      fn({
        go() {
          let helper = new HasManyHelper(opts);

          let [parent, children] = helper[state]();
          return {
            parent,
            children,
            title,
            accessor,
            idsAccessor,
            createAccessor,
            newAccessor,
            otherAccessor,
            otherIdAccessor,
            helper
          };
        },
        title,
        state,
        useDefaultOwnKey,
        useDefaultOtherKey
      });
    });
  });
};

export default HasManyHelper;
