import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Has Many | Many to Many | association #new', {
  beforeEach() {
    this.helper = new Helper();
  }
});

/*
  The model can make a new unsaved belongs-to association, for all states
*/

states.forEach((state) => {

  test(`a ${state} can build a new associated child`, function(assert) {
    let [ order ] = this.helper[state]();
    let initialCount = order.products.models.length;

    let blueProduct = order.newProduct({ name: 'Blue' });

    assert.ok(!blueProduct.id, 'the child was not persisted');
    assert.equal(order.products.models.length, initialCount + 1);
    assert.equal(blueProduct.orders.models.length, 1, 'the inverse was set');

    blueProduct.save();

    assert.deepEqual(blueProduct.attrs, { id: blueProduct.id, name: 'Blue', orderIds: [ order.id ] }, 'the child was persisted');
    assert.equal(order.products.models.length, initialCount + 1, 'the collection size was increased');
    assert.ok(order.products.includes(blueProduct), 'the model was added to order.products');
    assert.ok(order.productIds.indexOf(blueProduct.id) > -1, 'the id was added to the fks array');
    assert.ok(blueProduct.orders.includes(order), 'the inverse was set');
  });

});
