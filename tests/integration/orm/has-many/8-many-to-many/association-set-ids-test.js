import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Has Many | Many to Many | association #setIds', {
  beforeEach() {
    this.helper = new Helper();
  }
});

states.forEach((state) => {

  test(`a ${state} can update its association to include a saved child via childIds`, function(assert) {
    let [ order, originalProducts ] = this.helper[state]();
    let savedProduct = this.helper.savedChild();

    order.productIds = [ savedProduct.id ];

    assert.deepEqual(order.products.models[0].attrs, savedProduct.attrs);
    assert.deepEqual(order.productIds, [ savedProduct.id ]);

    order.save();
    savedProduct.reload();

    assert.deepEqual(savedProduct.orders.models[0].attrs, order.attrs, 'the inverse was set');
    originalProducts.forEach(p => {
      if (p.isSaved()) {
        p.reload();
        assert.notOk(p.orders.includes(order), 'old inverses were cleared');
      }
    });
  });

  test(`a ${state} can clear its association via a null childIds`, function(assert) {
    let [ order, originalProducts ] = this.helper[state]();

    order.productIds = null;

    assert.deepEqual(order.products.models, []);
    assert.deepEqual(order.productIds, []);

    order.save();

    originalProducts.forEach(p => {
      p.reload();
      assert.notOk(p.orders.includes(order), 'old inverses were cleared');
    });
  });

});
