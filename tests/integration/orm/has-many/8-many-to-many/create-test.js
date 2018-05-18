import Helper from './_helper';
import { Model } from 'ember-cli-mirage';
import { module, test } from 'qunit';

module('Integration | ORM | Has Many | Many to Many | create', function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
    this.helper.schema.registerModel('foo', Model);
  });

  test('it sets up associations correctly when passing in the foreign key', function(assert) {
    let { schema } = this.helper;
    let product = schema.products.create();
    let order = schema.orders.create({
      productIds: [ product.id ]
    });

    product.reload();

    assert.deepEqual(order.productIds, [ product.id ]);
    assert.deepEqual(product.orderIds, [ order.id ], 'the inverse was set');
    assert.deepEqual(order.attrs.productIds, [ product.id ], 'the ids were persisted');
    assert.deepEqual(product.attrs.orderIds, [ order.id ], 'the inverse ids were persisted');
    assert.deepEqual(order.products.models[0].attrs, product.attrs);
    assert.deepEqual(product.orders.models[0].attrs, order.attrs, 'the inverse was set');
    assert.equal(this.helper.db.orders.length, 1);
    assert.equal(this.helper.db.products.length, 1);
    assert.deepEqual(this.helper.db.orders[0], { id: '1', productIds: [ '1' ] });
    assert.deepEqual(this.helper.db.products[0], { id: '1', orderIds: [ '1' ] });
  });

  test('it sets up associations correctly when passing in an array of models', function(assert) {
    let { schema } = this.helper;
    let product = schema.products.create();
    let order = schema.orders.create({
      products: [ product ]
    });

    product.reload();

    assert.deepEqual(order.productIds, [ product.id ]);
    assert.deepEqual(product.orderIds, [ order.id ], 'the inverse was set');
    assert.deepEqual(order.attrs.productIds, [ product.id ], 'the ids were persisted');
    assert.deepEqual(product.attrs.orderIds, [ order.id ], 'the inverse was set');
    assert.equal(this.helper.db.orders.length, 1);
    assert.equal(this.helper.db.products.length, 1);
  });

  test('it sets up associations correctly when passing in a collection', function(assert) {
    let { schema } = this.helper;
    let product = schema.products.create();
    let order = schema.orders.create({
      products: schema.products.all()
    });

    product.reload();

    assert.deepEqual(order.productIds, [ product.id ]);
    assert.deepEqual(product.orderIds, [ order.id ], 'the inverse was set');
    assert.deepEqual(order.attrs.productIds, [ product.id ]);
    assert.deepEqual(product.attrs.orderIds, [ order.id ], 'the inverse was set');
    assert.equal(this.helper.db.orders.length, 1);
    assert.equal(this.helper.db.products.length, 1);
  });

  test('it throws an error if a model is passed in without a defined relationship', function(assert) {
    let { schema } = this.helper;

    assert.throws(function() {
      schema.orders.create({
        foo: schema.create('foo')
      });
    }, /you haven't defined that key as an association on your model/);
  });

  test('it throws an error if an array of models is passed in without a defined relationship', function(assert) {
    let { schema } = this.helper;

    assert.throws(function() {
      schema.orders.create({
        foos: [ schema.create('foo') ]
      });
    }, /you haven't defined that key as an association on your model/);
  });

  test('it throws an error if a collection is passed in without a defined relationship', function(assert) {
    let { schema } = this.helper;
    schema.foos.create();
    schema.foos.create();

    assert.throws(function() {
      schema.orders.create({
        foos: schema.foos.all()
      });
    }, /you haven't defined that key as an association on your model/);
  });
});
