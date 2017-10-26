import Helper from './_helper';
import { Model } from 'ember-cli-mirage';
import { module, test } from 'qunit';

module('Integration | ORM | Has Many | Named Reflexive | create', function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
    this.helper.schema.registerModel('foo', Model);
  });

  test('it sets up associations correctly when passing in the foreign key', function(assert) {
    let { schema } = this.helper;
    let tagA = schema.tags.create();
    let tagB = schema.tags.create({
      labelIds: [ tagA.id ]
    });

    tagA.reload();

    assert.deepEqual(tagA.labelIds, [ tagB.id ]);
    assert.deepEqual(tagB.labelIds, [ tagA.id ], 'the inverse was set');
    assert.deepEqual(tagA.attrs.labelIds, [ tagB.id ], 'the ids were persisted');
    assert.deepEqual(tagB.attrs.labelIds, [ tagA.id ], 'the inverse ids were persisted');
    assert.deepEqual(tagA.labels.models[0].attrs, tagB.attrs);
    assert.deepEqual(tagB.labels.models[0].attrs, tagA.attrs, 'the inverse was set');
    assert.equal(this.helper.db.tags.length, 2);
    assert.deepEqual(this.helper.db.tags[0], { id: '1', labelIds: [ '2' ] });
    assert.deepEqual(this.helper.db.tags[1], { id: '2', labelIds: [ '1' ] });
  });

  test('it sets up associations correctly when passing in an array of models', function(assert) {
    let { schema } = this.helper;
    let tagA = schema.tags.create();
    let tagB = schema.tags.create({
      labels: [ tagA ]
    });

    tagA.reload();

    assert.deepEqual(tagB.labelIds, [ tagA.id ]);
    assert.deepEqual(tagA.labelIds, [ tagB.id ], 'the inverse was set');
    assert.deepEqual(tagA.attrs.labelIds, [ tagB.id ], 'the ids were persisted');
    assert.deepEqual(tagB.attrs.labelIds, [ tagA.id ], 'the inverse was set');
    assert.equal(this.helper.db.tags.length, 2);
  });

  test('it sets up associations correctly when passing in a collection', function(assert) {
    let { schema } = this.helper;
    let tagA = schema.tags.create();
    let tagB = schema.tags.create({
      labels: schema.tags.all()
    });

    tagA.reload();

    assert.deepEqual(tagB.labelIds, [ tagA.id ]);
    assert.deepEqual(tagA.labelIds, [ tagB.id ], 'the inverse was set');
    assert.deepEqual(tagB.attrs.labelIds, [ tagA.id ]);
    assert.deepEqual(tagA.attrs.labelIds, [ tagB.id ], 'the inverse was set');
    assert.equal(this.helper.db.tags.length, 2);
  });

  test('it throws an error if a model is passed in without a defined relationship', function(assert) {
    let { schema } = this.helper;

    assert.throws(function() {
      schema.tags.create({
        foo: schema.create('foo')
      });
    }, /you haven't defined that key as an association on your model/);
  });

  test('it throws an error if an array of models is passed in without a defined relationship', function(assert) {
    let { schema } = this.helper;

    assert.throws(function() {
      schema.tags.create({
        foos: [ schema.create('foo') ]
      });
    }, /you haven't defined that key as an association on your model/);
  });

  test('it throws an error if a collection is passed in without a defined relationship', function(assert) {
    let { schema } = this.helper;
    schema.foos.create();
    schema.foos.create();

    assert.throws(function() {
      schema.tags.create({
        foos: schema.foos.all()
      });
    }, /you haven't defined that key as an association on your model/);
  });
});
