import { Collection, _ormSchema as Schema, _Db as Db, Model } from '@miragejs/server';
import {module, test} from 'qunit';

var schema;
var User = Model.extend();

module('Integration | ORM | #find', function(hooks) {
  hooks.beforeEach(function() {
    let db = new Db({ users: [
      { id: 1, name: 'Link' },
      { id: 2, name: 'Zelda' }
    ] });

    schema = new Schema(db, {
      user: User
    });
  });

  test('it can find a model by id', assert => {
    let zelda = schema.users.find(2);

    expect(zelda instanceof User).toBeTruthy();
    expect(zelda.attrs).toEqual({ id: '2', name: 'Zelda' });
  });

  test('it returns null if no model is found for an id', assert => {
    let user = schema.users.find(4);

    expect(user).toEqual(null);
  });

  test('it can find multiple models by ids', assert => {
    let users = schema.users.find([1, 2]);

    expect(users instanceof Collection).toBeTruthy();
    expect(users.models[0] instanceof User).toBeTruthy();
    expect(users.models.length).toEqual(2);
    expect(users.models[1].attrs).toEqual({ id: '2', name: 'Zelda' });
  });

  test('it errors if incorrect number of models are found for an array of ids', assert => {
    expect(function() {
      schema.users.find([1, 6]);
    }).toThrow();
  });
});
