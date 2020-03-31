import { Server, Model, hasMany } from "miragejs";

/*
  A model with a hasMany association can be in eight states
  with respect to its association. This helper class
  returns a parent (and its children) in these various states.

  The return value is an array of the form

    [ parent, [child1, child2...] ]

  where the children array may be empty.
*/
export default class Helper {
  constructor() {
    // implicit inverse
    this.server = new Server({
      environment: "test",
      models: {
        order: Model.extend({
          products: hasMany(),
        }),
        product: Model.extend({
          orders: hasMany(),
        }),
      },
    });

    this.db = this.server.db;
    this.schema = this.server.schema;
  }

  shutdown() {
    this.server.shutdown();
  }

  savedParentNoChildren() {
    let order = this.db.orders.insert({ name: "Red" });

    return [this.schema.orders.find(order.id), []];
  }

  savedParentNewChildren() {
    let order = this.schema.orders.create({ name: "Red" });
    let product1 = this.schema.products.new({ name: "Blue" });
    let product2 = this.schema.products.new({ name: "Green" });

    order.products = [product1, product2];

    return [order, [product1, product2]];
  }

  savedParentSavedChildren() {
    let { schema } = this;
    schema.db.orders.insert([{ id: "1", name: "Red", productIds: ["2", "3"] }]);
    schema.db.products.insert([
      { id: "2", name: "Blue", orderIds: ["1"] },
      { id: "3", name: "Green", orderIds: ["1"] },
    ]);

    return [
      schema.orders.find(1),
      [schema.products.find(2), schema.products.find(3)],
    ];
  }

  savedParentMixedChildren() {
    this.schema.db.orders.insert([{ id: "1", name: "Red", productIds: ["2"] }]);
    this.schema.db.products.insert([
      { id: "2", name: "Blue", orderIds: ["1"] },
    ]);
    let order = this.schema.orders.find(1);
    let product1 = this.schema.products.find(2);
    let product2 = this.schema.products.new({ name: "Green" });

    order.products = [product1, product2];

    return [order, [product1, product2]];
  }

  newParentNoChildren() {
    let order = this.schema.orders.new({ name: "Red" });

    return [order, []];
  }

  newParentNewChildren() {
    let order = this.schema.orders.new({ name: "Red" });
    let product1 = this.schema.products.new({ name: "Blue" });
    let product2 = this.schema.products.new({ name: "Green" });

    order.products = [product1, product2];

    return [order, [product1, product2]];
  }

  newParentSavedChildren() {
    let order = this.schema.orders.new({ name: "Red" });
    let product1 = this.schema.products.create({ name: "Blue" });
    let product2 = this.schema.products.create({ name: "Green" });

    order.products = [product1, product2];

    return [order, [product1, product2]];
  }

  newParentMixedChildren() {
    let order = this.schema.orders.new({ name: "Red" });
    let product1 = this.schema.products.create({ name: "Blue" });
    let product2 = this.schema.products.new({ name: "Green" });

    order.products = [product1, product2];

    return [order, [product1, product2]];
  }

  // Unassociated child models, used for setting tests
  savedChild() {
    let insertedProduct = this.db.products.insert({ name: "Blue" });

    return this.schema.products.find(insertedProduct.id);
  }

  newChild() {
    return this.schema.products.new({ name: "Blue" });
  }
}

export const states = [
  "savedParentNoChildren",
  "savedParentNewChildren",
  "savedParentMixedChildren",
  "savedParentSavedChildren",
  "newParentNoChildren",
  "newParentNewChildren",
  "newParentSavedChildren",
  "newParentMixedChildren",
];
