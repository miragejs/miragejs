import Helper, { states } from "./_helper";

describe("Integration | ORM | Has Many | Many to Many | association #set", () => {
  beforeEach(() =>  {
    this.helper = new Helper();
  });

  /*
    The model can update its association via parent, for all states
  */
  states.forEach(state => {
    test(`a ${state} can update its association to a list of saved children`, () => {
      let [order, originalProducts] = this.helper[state]();
      let savedProduct = this.helper.savedChild();

      order.products = [savedProduct];

      expect(order.products.includes(savedProduct)).toBeTruthy();
      expect(order.productIds[0]).toEqual(savedProduct.id);
      expect(savedProduct.orders.includes(order)).toBeTruthy();

      order.save();

      originalProducts.forEach(p => {
        p.reload();
        expect(p.orders.includes(order)).toBeFalsy();
      });
    });

    test(`a ${state} can update its association to a new parent`, () => {
      let [order, originalProducts] = this.helper[state]();
      let newProduct = this.helper.newChild();

      order.products = [newProduct];

      expect(order.products.includes(newProduct)).toBeTruthy();
      expect(order.productIds[0]).toEqual(undefined);
      expect(newProduct.orders.includes(order)).toBeTruthy();

      order.save();

      originalProducts.forEach(p => {
        p.reload();
        expect(p.orders.includes(order)).toBeFalsy();
      });
    });

    test(`a ${state} can clear its association via an empty list`, () => {
      let [order, originalProducts] = this.helper[state]();

      order.products = [];

      expect(order.productIds).toBeEmpty();
      expect(order.products.models.length).toEqual(0);

      order.save();
      originalProducts.forEach(p => {
        p.reload();
        expect(p.orders.includes(order)).toBeFalsy();
      });
    });

    test(`a ${state} can clear its association via an empty list`, () => {
      let [order, originalProducts] = this.helper[state]();

      order.products = null;

      expect(order.productIds).toBeEmpty();
      expect(order.products.models.length).toEqual(0);

      order.save();

      originalProducts.forEach(p => {
        p.reload();
        expect(p.orders.includes(order)).toBeFalsy();
      });
    });
  });
});
