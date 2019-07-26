import Helper from "./_helper";

describe("Integration | ORM | Has Many | Many to Many | new", () => {
  beforeEach(() => {
    this.helper = new Helper();
    this.schema = this.helper.schema;
  });

  test("the parent accepts a saved child id", () => {
    let product = this.helper.savedChild();
    let order = this.schema.orders.new({
      productIds: [product.id]
    });

    expect(order.productIds).toEqual([product.id]);
    expect(order.products.includes(product)).toBeTruthy();
  });

  test("the parent errors if the children ids don't exist", () => {
    expect(function() {
      this.schema.orders.new({ productIds: [2] });
    }).toThrow();
  });

  test("the parent accepts null children foreign key", () => {
    let order = this.schema.orders.new({ productIds: null });

    expect(order.products.models.length).toEqual(0);
    expect(order.productIds).toBeEmpty();
    expect(order.attrs).toEqual({ productIds: null });
  });

  test("the parent accepts saved children", () => {
    let product = this.helper.savedChild();
    let order = this.schema.orders.new({ products: [product] });

    expect(order.productIds).toEqual([product.id]);
    expect(order.products.models[0]).toEqual(product);
  });

  test("the parent accepts new children", () => {
    let product = this.schema.products.new({ color: "Red" });
    let order = this.schema.orders.new({ products: [product] });

    expect(order.productIds).toEqual([undefined]);
    expect(order.products.models[0]).toEqual(product);
  });

  test("the parent accepts null children", () => {
    let order = this.schema.orders.new({ products: null });

    expect(order.products.models.length).toEqual(0);
    expect(order.productIds).toBeEmpty();
    expect(order.attrs).toEqual({ productIds: null });
  });

  test("the parent accepts children and child ids", () => {
    let product = this.helper.savedChild();
    let order = this.schema.orders.new({
      products: [product],
      productIds: [product.id]
    });

    expect(order.productIds).toEqual([product.id]);
    expect(order.products.models[0]).toEqual(product);
  });

  test("the parent accepts no reference to children or child ids as empty obj", () => {
    let order = this.schema.orders.new({});

    expect(order.productIds).toBeEmpty();
    expect(order.products.models).toBeEmpty();
    expect(order.attrs).toEqual({ productIds: null });
  });

  test("the parent accepts no reference to children or child ids", () => {
    let order = this.schema.orders.new();

    expect(order.productIds).toBeEmpty();
    expect(order.products.models).toBeEmpty();
    expect(order.attrs).toEqual({ productIds: null });
  });
});
