import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Has Many | Many to Many | delete', {
  beforeEach() {
    this.helper = new Helper();
  }
});

states.forEach((state) => {

  test(`deleting children updates the parent's foreign key for a ${state}`, function(assert) {
    let [ order, products ] = this.helper[state]();

    if (products && products.length) {
      products.forEach(t => t.destroy());
      order.reload();
    }

    assert.equal(order.products.length, 0);
    assert.equal(order.productIds.length, 0);
  });

});
