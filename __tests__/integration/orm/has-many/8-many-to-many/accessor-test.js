import Helper, { states } from './_helper';
import { module, test } from 'qunit';

describe('Integration | ORM | Has Many | Many to Many | accessor', function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
  });

  states.forEach((state) => {

    test(`the references of a ${state} are correct`, assert => {
      let [ order, products ] = this.helper[state]();

      expect(order.products.models.length).toEqual(products.length);
      expect(order.productIds.length).toEqual(products.length);

      products.forEach(p => {
        expect(order.products.includes(p)).toBeTruthy();

        if (p.isSaved()) {
          expect(order.productIds.indexOf(p.id) > -1).toBeTruthy();
        }

        // Check the inverse
        expect(p.orders.includes(order)).toBeTruthy();
      });
    });

  });
});
