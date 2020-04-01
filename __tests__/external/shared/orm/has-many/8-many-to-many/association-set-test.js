import Helper, { states } from "./_helper";

describe("External | Shared | ORM | Has Many | Many to Many | association #set", () => {
  let helper;
  beforeEach(() => {
    helper = new Helper();
  });
  afterEach(() => {
    helper.shutdown();
  });

  /*
    The model can update its association via parent, for all states
  */
  states.forEach((state) => {
    test(`a ${state} can update its association to a list of saved children`, () => {
      let [order, originalProducts] = helper[state]();
      let savedProduct = helper.savedChild();

      order.products = [savedProduct];

      expect(order.products.includes(savedProduct)).toBeTruthy();
      expect(order.productIds[0]).toEqual(savedProduct.id);
      expect(savedProduct.orders.includes(order)).toBeTruthy();

      order.save();

      originalProducts.forEach((p) => {
        p.reload();
        expect(p.orders.includes(order)).toBeFalsy();
      });
    });

    test(`a ${state} can update its association to a new parent`, () => {
      let [order, originalProducts] = helper[state]();
      let newProduct = helper.newChild();

      order.products = [newProduct];

      expect(order.products.includes(newProduct)).toBeTruthy();
      expect(order.productIds[0]).toBeUndefined();
      expect(newProduct.orders.includes(order)).toBeTruthy();

      order.save();

      originalProducts.forEach((p) => {
        p.reload();
        expect(p.orders.includes(order)).toBeFalsy();
      });
    });

    test(`a ${state} can clear its association via an empty list`, () => {
      let [order, originalProducts] = helper[state]();

      order.products = [];

      expect(order.productIds).toBeEmpty();
      expect(order.products.models).toHaveLength(0);

      order.save();
      originalProducts.forEach((p) => {
        p.reload();
        expect(p.orders.includes(order)).toBeFalsy();
      });
    });

    test(`a ${state} can clear its association via an empty list`, () => {
      let [order, originalProducts] = helper[state]();

      order.products = null;

      expect(order.productIds).toBeEmpty();
      expect(order.products.models).toHaveLength(0);

      order.save();

      originalProducts.forEach((p) => {
        p.reload();
        expect(p.orders.includes(order)).toBeFalsy();
      });
    });
  });
});
