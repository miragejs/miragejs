import "../../../lib/container";
import { Model, hasMany } from "../../../lib/index";
import Db from "../../../lib/db";
import Schema from "../../../lib/orm/schema";

describe("Integration | ORM | reinitialize associations", () => {
  // Model classes are defined statically, just like in a typical app
  let User = Model.extend({
    addresses: hasMany()
  });
  let Address = Model.extend();
  let schema;

  beforeEach(() => {
    schema = new Schema(new Db(), {
      address: Address,
      user: User
    });

    schema.addresses.create({ id: 1, country: "Hyrule" });
    schema.users.create({ id: 1, name: "Link", addressIds: [1] });
  });

  // By running two tests, we force the statically-defined classes to be
  // registered twice.
  test("safely initializes associations", () => {
    expect(schema.users.find(1).addresses.models[0].country).toEqual("Hyrule");
  });
  test("safely initializes associations again", () => {
    expect(schema.users.find(1).addresses.models[0].country).toEqual("Hyrule");
  });
});
