import { Model } from "@lib";

describe("Unit | Model", function () {
  test("it can be instantiated", () => {
    let model = new Model({}, "user");
    expect(model).toBeTruthy();
  });

  test("it cannot be instantiated without a schema", () => {
    expect(function () {
      new Model();
    }).toThrow("A model requires a schema");
  });

  test("it cannot be instantiated without a modelName", () => {
    expect(function () {
      new Model({});
    }).toThrow("A model requires a modelName");
  });

  test("findBelongsToAssociation returns association for given type if defined", () => {
    let ModelClass = Model.extend();
    let authorAssociationMock = {};
    ModelClass.prototype.belongsToAssociations = {
      author: authorAssociationMock,
    };

    expect(ModelClass.findBelongsToAssociation("article")).toBeUndefined();
    expect(ModelClass.findBelongsToAssociation("author")).toEqual(
      authorAssociationMock
    );
  });
});
