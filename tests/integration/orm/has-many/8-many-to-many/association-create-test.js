import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Has Many | Many to Many | association #create', {
  beforeEach() {
    this.helper = new Helper();
  }
});

/*
  The model can create a has-many association, for all states
*/
states.forEach((state) => {

  test(`a ${state} can create an associated child`, function(assert) {
    let [ order ] = this.helper[state]();
    let initialCount = order.products.models.length;

    let orangeProduct = order.createProduct({ name: 'Orange' });

    assert.ok(orangeProduct.id, 'the child was persisted');
    assert.equal(order.products.models.length, initialCount + 1, 'the collection size was increased');
    assert.ok(order.products.includes(orangeProduct), 'the model was added to order.products');
    assert.ok(order.productIds.indexOf(orangeProduct.id) > -1, 'the id was added to the fks array');
    assert.ok(order.attrs.productIds.indexOf(orangeProduct.id) > -1, 'fks were persisted');
    assert.ok(orangeProduct.orders.includes(order), 'the inverse was set');
  });

});
