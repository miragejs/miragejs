import Helper from './_helper';
import { module, test } from 'qunit';

describe('Integration | ORM | Has Many | Many to Many | new', function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
    this.schema = this.helper.schema;
  });

  test('the parent accepts a saved child id', assert => {
    let product = this.helper.savedChild();
    let order = this.schema.orders.new({
      productIds: [ product.id ]
    });

    expect(order.productIds).toEqual([ product.id ]);
    expect(order.products.includes(product)).toBeTruthy();
  });

  test('the parent errors if the children ids don\'t exist', assert => {
    expect(function() {
      this.schema.orders.new({ productIds: [ 2 ] });
    }).toThrow();
  });

  test('the parent accepts null children foreign key', assert => {
    let order = this.schema.orders.new({ productIds: null });

    expect(order.products.models.length).toEqual(0);
    expect(order.productIds).toEqual([]);
    expect(order.attrs).toEqual({ productIds: null });
  });

  test('the parent accepts saved children', assert => {
    let product = this.helper.savedChild();
    let order = this.schema.orders.new({ products: [ product ] });

    expect(order.productIds).toEqual([ product.id ]);
    expect(order.products.models[0]).toEqual(product);
  });

  test('the parent accepts new children', assert => {
    let product = this.schema.products.new({ color: 'Red' });
    let order = this.schema.orders.new({ products: [ product ] });

    expect(order.productIds).toEqual([ undefined ]);
    expect(order.products.models[0]).toEqual(product);
  });

  test('the parent accepts null children', assert => {
    let order = this.schema.orders.new({ products: null });

    expect(order.products.models.length).toEqual(0);
    expect(order.productIds).toEqual([]);
    expect(order.attrs).toEqual({ productIds: null });
  });

  test('the parent accepts children and child ids', assert => {
    let product = this.helper.savedChild();
    let order = this.schema.orders.new({ products: [ product ], productIds: [ product.id ] });

    expect(order.productIds).toEqual([ product.id ]);
    expect(order.products.models[0]).toEqual(product);
  });

  test('the parent accepts no reference to children or child ids as empty obj', assert => {
    let order = this.schema.orders.new({});

    expect(order.productIds).toEqual([]);
    expect(order.products.models).toEqual([]);
    expect(order.attrs).toEqual({ productIds: null });
  });

  test('the parent accepts no reference to children or child ids', assert => {
    let order = this.schema.orders.new();

    expect(order.productIds).toEqual([]);
    expect(order.products.models).toEqual([]);
    expect(order.attrs).toEqual({ productIds: null });
  });
});
