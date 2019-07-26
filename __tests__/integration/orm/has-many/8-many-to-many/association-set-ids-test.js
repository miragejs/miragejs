import Helper, { states } from "./_helper";

describe("Integration | ORM | Has Many | Many to Many | association #setIds", () => {
  beforeEach(() =>  {
    this.helper = new Helper();
  });

  states.forEach(state => {
    test(`a ${state} can update its association to include a saved child via childIds`, () => {
      let [order, originalProducts] = this.helper[state]();
      let savedProduct = this.helper.savedChild();

      order.productIds = [savedProduct.id];

      expect(order.products.models[0].attrs).toEqual(savedProduct.attrs);
      expect(order.productIds).toEqual([savedProduct.id]);

      order.save();
      savedProduct.reload();

      expect(savedProduct.orders.models[0].attrs).toEqual(order.attrs);
      originalProducts.forEach(p => {
        if (p.isSaved()) {
          p.reload();
          expect(p.orders.includes(order)).toBeFalsy();
        }
      });
    });

    test(`a ${state} can clear its association via a null childIds`, () => {
      let [order, originalProducts] = this.helper[state]();

      order.productIds = null;

      expect(order.products.models).toEqual([]);
      expect(order.productIds).toEqual([]);

      order.save();

      originalProducts.forEach(p => {
        p.reload();
        expect(p.orders.includes(order)).toBeFalsy();
      });
    });
  });
});
