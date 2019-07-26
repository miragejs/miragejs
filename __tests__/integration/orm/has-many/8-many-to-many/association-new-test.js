import Helper, { states } from "./_helper";

describe("Integration | ORM | Has Many | Many to Many | association #new", function(hooks) {
  hooks.beforeEach(function() {
    this.helper = new Helper();
  });

  /*
    The model can make a new unsaved belongs-to association, for all states
  */

  states.forEach(state => {
    test(`a ${state} can build a new associated child`, () => {
      let [order] = this.helper[state]();
      let initialCount = order.products.models.length;

      let blueProduct = order.newProduct({ name: "Blue" });

      expect(!blueProduct.id).toBeTruthy();
      expect(order.products.models.length).toEqual(initialCount + 1);
      expect(blueProduct.orders.models.length).toEqual(1);

      blueProduct.save();

      expect(blueProduct.attrs).toEqual({
        id: blueProduct.id,
        name: "Blue",
        orderIds: [order.id]
      });
      expect(order.products.models.length).toEqual(initialCount + 1);
      expect(order.products.includes(blueProduct)).toBeTruthy();
      expect(order.productIds.indexOf(blueProduct.id) > -1).toBeTruthy();
      expect(blueProduct.orders.includes(order)).toBeTruthy();
    });
  });
});
