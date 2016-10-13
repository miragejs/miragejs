import Helper, { states } from './_helper';
import { module, test } from 'qunit';

module('Integration | ORM | Has Many | Many to Many | accessor', {
  beforeEach() {
    this.helper = new Helper();
  }
});

states.forEach((state) => {

  test(`the references of a ${state} are correct`, function(assert) {
    let [ order, products ] = this.helper[state]();

    assert.equal(order.products.models.length, products.length, 'the parent has the correct number of children');
    assert.equal(order.productIds.length, products.length, 'the parent has the correct number of children ids');

    products.forEach((p, i) => {
      assert.deepEqual(order.products.models[i], p, 'each child is in parent.children array');

      if (p.isSaved()) {
        assert.ok(order.productIds.indexOf(p.id) > -1, 'each saved child id is in parent.childrenIds array');
      }

      // Check the inverse
      assert.ok(p.orders.includes(order));
    });
  });

});
