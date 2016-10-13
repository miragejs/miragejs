import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Has Many | Many to Many | association #set', {
  beforeEach() {
    this.helper = new Helper();
  }
});

/*
  The model can update its association via parent, for all states
*/
states.forEach((state) => {

  test(`a ${state} can update its association to a list of saved children`, function(assert) {
    let [ order, originalProducts ] = this.helper[state]();
    let savedProduct = this.helper.savedChild();

    order.products = [ savedProduct ];

    assert.ok(order.products.includes(savedProduct));
    assert.equal(order.productIds[0], savedProduct.id);
    assert.ok(savedProduct.orders.includes(order), 'the inverse was set');

    order.save();

    originalProducts.forEach(p => {
      p.reload();
      assert.notOk(p.orders.includes(order), 'old inverses were cleared');
    });
  });

  test(`a ${state} can update its association to a new parent`, function(assert) {
    let [ order, originalProducts ] = this.helper[state]();
    let newProduct = this.helper.newChild();

    order.products = [ newProduct ];

    assert.ok(order.products.includes(newProduct));
    assert.equal(order.productIds[0], undefined);
    assert.ok(newProduct.orders.includes(order), 'the inverse was set');

    order.save();

    originalProducts.forEach(p => {
      p.reload();
      assert.notOk(p.orders.includes(order), 'old inverses were cleared');
    });
  });

  test(`a ${state} can clear its association via an empty list`, function(assert) {
    let [ order, originalProducts ] = this.helper[state]();

    order.products = [ ];

    assert.deepEqual(order.productIds, [ ]);
    assert.equal(order.products.models.length, 0);

    order.save();
    originalProducts.forEach(p => {
      p.reload();
      assert.notOk(p.orders.includes(order), 'old inverses were cleared');
    });
  });

  test(`a ${state} can clear its association via an empty list`, function(assert) {
    let [ order, originalProducts ] = this.helper[state]();

    order.products = null;

    assert.deepEqual(order.productIds, [ ]);
    assert.equal(order.products.models.length, 0);

    order.save();

    originalProducts.forEach(p => {
      p.reload();
      assert.notOk(p.orders.includes(order), 'old inverses were cleared');
    });
  });

});
