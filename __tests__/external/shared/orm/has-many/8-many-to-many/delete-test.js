import Helper, { states } from "./_helper";

describe("External | Shared | ORM | Has Many | Many to Many | delete", () => {
  let helper;
  beforeEach(() => {
    helper = new Helper();
  });
  afterEach(() => {
    helper.shutdown();
  });

  states.forEach((state) => {
    test(`deleting children updates the parent's foreign key for a ${state}`, () => {
      let [order, products] = helper[state]();

      if (products && products.length) {
        products.forEach((t) => t.destroy());
        order.reload();
      }

      expect(order.products).toHaveLength(0);
      expect(order.productIds).toHaveLength(0);
    });
  });
});
