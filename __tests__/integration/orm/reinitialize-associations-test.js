// jscs:disable disallowVar
import {
  Model,
  hasMany,
  _ormSchema as Schema,
  _Db as Db
} from "@miragejs/server";

// Model classes are defined statically, just like in a typical app
var User = Model.extend({
  addresses: hasMany()
});
var Address = Model.extend();

describe("Integration | ORM | reinitialize associations", function(hooks) {
  hooks.beforeEach(function() {
    this.schema = new Schema(new Db(), {
      address: Address,
      user: User
    });

    this.schema.addresses.create({ id: 1, country: "Hyrule" });
    this.schema.users.create({ id: 1, name: "Link", addressIds: [1] });
  });

  // By running two tests, we force the statically-defined classes to be
  // registered twice.
  test("safely initializes associations", () => {
    expect(this.schema.users.find(1).addresses.models[0].country).toEqual(
      "Hyrule"
    );
  });
  test("safely initializes associations again", () => {
    expect(this.schema.users.find(1).addresses.models[0].country).toEqual(
      "Hyrule"
    );
  });
});
