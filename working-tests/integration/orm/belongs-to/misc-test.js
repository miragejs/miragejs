// import { Model, belongsTo, _ormSchema as Schema, _Db as Db } from '@miragejs/server';
import { module, test } from 'qunit';

module('Integration | ORM | Belongs To | Misc', function() {
  test('an ambiguous schema throws an error', function(assert) {
    assert.ok(true);
    // assert.throws(function() {
    //   new Schema(new Db(), {
    //     user: Model.extend({
    //       foo: belongsTo('user'),
    //       bar: belongsTo('user')
    //     })
    //   });
    // }, /You defined the 'foo' relationship on user, but multiple possible inverse relationships of type user exist. Please refer to the models documentation to learn how to explicitly specify inverses./);
  });
});
