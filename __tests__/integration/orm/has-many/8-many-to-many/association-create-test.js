import Helper, { states } from "./_helper";

describe("Integration | ORM | Has Many | Many to Many | association #create", function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
  });

  /*
    The model can create a has-many association, for all states
  */
  states.forEach(state => {
    test(`a ${state} can create an associated child`, assert => {
      let [order] = this.helper[state]();
      let initialCount = order.products.models.length;

      let orangeProduct = order.createProduct({ name: "Orange" });

      expect(orangeProduct.id).toBeTruthy();
      expect(order.products.models.length).toEqual(initialCount + 1);
      expect(order.products.includes(orangeProduct)).toBeTruthy();
      expect(order.productIds.indexOf(orangeProduct.id) > -1).toBeTruthy();
      expect(
        order.attrs.productIds.indexOf(orangeProduct.id) > -1
      ).toBeTruthy();
      expect(orangeProduct.orders.includes(order)).toBeTruthy();
    });
  });
});
