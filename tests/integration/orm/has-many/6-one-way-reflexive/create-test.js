import Helper from "./_helper";
import { Model } from "ember-cli-mirage";
import { module, test } from "qunit";

module("Integration | ORM | Has Many | One-Way Reflexive | create", function(
  hooks
) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
    this.helper.schema.registerModel("foo", Model);
  });

  test("it sets up associations correctly when passing in the foreign key", function(assert) {
    let { schema } = this.helper;
    let tagA = schema.tags.create();
    let tagB = schema.tags.create({
      tagIds: [tagA.id]
    });

    tagA.reload();

    assert.deepEqual(tagB.tagIds, [tagA.id]);
    assert.deepEqual(tagA.tagIds, [], "the inverse was not set");
    assert.deepEqual(tagB.attrs.tagIds, [tagA.id], "the ids were persisted");
    assert.deepEqual(tagB.tags.models[0].attrs, tagA.attrs);
    assert.equal(this.helper.db.tags.length, 2);
    assert.deepEqual(this.helper.db.tags[0], { id: "1", tagIds: null });
    assert.deepEqual(this.helper.db.tags[1], { id: "2", tagIds: ["1"] });
  });

  test("it sets up associations correctly when passing in an array of models", function(assert) {
    let { schema } = this.helper;
    let tagA = schema.tags.create();
    let tagB = schema.tags.create({
      tags: [tagA]
    });

    tagA.reload();

    assert.deepEqual(tagB.tagIds, [tagA.id]);
    assert.deepEqual(tagA.tagIds, [], "the inverse was not set");
    assert.deepEqual(tagB.attrs.tagIds, [tagA.id], "the ids were persisted");
    assert.deepEqual(tagA.attrs.tagIds, null, "the inverse was not set");
    assert.equal(this.helper.db.tags.length, 2);
  });

  test("it sets up associations correctly when passing in a collection", function(assert) {
    let { schema } = this.helper;
    let tagA = schema.tags.create();
    let tagB = schema.tags.create({
      tags: schema.tags.all()
    });

    tagA.reload();

    assert.deepEqual(tagB.tagIds, [tagA.id]);
    assert.deepEqual(tagA.tagIds, [], "the inverse was not set");
    assert.deepEqual(tagB.attrs.tagIds, [tagA.id]);
    assert.deepEqual(tagA.attrs.tagIds, null, "the inverse was not set");
    assert.equal(this.helper.db.tags.length, 2);
  });

  test("it throws an error if a model is passed in without a defined relationship", function(assert) {
    let { schema } = this.helper;

    assert.throws(function() {
      schema.tags.create({
        foo: schema.create("foo")
      });
    }, /you haven't defined that key as an association on your model/);
  });

  test("it throws an error if an array of models is passed in without a defined relationship", function(assert) {
    let { schema } = this.helper;

    assert.throws(function() {
      schema.tags.create({
        foos: [schema.create("foo")]
      });
    }, /you haven't defined that key as an association on your model/);
  });

  test("it throws an error if a collection is passed in without a defined relationship", function(assert) {
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
