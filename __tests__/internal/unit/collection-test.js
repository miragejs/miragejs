import Collection from "@lib/orm/collection";

describe("Unit | Collection", function () {
  test("it can be instantiated", () => {
    let collection = new Collection("plant");

    expect(collection).toBeTruthy();
  });

  test("it cannot be instantiated without a modelName", () => {
    expect(() => {
      new Collection();
    }).toThrow(/must pass a `modelName`/);
  });

  test("it knows its modelname", () => {
    let collection = new Collection("author");

    expect(collection.modelName).toBe("author");
  });

  test("it can be instantiated with an array of models", () => {
    let models = [{ id: 1 }, { id: 2 }, { id: 3 }];
    let collection = new Collection("author", models);

    expect(collection).toBeTruthy();
  });

  test("#models returns the underlying array", () => {
    let models = [{ id: 1 }, { id: 2 }, { id: 3 }];
    let collection = new Collection("author", models);

    expect(collection.models).toEqual(models);
  });

  test("#length returns the number of elements", () => {
    let models = [{ id: 1 }, { id: 2 }];
    let collection = new Collection("post", models);

    expect(collection).toHaveLength(2);

    collection.models = [{ id: 1 }];
    expect(collection).toHaveLength(1);
  });
});
