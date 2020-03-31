import Helper, { states } from "./_helper";

describe("External | Shared | ORM | Has Many | Many to Many | accessor", () => {
  let helper;
  beforeEach(() => {
    helper = new Helper();
  });
  afterEach(() => {
    helper.shutdown();
  });

  states.forEach((state) => {
    test(`the references of a ${state} are correct`, () => {
      let [order, products] = helper[state]();

      expect(order.products.models).toHaveLength(products.length);
      expect(order.productIds).toHaveLength(products.length);

      products.forEach((p) => {
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
