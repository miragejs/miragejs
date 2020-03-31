import Helper, { states } from "./_helper";

describe("External | Shared | ORM | Has Many | Many to Many | association #setIds", () => {
  let helper;
  beforeEach(() => {
    helper = new Helper();
  });
  afterEach(() => {
    helper.shutdown();
  });

  states.forEach((state) => {
    test(`a ${state} can update its association to include a saved child via childIds`, () => {
      let [order, originalProducts] = helper[state]();
      let savedProduct = helper.savedChild();

      order.productIds = [savedProduct.id];

      expect(order.products.models[0].attrs).toEqual(savedProduct.attrs);
      expect(order.productIds).toEqual([savedProduct.id]);

      order.save();
      savedProduct.reload();

      expect(savedProduct.orders.models[0].attrs).toEqual(order.attrs);
      originalProducts.forEach((p) => {
        if (p.isSaved()) {
          p.reload();
          expect(p.orders.includes(order)).toBeFalsy();
        }
      });
    });

    test(`a ${state} can clear its association via a null childIds`, () => {
      let [order, originalProducts] = helper[state]();

      order.productIds = null;

      expect(order.products.models).toBeEmpty();
      expect(order.productIds).toBeEmpty();

      order.save();

      originalProducts.forEach((p) => {
        p.reload();
        expect(p.orders.includes(order)).toBeFalsy();
      });
    });
  });
});
