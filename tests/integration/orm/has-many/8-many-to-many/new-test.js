import Helper from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Has Many | Many to Many | new', {
  beforeEach() {
    this.helper = new Helper();
    this.schema = this.helper.schema;
  }
});

test('the parent accepts a saved child id', function(assert) {
  let product = this.helper.savedChild();
  let order = this.schema.orders.new({
    productIds: [ product.id ]
  });

  assert.deepEqual(order.productIds, [ product.id ]);
  assert.deepEqual(order.products.models[0], product);
});

test('the parent errors if the children ids don\'t exist', function(assert) {
  assert.throws(function() {
    this.schema.orders.new({ productIds: [ 2 ] });
  }, /You're instantiating a order that has a productIds of 2, but some of those records don't exist in the database/);
});

test('the parent accepts null children foreign key', function(assert) {
  let order = this.schema.orders.new({ productIds: null });

  assert.equal(order.products.models.length, 0);
  assert.deepEqual(order.productIds, []);
  assert.deepEqual(order.attrs, { productIds: null });
});

test('the parent accepts saved children', function(assert) {
  let product = this.helper.savedChild();
  let order = this.schema.orders.new({ products: [ product ] });

  assert.deepEqual(order.productIds, [ product.id ]);
  assert.deepEqual(order.products.models[0], product);
});

test('the parent accepts new children', function(assert) {
  let product = this.schema.products.new({ color: 'Red' });
  let order = this.schema.orders.new({ products: [ product ] });

  assert.deepEqual(order.productIds, [ undefined ]);
  assert.deepEqual(order.products.models[0], product);
});

test('the parent accepts null children', function(assert) {
  let order = this.schema.orders.new({ products: null });

  assert.equal(order.products.models.length, 0);
  assert.deepEqual(order.productIds, []);
  assert.deepEqual(order.attrs, { productIds: null });
});

test('the parent accepts children and child ids', function(assert) {
  let product = this.helper.savedChild();
  let order = this.schema.orders.new({ products: [ product ], productIds: [ product.id ] });

  assert.deepEqual(order.productIds, [ product.id ]);
  assert.deepEqual(order.products.models[0], product);
});

test('the parent accepts no reference to children or child ids as empty obj', function(assert) {
  let order = this.schema.orders.new({});

  assert.deepEqual(order.productIds, []);
  assert.deepEqual(order.products.models, []);
  assert.deepEqual(order.attrs, { productIds: null });
});

test('the parent accepts no reference to children or child ids', function(assert) {
  let order = this.schema.orders.new();

  assert.deepEqual(order.productIds, []);
  assert.deepEqual(order.products.models, []);
  assert.deepEqual(order.attrs, { productIds: null });
});
