import Helper, { states } from "./_helper";

describe("Integration | ORM | Has Many | Many to Many | delete", function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
  });

  states.forEach(state => {
    test(`deleting children updates the parent's foreign key for a ${state}`, assert => {
      let [order, products] = this.helper[state]();

      if (products && products.length) {
        products.forEach(t => t.destroy());
        order.reload();
      }

      expect(order.products.length).toEqual(0);
      expect(order.productIds.length).toEqual(0);
    });
  });
});
